"use client";

import React from "react";
import { useEditor } from "@tiptap/react";
import { Text } from "@tiptap/extension-text";
import StarterKit from "@tiptap/starter-kit";

type Props = {};

const EmailEditor = (props: Props) => {
  const customText = Text.extend({
    addKeyboardShortcuts() {
      return {
        "Meta-j": () => {
          console.log("Extension triggered");
          return true;
        },
      };
    },
  });

  const editor = useEditor({
    autofocus: false,
    extensions: [StarterKit],
  });

  return <div>EmailEditor</div>;
};

export default EmailEditor;
