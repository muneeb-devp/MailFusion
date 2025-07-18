import { cn } from "@/lib/utils";
import { KBarResults, useMatches } from "kbar";
import React from "react";
import ResultItem from "./ResultItem";

type Props = {};

const RenderResult = (props: Props) => {
  const { results, rootActionId } = useMatches();

  return (
    <KBarResults
      items={results}
      onRender={({ item, active }) => {
        if (typeof item === "string") {
          return (
            <div className="px-4 py-2 text-sm uppercase text-gray-600 opacity-50 dark:text-gray-400">
              {item}
            </div>
          );
        }

        return (
          <ResultItem
            action={item}
            active={active}
            currentRootActionId={rootActionId ?? ""}
          />
        );
      }}
    />
  );
};

export default RenderResult;
