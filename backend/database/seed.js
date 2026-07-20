require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/user.model');
const Hackathon = require('../models/hackathon.model');
const Team = require('../models/team.model');
const Registration = require('../models/registration.model');
const Submission = require('../models/submission.model');
const Review = require('../models/review.model');
const { ROLES, HACKATHON_STATUS, REGISTRATION_STATUS } = require('../constants/roles');

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hackverse';
    await mongoose.connect(mongoUri);
    console.log('Seed: Connected to MongoDB.');

    // Clear old data
    await User.deleteMany({});
    await Hackathon.deleteMany({});
    await Team.deleteMany({});
    await Registration.deleteMany({});
    await Submission.deleteMany({});
    await Review.deleteMany({});
    console.log('Seed: Cleared old collections.');

    // 1. Create Users
    const admin = await User.create({
      name: 'Alice Admin',
      email: 'admin@hackverse.com',
      password: 'password123',
      role: ROLES.ADMIN,
      bio: 'System Administrator of HackVerse.',
    });

    const org1 = await User.create({
      name: 'Owen Organizer',
      email: 'organizer1@hackverse.com',
      password: 'password123',
      role: ROLES.ORGANIZER,
      bio: 'Tech Event Manager at Stanford.',
    });

    const org2 = await User.create({
      name: 'Olivia Organizer',
      email: 'organizer2@hackverse.com',
      password: 'password123',
      role: ROLES.ORGANIZER,
      bio: 'Director of Innovation at Google.',
    });

    const judge1 = await User.create({
      name: 'Jack Judge',
      email: 'judge1@hackverse.com',
      password: 'password123',
      role: ROLES.JUDGE,
      bio: 'Senior Staff Engineer and Open Source Contributor.',
      skills: ['React', 'Node.js', 'Kubernetes'],
    });

    const judge2 = await User.create({
      name: 'Julia Judge',
      email: 'judge2@hackverse.com',
      password: 'password123',
      role: ROLES.JUDGE,
      bio: 'Venture Capitalist focused on early-stage Tech.',
      skills: ['Product Design', 'Business Model', 'AI/ML'],
    });

    const judge3 = await User.create({
      name: 'Jerry Judge',
      email: 'judge3@hackverse.com',
      password: 'password123',
      role: ROLES.JUDGE,
      bio: 'CTO of FinTech Inc.',
      skills: ['Finance', 'Security', 'Cryptography'],
    });

    // Create 8 participants
    const participants = [];
    for (let i = 1; i <= 8; i++) {
      const part = await User.create({
        name: `Participant ${i}`,
        email: `user${i}@hackverse.com`,
        password: 'password123',
        role: ROLES.PARTICIPANT,
        bio: `Full Stack Developer looking to build awesome things! #${i}`,
        skills: i % 2 === 0 ? ['React', 'CSS', 'JavaScript'] : ['Node.js', 'MongoDB', 'Python'],
      });
      participants.push(part);
    }
    console.log('Seed: Created Users successfully.');

    // 2. Create Hackathons
    const now = new Date();

    // Hackathon 1: Upcoming
    const hackUpcoming = await Hackathon.create({
      title: 'EduHack 2026: The Classroom of Tomorrow',
      description: 'Design and build software tools that solve accessibility, grading, and engagement problems in classrooms around the globe.',
      requirements: 'All projects must include a functional web prototype and be submitted with a slide deck.',
      organizer: org1._id,
      startDate: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000), // in 15 days
      endDate: new Date(now.getTime() + 18 * 24 * 60 * 60 * 1000), // ends in 18 days
      registrationDeadline: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000), // deadline in 10 days
      mode: 'online',
      theme: 'Education Tech',
      status: HACKATHON_STATUS.UPCOMING,
      minTeamSize: 2,
      maxTeamSize: 4,
      bannerImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80',
      judges: [judge1._id, judge2._id],
    });

    // Hackathon 2: Ongoing
    const hackOngoing = await Hackathon.create({
      title: 'Global Generative AI Hackathon',
      description: 'Unleash the power of LLMs, diffusion models, and multi-agent frameworks to build tools that increase worker productivity or solve consumer problems.',
      requirements: 'Use of at least one AI API or local model is required. Code must be hosted on GitHub.',
      organizer: org2._id,
      startDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // started 1 day ago
      endDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000), // ends in 2 days
      registrationDeadline: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // deadline passed 2 days ago
      mode: 'online',
      theme: 'Artificial Intelligence',
      status: HACKATHON_STATUS.ONGOING,
      minTeamSize: 1,
      maxTeamSize: 3,
      bannerImage: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=800&q=80',
      judges: [judge1._id, judge2._id, judge3._id],
    });

    // Hackathon 3: Completed
    const hackCompleted = await Hackathon.create({
      title: 'Fintech Summit Hackathon',
      description: 'Build decentralized ledgers, banking interfaces, micro-credit protocols, or dashboard utilities that democratize personal finance.',
      requirements: 'Demonstrate safe handling of transactions or balances and clean client rendering.',
      organizer: org1._id,
      startDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), // started 5 days ago
      endDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // ended 2 days ago
      registrationDeadline: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000), // deadline passed 6 days ago
      mode: 'in-person',
      location: 'Silicon Valley Innovation Hub, San Jose, CA',
      theme: 'Financial Tech',
      status: HACKATHON_STATUS.COMPLETED,
      minTeamSize: 1,
      maxTeamSize: 2,
      bannerImage: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&q=80',
      judges: [judge2._id, judge3._id],
    });
    console.log('Seed: Created Hackathons successfully.');

    // 3. Registrations and Teams for Ongoing Hackathon
    // Team A: Participant 1 & Participant 2
    const teamA = await Team.create({
      name: 'AI Innovators',
      hackathon: hackOngoing._id,
      leader: participants[0]._id,
      members: [participants[0]._id, participants[1]._id],
      inviteCode: 'AIINV1',
    });

    await Registration.create([
      { user: participants[0]._id, hackathon: hackOngoing._id, team: teamA._id, status: REGISTRATION_STATUS.REGISTERED },
      { user: participants[1]._id, hackathon: hackOngoing._id, team: teamA._id, status: REGISTRATION_STATUS.REGISTERED },
    ]);

    // Team B: Participant 3
    const teamB = await Team.create({
      name: 'Agentic Coders',
      hackathon: hackOngoing._id,
      leader: participants[2]._id,
      members: [participants[2]._id],
      inviteCode: 'AGCOD2',
    });

    await Registration.create([
      { user: participants[2]._id, hackathon: hackOngoing._id, team: teamB._id, status: REGISTRATION_STATUS.REGISTERED },
    ]);

    // Register Participant 4 to Ongoing but has no team
    await Registration.create({
      user: participants[3]._id,
      hackathon: hackOngoing._id,
      team: null,
      status: REGISTRATION_STATUS.REGISTERED,
    });

    // 4. Registrations, Teams & Submissions for Completed Hackathon
    // Team C: Participant 5 & Participant 6
    const teamC = await Team.create({
      name: 'BlockPay',
      hackathon: hackCompleted._id,
      leader: participants[4]._id,
      members: [participants[4]._id, participants[5]._id],
      inviteCode: 'BLKP33',
    });

    await Registration.create([
      { user: participants[4]._id, hackathon: hackCompleted._id, team: teamC._id, status: REGISTRATION_STATUS.REGISTERED },
      { user: participants[5]._id, hackathon: hackCompleted._id, team: teamC._id, status: REGISTRATION_STATUS.REGISTERED },
    ]);

    // Team D: Participant 7
    const teamD = await Team.create({
      name: 'MicroLedger',
      hackathon: hackCompleted._id,
      leader: participants[6]._id,
      members: [participants[6]._id],
      inviteCode: 'MCRLED',
    });

    await Registration.create([
      { user: participants[6]._id, hackathon: hackCompleted._id, team: teamD._id, status: REGISTRATION_STATUS.REGISTERED },
    ]);

    console.log('Seed: Created Teams and Registrations successfully.');

    // 5. Create Submissions for Completed Hackathon
    const subC = await Submission.create({
      hackathon: hackCompleted._id,
      team: teamC._id,
      submittedBy: participants[4]._id,
      projectName: 'BlockPay Decentralized Invoices',
      projectDescription: 'A platform that enables freelancers to automatically generate invoices and receive immediate payments in gas-optimized stablecoins.',
      repositoryUrl: 'https://github.com/example/blockpay',
      demoUrl: 'https://blockpay-demo.example.com',
      presentationPdf: '/uploads/sample-pdf.pdf',
      screenshots: [
        'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&q=80',
        'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&q=80',
      ],
    });

    const subD = await Submission.create({
      hackathon: hackCompleted._id,
      team: teamD._id,
      submittedBy: participants[6]._id,
      projectName: 'MicroLedger App',
      projectDescription: 'A simple spreadsheet-like ledger that operates offline on local storage, syncing to the cloud when internet returns. Perfect for rural shops.',
      repositoryUrl: 'https://github.com/example/microledger',
      demoUrl: 'https://microledger.example.com',
      presentationPdf: '/uploads/sample-pdf2.pdf',
      screenshots: [
        'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=400&q=80',
      ],
    });
    console.log('Seed: Created Submissions successfully.');

    // 6. Create Reviews by Judges for Completed Hackathon
    // Judge 2 reviews Team C
    await Review.create({
      submission: subC._id,
      judge: judge2._id,
      scores: {
        innovation: 8,
        technicalComplexity: 9,
        design: 7,
        presentation: 8,
      },
      feedback: 'Excellent tech stack. The contract implementation is elegant. UX could be slightly improved but overall a very impressive build.',
    });

    // Judge 3 reviews Team C
    await Review.create({
      submission: subC._id,
      judge: judge3._id,
      scores: {
        innovation: 9,
        technicalComplexity: 10,
        design: 8,
        presentation: 9,
      },
      feedback: 'Incredible work. The gas optimization is real-world quality. Solves a major pain point for freelancers. Well done!',
    });

    // Judge 2 reviews Team D
    await Review.create({
      submission: subD._id,
      judge: judge2._id,
      scores: {
        innovation: 7,
        technicalComplexity: 6,
        design: 9,
        presentation: 8,
      },
      feedback: 'Very practical and user-friendly interface. Simple code but provides immediate utility.',
    });

    // Judge 3 reviews Team D
    await Review.create({
      submission: subD._id,
      judge: judge3._id,
      scores: {
        innovation: 6,
        technicalComplexity: 7,
        design: 8,
        presentation: 7,
      },
      feedback: 'Nice offline synchronization strategy. Simple concept but has high impact potential.',
    });
    console.log('Seed: Created Reviews successfully.');

    console.log('Seed: Data seeding completed successfully! Close DB connection.');
    await mongoose.connection.close();
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedDB();
