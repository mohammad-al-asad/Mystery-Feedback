import { z } from "zod";

export const messageSchema = z.object({
  content: z
    .string()
    .min(8, { message: "Content must be atleast 8 characters" })
    .max(300,{message: "Content must be not more than 300 characters"})
});
