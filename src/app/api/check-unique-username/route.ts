import dbConnect from "@/lib/dbConnect";
import userModel from "@/model/user";
import { usernameValidation } from "@/schema/signupSchema";
import { z } from "zod";

const usernameQuerySchema = z.object({
  username: usernameValidation,
});
export default async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const queryParams = {
    username: searchParams.get("username"),
  };

  await dbConnect();

  try {
    const result = usernameQuerySchema.safeParse(queryParams);

    if (!result.success) {
      const errors = result.error.format().username?._errors || [];

      return Response.json(
        {
          success: false,
          message:
            errors.length > 0 ? errors.join(",") : "Invalid query parameters",
        },
        { status: 500 }
      );
    } else {
      const { username } = result.data;
      const user = await userModel.findOne({
        username,
        isVerified: true,
      });
      if (user) {
        return Response.json(
          {
            success: false,
            message: "Username is already taken",
          },
          { status: 200 }
        );
      } else {
        return Response.json(
          {
            success: true,
            message: "Username is unique",
          },
          { status: 200 }
        );
      }
    }
  } catch (error) {
    console.log("Error checking username:", error);

    return Response.json(
      {
        success: false,
        message: "Error checking username",
      },
      { status: 500 }
    );
  }
}
