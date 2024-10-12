import { resend } from "@/lib/resend";
import VerificationEmail from "../../emails/veryficationEmail";
import { apiResponse } from "@/types/types";

export default async function sendVerificationEmail(
  emailAddress: string,
  username: string,
  otp: string
): Promise<apiResponse> {
  try {
    await resend.emails.send({
      from: "Acme <onboarding@resend.dev>",
      to: [emailAddress],
      subject: "Mystry Feedback | Verification Email",
      react: VerificationEmail({ username, otp }),
    });
    return {
      success: true,
      message: "verification email send succesfully",
    };
  } catch (error) {
    console.log("There was an error sending verification email", error);
    return {
      success: false,
      message: "There was an error sending verification email",
    };
  }
}
