"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import useThreads from "@/hooks/use-threads";
import { Archive, ArchiveX, Clock, MoreVertical, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import EmailDisplay from "./email-display";
import ReplyBox from "./ReplyBox";

type Props = {};

const ThreadView = (props: Props) => {
  const { threadId, threads } = useThreads();
  const thread = threads?.find((t) => t.id === threadId);

  return (
    // Buttons Row
    <>
      <section>
        <TooltipProvider>
          <div className="flex h-full flex-col">
            <div className="ml-5 flex items-center gap-5">
              <Button
                variant={"ghost"}
                size={"icon"}
                disabled={!thread}
                aria-label="Archive"
              >
                <Tooltip>
                  <TooltipTrigger>
                    <Archive size={20} />
                  </TooltipTrigger>

                  <TooltipContent>
                    <p>Archive</p>
                  </TooltipContent>
                </Tooltip>
              </Button>

              <Button variant={"ghost"} size={"icon"} disabled={!thread}>
                <Tooltip>
                  <TooltipTrigger>
                    <ArchiveX size={20} />
                  </TooltipTrigger>

                  <TooltipContent>
                    <p>Archive</p>
                  </TooltipContent>
                </Tooltip>
              </Button>

              <Button variant={"ghost"} size={"icon"} disabled={!thread}>
                <Tooltip>
                  <TooltipTrigger>
                    <Trash2 size={20} />
                  </TooltipTrigger>

                  <TooltipContent>
                    <p>Delete</p>
                  </TooltipContent>
                </Tooltip>
              </Button>

              <Separator orientation="vertical" />
              <Button variant={"ghost"} size={"icon"} disabled={!thread}>
                <Tooltip>
                  <TooltipTrigger>
                    <Clock size={20} />
                  </TooltipTrigger>

                  <TooltipContent>
                    <p>Snooze</p>
                  </TooltipContent>
                </Tooltip>
              </Button>

              <div className="ml-auto mr-1 flex items-center">
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <Button variant={"ghost"} size={"icon"} disabled={!thread}>
                      <MoreVertical className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Mark as unread</DropdownMenuItem>
                    <DropdownMenuItem>Start thread</DropdownMenuItem>
                    <DropdownMenuItem>Add label</DropdownMenuItem>
                    <DropdownMenuItem>Mute thread</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </TooltipProvider>
      </section>
      <Separator />

      {thread ? (
        <>
          <div className="flex flex-1 flex-col overflow-scroll">
            <div className="flex items-center p-4">
              <div className="flex items-center gap-4 text-sm">
                <Avatar>
                  <AvatarImage alt="avatar" />
                  <AvatarFallback>
                    {thread?.emails[0]?.from?.name
                      ?.split(" ")
                      .map((chunk: string) => chunk[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>

                <div className="grid gap-1">
                  <div className="font-semibold">
                    {thread?.emails[0]?.from?.name}

                    <div className="line-clamp-1 text-xs">
                      {thread.emails[0]?.subject}
                    </div>

                    <div className="line-clamp-1 text-xs">
                      <span className="font-medium">Reply-To:</span>
                      <span className="ps-2">
                        {thread.emails[0]?.from?.address}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {thread.emails[0]?.sentAt && (
                <div className="ml-auto text-xs text-muted-foreground">
                  {format(new Date(thread.emails[0]?.sentAt), "PPpp")}
                </div>
              )}
            </div>

            <Separator />

            <div className="flex max-h-[calc(100vh-500px)] flex-col overflow-scroll">
              <div className="flex flex-col gap-4 p-6">
                {thread.emails.map((email) => {
                  return <EmailDisplay key={email.id} email={email} />;
                })}
              </div>
            </div>

            <div className="flex-1"></div>
            <Separator className="mt-auto" />
            <ReplyBox />
          </div>
        </>
      ) : (
        <>
          <div className="p-8 text-center text-muted-foreground">
            No message selected
          </div>
        </>
      )}
    </>
  );
};

export default ThreadView;
