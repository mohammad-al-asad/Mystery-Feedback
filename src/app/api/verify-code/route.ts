import dbConnect from "@/lib/dbConnect";
import userModel from "@/model/user";

export default async function POSt(request: Request) {
  const { username, otp } = await request.json();
  await dbConnect();
  try {
    const decodedUsername = decodeURIComponent(username);
    const user = await userModel.findOne({
        username:decodedUsername
    })

    if(user){
        const isNotExpired = new Date(user.otpExpiry)> new Date()
        const isVerified = user.otp === otp
        if(isVerified && isNotExpired){
            user.isVerified = true
            await user.save()
            return Response.json(
                { success: true, message: 'Account verified successfully' },
                { status: 200 }
              );
        }else if(!isVerified){
            return Response.json(
                { success: false, message: 'Incorrect Otp code' },
                { status: 403 }
              );
        
        }else if(!isNotExpired){
            return Response.json(
                { success: false, message: 'Otp code is expired. Please try again' },
                { status: 400 }
              );
        }
    }else{
        return Response.json(
            { success: false, message: 'User not found' },
            { status: 404 }
          );
    }
  } catch (error) {
    console.log("Error verifying user", error);
    return Response.json(
      { success: false, message: "Error verifying user" },
      { status: 500 }
    );
  }
}
