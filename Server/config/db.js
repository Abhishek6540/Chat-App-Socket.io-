import mongoose from "mongoose";
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/chat-app"

const dbConnect = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("MongoDB Connected");
  } catch (error) {
    console.log(error);
  }
};

export default dbConnect;
