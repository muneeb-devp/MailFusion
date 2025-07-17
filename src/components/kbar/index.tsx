"use client";

import {
  Action,
  KBarAnimator,
  KBarPortal,
  KBarPositioner,
  KBarProvider,
  KBarSearch,
} from "kbar";
import RenderResult from "./render-results";
import { useLocalStorage } from "usehooks-ts";
import useThemeSwitch from "./useThemeSwitch";
import useAccountSwitch from "./useAccountSwitch";

export default function KBar({ children }: { children: React.ReactNode }) {
  const [tab, setTab] = useLocalStorage("mailfusion-tab", "inbox");
  const [done, setDone] = useLocalStorage("mailfusion-done", false);
  const actions: Action[] = [
    {
      id: "inboxAction",
      name: "Inbox",
      shortcut: ["g", "i"],
      section: "Navigation",
      subtitle: "View your inbox",
      perform: () => {
        setTab("inbox");
      },
    },
    {
      id: "draftsAction",
      name: "Drafts",
      shortcut: ["g", "d"],
      keywords: "draft",
      subtitle: "View your drafts",
      section: "Navigation",
      perform: () => {
        setTab("draft");
      },
    },
    {
      id: "sentAction",
      name: "Sent",
      shortcut: ["g", "s"],
      keywords: "sent",
      section: "Navigation",
      subtitle: "View the sent",
      perform: () => {
        setTab("sent");
      },
    },
    {
      id: "pendingAction",
      name: "See done",
      shortcut: ["g", "d"],
      keywords: "done",
      section: "Navigation",
      subtitle: "View the done emails",
      perform: () => {
        setDone(true);
      },
    },
    {
      id: "doneAction",
      name: "See Pending",
      shortcut: ["g", "u"],
      keywords: "pending, undone, not done",
      section: "Navigation",
      subtitle: "View the pending emails",
      perform: () => {
        setDone(false);
      },
    },
  ];

  return (
    <KBarProvider actions={actions}>
      <Component>{children}</Component>
    </KBarProvider>
  );
}

const Component = ({ children }: { children: React.ReactNode }) => {
  useThemeSwitch();
  useAccountSwitch();
  return (
    <>
      <KBarPortal>
        <KBarPositioner className="scrollbar-hide z[999] fixed inset-0 bg-black/40 !p-0 backdrop-blur-sm dark:bg-black/60">
          <KBarAnimator className="relative !mt-64 w-full max-w-[600px] !-translate-y-1/2 overflow-hidden rounded-lg border bg-white text-foreground shadow-lg dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200">
            <div className="bg-white dark:bg-gray-800">
              <div className="border-x-0 border-b-2 dark:border-gray-700">
                <KBarSearch className="w-full border-none bg-white px-6 py-4 text-lg outline-none focus:outline-none focus:ring-0 focus:ring-offset-0 dark:bg-gray-800" />
              </div>
              <RenderResult />
            </div>
          </KBarAnimator>
        </KBarPositioner>
      </KBarPortal>
      {children}
    </>
  );
};
