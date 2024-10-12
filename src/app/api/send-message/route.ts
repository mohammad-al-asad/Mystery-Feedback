import dbConnect from "@/lib/dbConnect";
import userModel, { Message } from "@/model/user";

export async function POST(request: Request) {
  await dbConnect();
  try {
    const { username, content } = await request.json();
    const user = await userModel.findOne({ username });

    if (!user) {
      return Response.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }
    if (!user?.isExceptingMessage) {
      return Response.json(
        {
          success: false,
          message: "User is not excepting message",
        },
        { status: 403 }
      );
    }
    const newMessage = { content, createdAt: new Date() };
    user.messages.push(newMessage as Message);
    await user.save();
    return Response.json(
      {
        success: true,
        message: "Message sent successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.log("There was an error adding message", error);
    return Response.json(
      {
        success: false,
        message: "There was an error durring finding user",
      },
      { status: 500 }
    );
  }
}
