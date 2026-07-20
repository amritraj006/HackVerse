#!/usr/bin/env node
/**
 * HackVerse API Integration Test Suite
 * Tests all major API endpoints end-to-end
 */
require('dotenv').config();
const http = require('http');

const BASE_URL = 'http://localhost:5001';
let adminToken = '';
let judgeToken = '';
let participantToken = '';
let hackathonId = '';
let submissionId = '';

// Minimal HTTP helper
function request(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const options = {
      hostname: 'localhost',
      port: 5001,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
      },
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => { responseData += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(responseData) });
        } catch {
          resolve({ status: res.statusCode, body: responseData });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

function assert(label, condition, detail = '') {
  const icon = condition ? '✅' : '❌';
  console.log(`  ${icon} ${label}${detail ? ` — ${detail}` : ''}`);
  if (!condition) process.exitCode = 1;
}

async function run() {
  console.log('\n🧪 HackVerse API Integration Tests\n');

  // ── AUTH ─────────────────────────────────────────────────────────────
  console.log('▶ Auth Module');

  const loginAdmin = await request('POST', '/api/auth/login', {
    email: 'admin@hackverse.com',
    password: 'password123',
  });
  assert('Admin login (200)', loginAdmin.status === 200);
  adminToken = loginAdmin.body?.data?.token;
  assert('Admin token received', !!adminToken);

  const loginJudge = await request('POST', '/api/auth/login', {
    email: 'judge1@hackverse.com',
    password: 'password123',
  });
  assert('Judge login (200)', loginJudge.status === 200);
  judgeToken = loginJudge.body?.data?.token;

  const loginParticipant = await request('POST', '/api/auth/login', {
    email: 'user1@hackverse.com',
    password: 'password123',
  });
  assert('Participant login (200)', loginParticipant.status === 200);
  participantToken = loginParticipant.body?.data?.token;

  const profile = await request('GET', '/api/auth/profile', null, adminToken);
  assert('Get own profile (200)', profile.status === 200);
  assert('Profile has correct role', profile.body?.data?.user?.role === 'admin');

  const badLogin = await request('POST', '/api/auth/login', {
    email: 'admin@hackverse.com',
    password: 'wrongpassword',
  });
  assert('Bad credentials rejected (400)', badLogin.status === 400);

  // ── HACKATHONS ────────────────────────────────────────────────────────
  console.log('\n▶ Hackathons Module');

  const listAll = await request('GET', '/api/hackathons');
  assert('List all hackathons (200)', listAll.status === 200);
  const hackathons = listAll.body?.data?.hackathons || [];
  assert('Returns 3 seeded hackathons', hackathons.length === 3, `count=${hackathons.length}`);

  const ongoingHack = hackathons.find(h => h.status === 'ongoing');
  assert('Ongoing hackathon exists', !!ongoingHack, ongoingHack?.title);
  hackathonId = ongoingHack?._id;

  const filtered = await request('GET', '/api/hackathons?status=upcoming');
  assert('Filter by status=upcoming (200)', filtered.status === 200);
  assert('Filter returns only upcoming', filtered.body?.data?.hackathons?.every(h => h.status === 'upcoming'));

  const searched = await request('GET', '/api/hackathons?search=AI');
  assert('Search by keyword "AI" (200)', searched.status === 200);
  assert('Search returns relevant results', (searched.body?.data?.hackathons?.length || 0) > 0);

  const detail = await request('GET', `/api/hackathons/${hackathonId}`);
  assert('Get hackathon detail (200)', detail.status === 200);
  assert('Detail includes judges array', Array.isArray(detail.body?.data?.hackathon?.judges));

  // ── USERS (Admin-only) ────────────────────────────────────────────────
  console.log('\n▶ Users Module');

  const userList = await request('GET', '/api/users', null, adminToken);
  assert('Admin can list all users (200)', userList.status === 200);
  assert('Returns all 14 seeded users', userList.body?.data?.users?.length === 14, `count=${userList.body?.data?.users?.length}`);

  const participantForbidden = await request('GET', '/api/users', null, participantToken);
  assert('Participant cannot list users (403)', participantForbidden.status === 403);

  const judgesList = await request('GET', '/api/users/judges', null, adminToken);
  assert('Admin can list judges (200)', judgesList.status === 200);
  assert('Returns 3 judges', judgesList.body?.data?.judges?.length === 3, `count=${judgesList.body?.data?.judges?.length}`);

  // ── DASHBOARD STATS ───────────────────────────────────────────────────
  console.log('\n▶ Dashboard Module');

  const adminStats = await request('GET', '/api/dashboard/stats', null, adminToken);
  assert('Admin dashboard stats (200)', adminStats.status === 200);
  assert('Admin stats has user role breakdown', !!adminStats.body?.data?.users);
  assert('Admin stats has hackathon status counts', !!adminStats.body?.data?.hackathons);

  const judgeStats = await request('GET', '/api/dashboard/stats', null, judgeToken);
  assert('Judge dashboard stats (200)', judgeStats.status === 200);
  assert('Judge stats includes pending reviews count', judgeStats.body?.data?.pendingReviewsCount !== undefined);

  const participantStats = await request('GET', '/api/dashboard/stats', null, participantToken);
  assert('Participant dashboard stats (200)', participantStats.status === 200);
  assert('Participant stats includes registrations', Array.isArray(participantStats.body?.data?.registrations));

  // ── REGISTRATIONS ─────────────────────────────────────────────────────
  console.log('\n▶ Registrations Module');

  // Register a fresh participant (user2) for the ongoing hackathon
  const loginUser2 = await request('POST', '/api/auth/login', {
    email: 'user2@hackverse.com',
    password: 'password123',
  });
  const user2Token = loginUser2.body?.data?.token;

  const register = await request('POST', '/api/registrations', { hackathonId }, user2Token);
  // Could be 201 (first time) or 400 (already registered from seed)
  assert('Registration returns 201 or 400', register.status === 201 || register.status === 400);

  const regStatus = await request('GET', `/api/registrations/my/${hackathonId}`, null, user2Token);
  assert('Check registration status (200)', regStatus.status === 200);

  const hackRegs = await request('GET', `/api/registrations/hackathon/${hackathonId}`, null, adminToken);
  assert('Admin can list hackathon registrations (200)', hackRegs.status === 200);
  assert('Registrations is array', Array.isArray(hackRegs.body?.data?.registrations));

  // ── SUBMISSIONS & LEADERBOARD ─────────────────────────────────────────
  console.log('\n▶ Submissions & Leaderboard Module');

  const completedHack = hackathons.find(h => h.status === 'completed');
  const completedId = completedHack?._id;

  const submissionsList = await request('GET', `/api/submissions/hackathon/${completedId}`, null, adminToken);
  assert('Admin can list submissions (200)', submissionsList.status === 200);
  const subs = submissionsList.body?.data?.submissions || [];
  assert('Returns 2 seeded submissions', subs.length === 2, `count=${subs.length}`);
  submissionId = subs[0]?._id;

  const subDetail = await request('GET', `/api/submissions/${submissionId}`, null, adminToken);
  assert('Get submission detail (200)', subDetail.status === 200);
  assert('Submission has projectName', !!subDetail.body?.data?.submission?.projectName);

  const leaderboard = await request('GET', `/api/reviews/leaderboard/${completedId}`, null, adminToken);
  assert('Get leaderboard (200)', leaderboard.status === 200);
  const board = leaderboard.body?.data?.leaderboard || [];
  assert('Leaderboard has 2 entries', board.length === 2, `count=${board.length}`);
  assert('Top entry is BlockPay with score ~8.50', board[0]?.projectName === 'BlockPay Decentralized Invoices', board[0]?.projectName);
  assert('Scores are correctly aggregated', Math.abs(board[0]?.averageScore - 8.5) < 0.01, `score=${board[0]?.averageScore}`);

  // ── REVIEWS ───────────────────────────────────────────────────────────
  console.log('\n▶ Reviews Module');

  const subReviews = await request('GET', `/api/reviews/submission/${submissionId}`, null, adminToken);
  assert('Get submission reviews (200)', subReviews.status === 200);
  assert('2 reviews exist for submission', subReviews.body?.data?.reviews?.length === 2);

  const judgeReviews = await request('GET', '/api/reviews/judge', null, judgeToken);
  assert('Judge can get their reviews (200)', judgeReviews.status === 200);

  // Participant cannot access submission reviews
  const participantForbiddenReview = await request('GET', `/api/reviews/submission/${submissionId}`, null, participantToken);
  assert('Participant cannot see reviews (403)', participantForbiddenReview.status === 403);

  // ── UNAUTH / MISSING TOKEN ─────────────────────────────────────────────
  console.log('\n▶ Auth Guard Tests');

  const noToken = await request('GET', '/api/auth/profile');
  assert('No token → 401', noToken.status === 401);

  const invalidToken = await request('GET', '/api/auth/profile', null, 'bad.token.value');
  assert('Invalid token → 401', invalidToken.status === 401);

  const notFound = await request('GET', '/api/hackathons/000000000000000000000000');
  assert('Non-existent hackathon → 404', notFound.status === 404);

  // ── SIGNUP VALIDATION ─────────────────────────────────────────────────
  console.log('\n▶ Validation Tests');

  const badSignup = await request('POST', '/api/auth/signup', {
    email: 'not-an-email',
    password: '123',
  });
  assert('Invalid signup body → 400', badSignup.status === 400);
  assert('Returns structured validation errors', Array.isArray(badSignup.body?.errors));

  const duplicateEmail = await request('POST', '/api/auth/signup', {
    name: 'Duplicate',
    email: 'admin@hackverse.com',
    password: 'password123',
  });
  assert('Duplicate email → 400', duplicateEmail.status === 400);

  // ── DONE ──────────────────────────────────────────────────────────────
  console.log('\n' + '─'.repeat(50));
  if (process.exitCode === 1) {
    console.log('❌ Some tests FAILED. Review the results above.\n');
  } else {
    console.log('✅ All tests PASSED — backend API is fully operational.\n');
  }
}

run().catch((err) => {
  console.error('\n🚨 Test runner crashed:', err.message);
  process.exit(1);
});
