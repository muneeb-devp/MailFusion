"use client";

import React, { useState } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AccountSwitcher from "./account-switcher";
import Sidebar from "./sidebar";
import ThreadList from "./thread-list";
import ThreadView from "./thread-view";

type Props = {
  defaultLayout: number[] | undefined;
  navCollapsedSize: number;
  defaultCollapsed: boolean;
};

const Mail = ({
  defaultLayout = [20, 32, 48],
  navCollapsedSize,
  defaultCollapsed,
}: Props) => {
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  return (
    <TooltipProvider delayDuration={0}>
      <ResizablePanelGroup
        direction="horizontal"
        onLayout={(sizes: number[]) => console.log(sizes)}
        className="h-full min-h-screen items-stretch"
      >
        <ResizablePanel
          defaultSize={defaultLayout[0]}
          collapsible={true}
          collapsedSize={navCollapsedSize}
          minSize={15}
          maxSize={40}
          onCollapse={() => setIsCollapsed(true)}
          onResize={() => {
            setIsCollapsed(false);
          }}
          className={cn(
            isCollapsed &&
              "min-w-[50px] transition-all duration-300 ease-in-out",
          )}
        >
          <div className="flex h-full flex-1 flex-col">
            <div
              className={cn(
                "flex h-[52px] items-center justify-between px-4",
                isCollapsed ? "h-[52px]" : "px-3",
              )}
            >
              {/* Account Switcher */}
              <AccountSwitcher isCollapsed={isCollapsed} />
            </div>
            <Separator />
            {/* Sidebar */}
            <Sidebar isCollapsed={isCollapsed} />
            <div className="flex-1"></div>
            {/* AI Panel */}
            Ask AI
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={defaultLayout[1]} minSize={30}>
          <Tabs defaultValue="inbox">
            <div className="flex items-center px-4 py-2">
              <h1 className="text-xl font-bold">Inbox</h1>
              <TabsList className="ml-auto">
                <TabsTrigger
                  value="inbox"
                  className="text-zinc-600 dark:text-zinc-200"
                >
                  Inbox
                </TabsTrigger>
                <TabsTrigger
                  value="done"
                  className="text-zinc-600 dark:text-zinc-200"
                >
                  Done
                </TabsTrigger>
              </TabsList>
            </div>
            <Separator />
            {/* Search Bar */}
            SearchBar
            <TabsContent value="inbox">
              <ThreadList />
            </TabsContent>
            <TabsContent value="done">
              <ThreadList />
            </TabsContent>
          </Tabs>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={defaultLayout[2]} minSize={30}>
          <ThreadView />
        </ResizablePanel>
      </ResizablePanelGroup>
    </TooltipProvider>
  );
};

export default Mail;
