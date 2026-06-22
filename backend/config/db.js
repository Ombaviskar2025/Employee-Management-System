/**
 * db.js
 * MongoDB connection using Mongoose.
 * Handles connection errors and logs connection status.
 */

const mongoose = require("mongoose");
const User = require("../models/User");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // Modern Mongoose versions don't need these options, but keeping
      // them for clarity with older setups:
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Seed Master HR
    const email = process.env.MASTER_HR_EMAIL || "admin@hrconnect.com";
    const password = process.env.MASTER_HR_PASSWORD || "admin123";
    const name = "Master HR";

    const existing = await User.findOne({ $or: [{ email }, { role: "master_hr" }] });
    if (!existing) {
      await User.create({
        name,
        email,
        password,
        role: "master_hr",
      });
      console.log(`👤 Master HR account seeded successfully: ${email}`);
    } else if (existing.role !== "master_hr") {
      existing.role = "master_hr";
      await existing.save();
      console.log(`👤 Seeded account role updated to master_hr: ${email}`);
    }
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1); // Exit with failure
  }
};

module.exports = connectDB;
