const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined in the .env file");
    }

    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`[Database] Connected to: ${conn.connection.name}`);
    console.log(`[Host] ${conn.connection.host}`);
  } catch (error) {
    console.error("[Database Error]", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;