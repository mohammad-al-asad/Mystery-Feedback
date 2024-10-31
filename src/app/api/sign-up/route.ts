import dbConnect from "@/lib/dbConnect";
import userModel from "@/model/user";
import bcrypt from "bcryptjs";
import sendVerificationEmail from "@/helpers/sendVerificationEmail";

export async function POST(req: Request) {
  await dbConnect();

  try {
    const { username, email, password } = await req.json();
    const existByUsername = await userModel.findOne({
      username,
      isVerified: true,
    });

    if (existByUsername) {
      return Response.json({
        success: false,
        message: "Username is already taken",
      });
    }

    const existByEmail = await userModel.findOne({ email });
    const otp = (
      Math.floor(Math.random() * (999999 - 100000)) + 100000
    ).toString();

    if (existByEmail) {
      if (existByEmail.isVerified) {
        return Response.json({
          success: false,
          message: "This email is already taken",
        },{status:400});
      } else {
        const hashedPassword = await bcrypt.hash(password, 10);
        const otpExpiry = new Date(Date.now() + 3600000);
        existByEmail.username = username;
        existByEmail.password = hashedPassword;
        existByEmail.otp = otp;
        existByEmail.otpExpiry = otpExpiry;

        await existByEmail.save();
      }
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      const otpExpiry = new Date(Date.now() + 3600000);
      const newUser = new userModel({
        username,
        email,
        password: hashedPassword,
        otp,
        otpExpiry,
        isVerified: false,
        isExceptingMessage: true,
        messages: [],
      });
      await newUser.save();
    }

    const emailRespose = await sendVerificationEmail(email, username, otp);
    if (!emailRespose.success) {
      return Response.json(
        {
          success: false,
          message: emailRespose.message,
        },
        { status: 500 }
      );
    }

    return Response.json(
      {
        succes: true,
        message: "User registed succesfully. plesase verify your email.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.log("Error resgistering user", error);
    return Response.json(
      {
        success: false,
        message: "Error resgistering user",
      },
      { status: 500 }
    );
  }
}
