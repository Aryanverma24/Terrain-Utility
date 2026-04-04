import mongoose from "mongoose";

const dbConnect = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("❌ MONGODB_URI is undefined. Check your .env file!");
    return;
  }

  try {
    await mongoose.connect(uri);
    console.log("✅ Database connected successfully!");
  } catch (err) {
    console.error(`❌ Error connecting to database: ${err.message}`);
  }
};

export default dbConnect;