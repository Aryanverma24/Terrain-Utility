import mongoose from "mongoose";

const dbConnect = async () => {
<<<<<<< HEAD
try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("database Successfully Connected!")
} catch (err) {
    console.log(`some error occured while connecting databse ${err.message}`);
}
}
=======
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

>>>>>>> a1564f3440c9dbaf7e44fe1de0295cff4e5508b5
export default dbConnect;