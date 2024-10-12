import NextAuth from "next-auth";
import { authOptions } from "./options";

const handeler = NextAuth(authOptions)

export {handeler as POST, handeler as GET}