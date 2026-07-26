require("dotenv").config();

const connectDB = require("./config/db");
const User = require("./models/User");

const users = [];

// Participants
for (let i = 1; i <= 6; i++) {
  users.push({
    name: `User${i}`,
    email: `user${i}@gmail.com`,
    password: `user${i}@1234`,
    role: "participant",
  });
}

// Organizers (Hosts)
for (let i = 1; i <= 6; i++) {
  users.push({
    name: `Host${i}`,
    email: `host${i}@gmail.com`,
    password: `host${i}@1234`,
    role: "organizer",
  });
}

// Judges
for (let i = 1; i <= 6; i++) {
  users.push({
    name: `Judge${i}`,
    email: `judge${i}@gmail.com`,
    password: `judge${i}@1234`,
    role: "judge",
  });
}

const insertUsers = async () => {
  try {
    await connectDB();

    // Delete existing users (optional)
    await User.deleteMany({});

    // Save users one by one so pre('save') hashes passwords
    for (const userData of users) {
      const user = new User(userData);
      await user.save();
    }

    console.log("✅ 18 users inserted successfully.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error inserting users:", error);
    process.exit(1);
  }
};

insertUsers();