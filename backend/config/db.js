import mongoose from "mongoose";

const dbConnect = async () => {
try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("database Successfully Connected!")
} catch (err) {
    console.log(`some error occured while connecting databse ${err.message}`);
}
}
export default dbConnect;