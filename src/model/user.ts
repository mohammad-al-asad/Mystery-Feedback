import mongoose, { Schema, Document } from "mongoose";

export interface Message extends Document {
  content: string;
  createdAt: Date;
}

const messageSchema: Schema<Message> = new Schema({
  content: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export interface User extends Document {
  username: string;
  email: string;
  password: string;
  otp: string;
  otpExpiry: Date;
  isVerified: boolean;
  isExceptingMessage: boolean;
  messages: Message[];
}

const userSchema: Schema<User> = new Schema({
  username: {
    type: String,
    unique: true,
    trim: true,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
    match: [/.+\@.+\..+/, "Please use a valid email address"],
  },
  password: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  otpExpiry: {
    type: Date,
    required: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  isExceptingMessage: {
    type: Boolean,
    default: true,
  },
  messages: [messageSchema],
});

const userModel =
  (mongoose.models.user as mongoose.Model<User>) ||
  mongoose.model<User>("user", userSchema);

export default userModel;
