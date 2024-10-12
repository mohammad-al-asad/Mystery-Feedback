import dbConnect from "@/lib/dbConnect";
import userModel from "@/model/user";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import { User } from "@/model/user";

export async function POST(request: Request) {
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

  try {
    const { isExceptingMessage } = await request.json();
    const user = await userModel.findByIdAndUpdate(
      sessionUser._id,
      {
        isExceptingMessage,
      },
      { new: true }
    );

    if (!user) {
      return Response.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }
    return Response.json(
      {
        success: true,
        message: "Message Exceptance is updated",
        user,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("There was an error updating message exceptance status", error);
    return Response.json(
      {
        success: false,
        message: "There was an error updating message exceptance status",
      },
      { status: 500 }
    );
  }
}

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

  try {
    const user = await userModel.findById(sessionUser._id);

    if (!user) {
      return Response.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }
    return Response.json(
      {
        success: true,
        message: "Getting message exceptance status succesful",
        isExceptingMessage: user.isExceptingMessage,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("There was an error retriving message exceptance status", error);
    return Response.json(
      {
        success: false,
        m: "There was an error durring retriving message exceptance status",
      },
      { status: 500 }
    );
  }
}
