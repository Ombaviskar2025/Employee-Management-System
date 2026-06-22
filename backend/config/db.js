/**
 * db.js
 * MongoDB connection using Mongoose.
 * Handles connection errors and logs connection status.
 */

const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // Modern Mongoose versions don't need these options, but keeping
      // them for clarity with older setups:
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1); // Exit with failure
  }
};

module.exports = connectDB;
