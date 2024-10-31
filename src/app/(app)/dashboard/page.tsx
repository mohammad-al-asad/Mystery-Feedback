"use client";

import { Button } from "@/components/ui/button";
import MessageCard from "@/components/ui/MessageCard";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Message } from "@/model/user";
import { acceptMessageSchema } from "@/schema/acceptMessageSchema";
import { apiResponse } from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import { Loader2, RefreshCcw } from "lucide-react";
import { useSession } from "next-auth/react";
import React, { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";

function Page() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSwitchLoading, setIsSwitchLoading] = useState(false);
  const { toast } = useToast();
  const { data: session } = useSession();

  const form = useForm({
    resolver: zodResolver(acceptMessageSchema),
  });
  const { register, setValue, watch } = form;
  const acceptMessage = watch("acceptMessage");

  const handleDeleteMessage = (messageId: string) => {
      setMessages(messages.filter((message) => message._id != messageId));
    };

  const fetchMessages = useCallback(
    async (refresh: boolean = false) => {
      try {
        setIsSwitchLoading(true);
        setIsLoading(true);
        const response = await axios.get<apiResponse>("api/get-messages");
        setMessages(response.data.messages as Message[]);
        
        if (refresh) {
          toast({
            title: "Refreshed Messages",
            description: "Showing latest messages",
          });
        }
      } catch (error) {
        const errMsg = error as AxiosError<apiResponse>;
        toast({
          title: "Failed to Fetch Messages",
          description: errMsg.response?.data.message,
          variant: "destructive",
        });
      } finally {
        setIsSwitchLoading(false);
        setIsLoading(false);
      }
    },
    [setIsLoading, setIsSwitchLoading, setMessages, toast]
  );

  const fetchMessageAcceptance = useCallback(async () => {
    try {
      setIsSwitchLoading(true);
      const response = await axios.get<apiResponse>("api/accept-message");
      
      setValue("acceptMessage", response.data.isExceptingMessage);
    } catch (error) {
      const errMsg = error as AxiosError<apiResponse>;
      toast({
        title: "Failed to Fetch MessagesAcceptance",
        description:
          errMsg.response?.data.message || "An unknown error occured",
        variant: "destructive",
      });
    } finally {
      setIsSwitchLoading(false);
    }
  }, [setIsSwitchLoading, setValue, toast]);

  const handleSwitch = async () => {
    try {
      setIsSwitchLoading(true);
      setValue("acceptMessage", !acceptMessage);
      const response = await axios.post<apiResponse>("api/accept-message", {
        isExceptingMessage: !acceptMessage,
      });
      toast({
        title: "Success",
        description: response.data.message,
      });
    } catch (error) {
      const errMsg = error as AxiosError<apiResponse>;
      toast({
        title: "Failed to update MessagesAcceptance",
        description: errMsg.response?.data.message,
        variant: "destructive",
      });
    }finally{
      setIsSwitchLoading(false);
    }
  };

  let profileUrl: string = "";
  let copyToClipbord: () => void;
  if (typeof window != "undefined") {
    const baseUrl = `${window.location.protocol}//${window.location.host}`;
    profileUrl = `${baseUrl}/u/${session?.user?.name}`;
    copyToClipbord = () => {
      navigator.clipboard.writeText(profileUrl);
      toast({
        title: "URL Copied!",
        description: "Profile URL has been copied to clipboard.",
      });
    };
  }

  useEffect(() => {
    if (!session || !session.user) return;
    fetchMessages();
    fetchMessageAcceptance();
  }, [fetchMessages, fetchMessageAcceptance, session]);

  if (!session || !session.user) return <div className="flex justify-center text-lg">Please Login..</div>;

  return (
    <div className="my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white rounded w-full max-w-6xl">
      <h1 className="text-4xl font-bold mb-4">User Dashboard</h1>

      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Copy Your Unique Link</h2>{" "}
        <div className="flex items-center">
          <input
            type="text"
            value={profileUrl}
            disabled
            className="input input-bordered w-full p-2 mr-2"
          />
          <Button onClick={copyToClipbord!}>Copy</Button>
        </div>
      </div>

      <div className="mb-4">
        <Switch
          {...register("acceptMessages")}
          checked={acceptMessage}
          onCheckedChange={handleSwitch}
          disabled={isSwitchLoading}
        />
        <span className="ml-2">
          Accept Messages: {acceptMessage ? "On" : "Off"}
        </span>
      </div>
      <Separator />
      <Button
        className="mt-4"
        variant="outline"
        onClick={(e) => {
          e.preventDefault();
          fetchMessages(true);
        }}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <RefreshCcw className="h-4 w-4" />
        )}
      </Button>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        {messages.length > 0 ? (
          messages.map((message, index) => (
            <MessageCard
              key={index}
              message={message}
              onMessageDelete={handleDeleteMessage}
            />
          ))
        ) : (
          <p>No messages to display.</p>
        )}
      </div>
    </div>
  );
}

export default Page;
