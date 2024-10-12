import dbConnect from "@/lib/dbConnect";
import userModel from "@/model/user";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import { User } from "@/model/user";
import mongoose from "mongoose";

export async function GET() {
  await dbConnect();
  const session = await getServerSession(authOptions);
  const sessionUser: User = session?.user as User;
  if (!session || !sessionUser) {
    return Response.json(
      {
        success: false,
        message: "Authentication required",
      },
      { status: 401 }
    );
  }
  const stringId = sessionUser._id as string;
  try {
    const userId = new mongoose.Types.ObjectId(stringId);
    const user = await userModel
      .aggregate([
        {
          $match: { _id: userId },
        },
        { $unwind: "$messages" },
        {
          $sort: { "messages.createdAt": -1 },
        },
        { $group: { _id: "$_id", messages: { $push: "$messages" } } },
      ])
      .exec();

    if (!user || user.length === 0) {
      return Response.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return Response.json(
      {
        success: true,
        message: "Getting messages succesfull",
        messages: user[0].messages,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("There was an getting message", error);
    return Response.json(
      {
        success: false,
        message: "There was an error durring finding user",
      },
      { status: 500 }
    );
  }
}
