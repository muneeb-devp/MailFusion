"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import dynamic from "next/dynamic";
import React from "react";

const Mail = dynamic(
  () => {
    return import("./mail");
  },
  { ssr: false },
);

type Props = {};

const MailDashboard = (props: Props) => {
  return (
    <>
      <div className="absolute bottom-4 left-4">
        <ThemeToggle />
      </div>
      <Mail
        defaultCollapsed={false}
        defaultLayout={[20, 32, 48]}
        navCollapsedSize={4}
      />
    </>
  );
};

export default MailDashboard;
