import mongoose from "mongoose";
import Razorpay from "razorpay";

function getMongoUri() {
  return (
    process.env.MONGODB_URI?.trim() ||
    process.env.DATABASE_URL?.trim() ||
    process.env.MONGO_URL?.trim() ||
    ""
  );
}

export async function connectDb() {
  const uri =
    getMongoUri() || "mongodb://127.0.0.1:27017/smilesync";
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 20_000,
  });
}

export function getRazorpayClient() {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_key",
    key_secret: process.env.RAZORPAY_KEY_SECRET || "rzp_test_secret",
  });
}
