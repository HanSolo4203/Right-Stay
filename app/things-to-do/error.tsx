"use client";

import { useEffect } from "react";
import Header from "@/components/sections/Header";
import { GuideEmptyState } from "@/components/guide/GuideStates";

export default function ThingsToDoError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Things To Do page error:", error);
  }, [error]);

  return (
    <>
      <Header guideEnabled />
      <div className="flex h-[calc(100dvh-var(--site-header-height))] flex-col bg-[#121816] px-4 py-10 text-white sm:px-6">
        <GuideEmptyState
          title="The guide couldn’t load"
          body="Something went wrong while opening Things To Do. You can try again without leaving this page."
          action={
            <button
              type="button"
              onClick={reset}
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-right-stay-500 px-4 text-sm font-semibold text-white transition hover:bg-right-stay-600"
            >
              Try again
            </button>
          }
        />
      </div>
    </>
  );
}
