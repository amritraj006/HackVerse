# HackVerse: Hackathon Management Platform

HackVerse is a full-featured, production-quality Hackathon Management Platform built using the MERN stack (MongoDB, Express.js, React.js, Node.js). The platform is designed to handle user registrations, team formations, project submissions, judge panels, and leaderboard calculations at scale.

## Technology Stack

- **Frontend**: React.js (Vite), React Router DOM v6, Axios, Tailwind CSS v3, Lucide Icons, Recharts, Framer Motion
- **Backend**: Node.js, Express.js, MongoDB (Mongoose)
- **Security**: JSON Web Token (JWT) authorization, bcryptjs password hashing
- **Form Handling & Validation**: Zod schema validations (body, query, and params)
- **Uploads**: Local disk storage configuration using Multer

---

## Workspace Structure

The workspace follows a strict MVC design pattern:

```text
HackVerse/
│
├── backend/                  # Node.js + Express API
│   ├── config/               # DB connection configurations
│   ├── constants/            # Role and status enums
│   ├── controllers/          # Request wrappers & handlers
│   ├── database/             # Seeding script
│   ├── middleware/           # Auth, Multer, Error, Zod validators
│   ├── models/               # MongoDB models & indexing
│   ├── routes/               # REST API paths
│   ├── services/             # Business & Database queries
│   ├── utils/                # Custom API Error/Response classes
│   ├── validations/          # Zod validation schemas
│   ├── app.js                # Express application configuration
│   └── server.js             # Entry server script
│
├── frontend/                 # Vite React Client
│   ├── src/
│   │   ├── components/       # Layouts, UI, Sidebars
│   │   ├── context/          # AuthContext & ToastContext
│   │   ├── pages/            # Login, Signup, Lobby, Dashboards
│   │   ├── services/         # Axios client with interceptors
│   │   ├── styles/           # CSS & Tailwind integrations
│   │   ├── App.jsx           # Routing configuration
│   │   └── main.jsx          # React entry
│   ├── index.html
│   └── tailwind.config.js
```

---

## Database Schemas

### 1. User
- `name` (String, required)
- `email` (String, unique, index)
- `password` (String, select: false)
- `role` (Enum: `admin`, `organizer`, `participant`, `judge`)
- `profileImage` (String)
- `bio` (String)
- `skills` (Array of Strings)

### 2. Hackathon
- `title` (String, required)
- `description` (String, required)
- `requirements` (String)
- `organizer` (ObjectId, ref: `User`)
- `startDate` (Date, required)
- `endDate` (Date, required)
- `registrationDeadline` (Date, required)
- `mode` (Enum: `online`, `in-person`)
- `location` (String)
- `theme` (String, required)
- `status` (Enum: `upcoming`, `ongoing`, `completed`)
- `minTeamSize` / `maxTeamSize` (Number)
- `bannerImage` (String)
- `judges` (Array of ObjectIds, ref: `User`)

### 3. Team
- `name` (String, required)
- `hackathon` (ObjectId, ref: `Hackathon`)
- `leader` (ObjectId, ref: `User`)
- `members` (Array of ObjectIds, ref: `User`)
- `inviteCode` (String, unique)

### 4. Registration
- `user` (ObjectId, ref: `User`)
- `hackathon` (ObjectId, ref: `Hackathon`)
- `team` (ObjectId, ref: `Team`, nullable)
- `status` (Enum: `registered`, `cancelled`)
- *Index*: `{ user: 1, hackathon: 1 }` (unique)

### 5. Submission
- `hackathon` (ObjectId, ref: `Hackathon`)
- `team` (ObjectId, ref: `Team`)
- `submittedBy` (ObjectId, ref: `User`)
- `projectName` (String, required)
- `projectDescription` (String, required)
- `repositoryUrl` (String, required)
- `demoUrl` (String)
- `presentationPdf` (String)
- `screenshots` (Array of Strings)
- *Index*: `{ hackathon: 1, team: 1 }` (unique)

### 6. Review
- `submission` (ObjectId, ref: `Submission`)
- `judge` (ObjectId, ref: `User`)
- `scores`: { `innovation`, `technicalComplexity`, `design`, `presentation` } (Numbers 1-10)
- `feedback` (String, required)
- `totalScore` (Number, calculated automatically)
- *Index*: `{ submission: 1, judge: 1 }` (unique)

---

## API Routes Documentation

### Auth & Users
- `POST /api/auth/signup` - Register user
- `POST /api/auth/login` - Authenticate credentials & return JWT
- `GET /api/auth/profile` - Retrieve authenticated user profile
- `PUT /api/auth/profile` - Update user bio, avatar, skills
- `GET /api/users` - Directory list of all users (*Admin only*)
- `GET /api/users/judges` - Get all reviewers (*Organizer/Admin only*)

### Hackathons
- `GET /api/hackathons` - Browse events with filters (`search`, `theme`, `mode`, `status`)
- `POST /api/hackathons` - Create hackathon (*Organizer/Admin only*)
- `GET /api/hackathons/:id` - Fetch detailed information & judge lists
- `PUT /api/hackathons/:id` - Edit parameters (*Organizer/Admin only*)
- `DELETE /api/hackathons/:id` - Remove event (*Organizer/Admin only*)
- `GET /api/hackathons/organizer` - List events hosted by current organizer

### Teams & Registrations
- `POST /api/registrations` - Join event as a participant
- `POST /api/registrations/cancel` - Cancel event registration
- `GET /api/registrations/my/:hackathonId` - Check personal signup status
- `POST /api/teams` - Form new team (creates unique invite code)
- `POST /api/teams/join` - Join team using code
- `DELETE /api/teams/:id/leave` - Leave/disband team
- `GET /api/teams/my/:hackathonId` - Fetch personal team for a hackathon

### Project Submissions & Reviews
- `POST /api/submissions` - Submit project slides & repository URLs (*Multipart/Form-Data*)
- `GET /api/submissions/:id` - View entry details
- `GET /api/submissions/hackathon/:hackathonId` - List entries for review (*Organizer/Judge/Admin*)
- `POST /api/reviews/submission/:submissionId` - Grade entry and submit scorecard (*Judge/Admin only*)
- `GET /api/reviews/submission/:submissionId` - Get project evaluations
- `GET /api/reviews/leaderboard/:hackathonId` - Aggregated event leaderboard

### Analytics Dashboards
- `GET /api/dashboard/stats` - Fetch overview counts, pending review items, or registration statuses based on user roles

---

## Local Development Operations

### Prerequisites
- Node.js installed locally
- MongoDB daemon running locally on port 27017 or a MongoDB Atlas URI

### Configuration
1. Set up backend configuration:
   Create a `backend/.env` file with:
   ```env
   PORT=5001
   MONGO_URI=mongodb://127.0.0.1:27017/hackverse
   JWT_SECRET=your_jwt_secret_string
   NODE_ENV=development
   ```

### Running Seeding Script
Populate your database with mock Admin, Organizers, Judges, Participants, active hackathons, and evaluated projects:
```bash
cd backend
npm run seed
```

### Starting Servers
To run the full-stack system locally:

1. **Start Backend Server**:
   ```bash
   cd backend
   npm run dev
   ```
   (Server boots on `http://localhost:5001`)

2. **Start Frontend Vite Client**:
   ```bash
   cd frontend
   npm run dev
   ```
   (Client boots on `http://localhost:5173`)
