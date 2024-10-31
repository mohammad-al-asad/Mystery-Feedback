"use client";
import { useCompletion } from 'ai/react';
import { Button } from "@/components/ui/button";
import { CardContent, CardHeader, Card } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { messageSchema } from "@/schema/messageScema";
import { apiResponse } from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import Link from "next/link";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2 } from 'lucide-react';

function Page({ params }: { params: { username: string } }) {
  const { username } = params;
  const { toast } = useToast();
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const initialMessageString =
  "What's your favorite movie?||Do you have any pets?||What's your dream job?";
  const complitionMethods = useCompletion({
    api: '/api/suggest-message',
    initialCompletion: initialMessageString
  });
  const {complete, completion, error } = complitionMethods
  let {isLoading} = complitionMethods

  const seperateString = (str:string)=>{
    return str.split("||")
  }

  const form = useForm<z.infer<typeof messageSchema>>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      content: "",
    },
  });

  const {setValue,watch} = form;
  const message = watch("content")

  const sendMessage = async (data: z.infer<typeof messageSchema>) => {
    try {
      setIsSendingMessage(true);
      const response = await axios.post<apiResponse>("/api/send-message", {
        username,
        content: data.content,
      });
      toast({
        title: "Message sent",
        description: response.data.message,
      });
    } catch (error) {
      const errMsg = error as AxiosError<apiResponse>;

      toast({
        title: "Failed to send",
        description: errMsg.response?.data.message || "Error sending message",
        variant: "destructive",
      });
    }finally{
      setIsSendingMessage(false);
    }
  };


  const fetchSuggestedMessages = async () => {
    try {
      isLoading = true;
      complete("")
      // const response = await axios.post("/api/suggest-message");
      console.log(completion);
      
    } catch (error) {
      console.log(error);
      // const errMsg = error as AxiosError<apiResponse>;

      toast({
        title: "Failed to suggest",
        description:"Error suggesting message",
        variant: "destructive",
      });
    }
  };

  return (
    <div className='mx-auto w-3/4 my-4'>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(sendMessage)}
          className="space-y-6 "
        >
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem className="flex flex-col justify-center space-y-3">
                <FormLabel className="font-semibold self-start">
                  Send anonymous message to @{username}
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    className="h-16"
                    placeholder="Write your anonymous message here"
                  />
                </FormControl>
                <FormMessage />
                {isSendingMessage ? (
              <Button disabled>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please wait
              </Button>
            ) : (
              <Button type="submit" disabled={isSendingMessage || !message}>
                Send It
              </Button>
            )}
              </FormItem>
            )}
          />
        </form>
      </Form>

      <div className="space-y-4 my-8">
        <div className="space-y-2">
          <Button
            onClick={fetchSuggestedMessages}
            className="my-4"
            disabled={isLoading}
          >
            Suggest Messages
          </Button>
          <p>Click on any message below to select it.</p>
        </div>
        <Card>
          <CardHeader>
            <h3 className="text-xl font-semibold">Messages</h3>
          </CardHeader>
          <CardContent className="flex flex-col space-y-4">
            {error ? (
              <p className="text-red-500">{error.message}</p>
            ) : (
              seperateString(completion).map((message, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="mb-2"
                  onClick={() => setValue("content", message)}
                >
                  {message}
                </Button>
              ))
            )}
          </CardContent>
        </Card>
      </div>
      <Separator className="my-6" />
      <div className="text-center">
        <div className="mb-4">Get Your Message Board</div>
        <Link href={"/sign-up"}>
          <Button>Create Your Account</Button>
        </Link>
      </div>
    </div>
  );
}

export default Page;
