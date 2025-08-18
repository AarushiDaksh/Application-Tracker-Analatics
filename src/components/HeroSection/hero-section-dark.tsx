"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

interface HeroProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  headline?: string;
  subheading?: string;
}

const HeroSection = React.forwardRef<HTMLDivElement, HeroProps>(
  (
    {
      className,
      title = "For Recruiters — Mini ATS",
      headline = "Track Candidates. Visualize Pipeline. Decide Faster.",
      subheading =
        "EraahAnalytics helps recruiters manage applications with drag-and-drop Kanban boards, instant filters, and live analytics dashboards powered by MongoDB/Postgres.",
      ...props
    },
    ref
  ) => {
    return (
      <div
        className={cn("relative min-h-screen bg-black text-white", className)}
        ref={ref}
        {...props}
      >
        <section className="relative z-[1] max-w-full mx-auto min-h-screen flex items-center">
          <div className="max-w-screen-xl mx-auto px-4 py-20 md:px-8 w-full">
            <div className="space-y-6 max-w-3xl leading-snug lg:leading-6 mx-auto text-center">
          
              <h2
                className="text-4xl md:text-6xl tracking-tighter font-bold 
                           bg-clip-text text-transparent 
                           bg-gradient-to-r from-gray-100 via-gray-300 to-gray-100
                           dark:from-gray-200 dark:via-gray-400 dark:to-gray-200"
              >
                {headline.split(" ").map((word, i, arr) =>
                  i >= arr.length - 2 ? (
                    <span
                      key={i}
                      className="text-transparent bg-clip-text 
                                 bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500
                                 dark:from-cyan-300 dark:via-sky-400 dark:to-blue-400"
                    >
                      {word}{" "}
                    </span>
                  ) : (
                    <span key={i}>{word} </span>
                  )
                )}
              </h2>

          
              <p className="max-w-2xl mx-auto text-gray-300 text-base md:text-lg leading-relaxed px-4">
                {subheading}
              </p>

              <h1
                className="inline-flex items-center gap-2 text-sm text-gray-300 font-medium mx-auto px-5 py-2
                           bg-gradient-to-tr from-zinc-300/10 via-purple-400/15 to-transparent
                           border border-white/10 rounded-3xl w-fit backdrop-blur-sm"
              >
                {title}
                <ChevronRight className="w-4 h-4" />
              </h1>
            </div>
          </div>
        </section>
      </div>
    );
  }
);

HeroSection.displayName = "HeroSection";
export { HeroSection };
