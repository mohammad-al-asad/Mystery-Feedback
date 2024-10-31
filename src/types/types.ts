import { Message } from "@/model/user";

export interface apiResponse {
  success: boolean;
  message: string;
  isExceptingMessage?: boolean;
  messages?: Array<Message>;
}
