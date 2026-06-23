/**
 * db.js
 * MongoDB connection using Mongoose.
 * Handles connection errors and logs connection status.
 */

const mongoose = require("mongoose");
const User = require("../models/User");
const Employee = require("../models/Employee");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // Modern Mongoose versions don't need these options, but keeping
      // them for clarity with older setups:
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Seed/Sync Master HR
    const email = process.env.MASTER_HR_EMAIL || "admin@hrconnect.com";
    const password = process.env.MASTER_HR_PASSWORD || "HRConnect#2026!Admin";
    const name = "Master HR";

    let masterHR = await User.findOne({ role: "master_hr" }).select("+password");
    if (!masterHR) {
      // Check if email exists
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        emailExists.role = "master_hr";
        emailExists.name = name;
        emailExists.password = password;
        await emailExists.save();
        console.log(`👤 Existing user updated to Master HR: ${email}`);
      } else {
        await User.create({
          name,
          email,
          password,
          role: "master_hr",
        });
        console.log(`👤 Master HR account seeded successfully: ${email}`);
      }
    } else {
      // Master HR exists, check if email/password need update to align with current env
      let changed = false;
      if (masterHR.email !== email) {
        masterHR.email = email;
        changed = true;
      }
      const isPasswordCorrect = await masterHR.matchPassword(password);
      if (!isPasswordCorrect) {
        masterHR.password = password;
        changed = true;
      }
      if (changed) {
        await masterHR.save();
        console.log(`👤 Master HR account updated in DB to align with env variables: ${email}`);
      }
    }

    // 🔒 Security Migration: Scan and migrate any weak employee passwords that match their email
    const employees = await User.find({ role: "employee" });
    for (const userInstance of employees) {
      const matchesEmail = await userInstance.matchPassword(userInstance.email);
      if (matchesEmail) {
        const emailPrefix = userInstance.email.split("@")[0];
        const securePassword = `HRConnect#${emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1)}!2026`;
        userInstance.password = securePassword;
        await userInstance.save();

        const empInstance = await Employee.findOne({ email: userInstance.email });
        if (empInstance) {
          empInstance.password = securePassword;
          await empInstance.save();
        }
        console.log(`🔒 Security Migration: Updated weak password for employee: ${userInstance.email} to secure format.`);
      }
    }
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1); // Exit with failure
  }
};

module.exports = connectDB;
