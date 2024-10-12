import mongoose from "mongoose";

let isConnected: boolean = false;

export default async function dbConnect(): Promise<void> {
  if (isConnected) {
    console.log("DB is already connected");
    return;
  }
  try {
    await mongoose.connect(process.env.MONGODB_URL! || "");
    console.log("Database connected succesfully");
    isConnected = true;
  } catch (error) {
    console.log("There was an error connecting database", error);
    process.exit(1);
  }
}
