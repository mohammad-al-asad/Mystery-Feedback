import dbConnect from "@/lib/dbConnect";
import userModel from "@/model/user";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import { User } from "@/model/user";

export async function DELETE(req:Request,{ params }: { params: { messageId: string } }) {
  
  const messageId = params.messageId;
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
    const updatedUser = await userModel.updateOne(
      { _id: sessionUser._id },
      {
        $pull: { messages: { _id: messageId } },
      }
    );
    if (updatedUser.modifiedCount === 0) {
      return Response.json(
        { message: "Message not found or already deleted", success: false },
        { status: 404 }
      );
    }
    return Response.json(
      { message: "Message deleted", success: true },
      { status: 200 }
    );
  } catch (error) {
    console.log("There was an error deleting message", error);
    return Response.json(
      {
        success: false,
        message: "There was an error deleting message",
      },
      { status: 500 }
    );
  }
}
