"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import RetroGrid from "../Background/RetroGrid";

interface HeroProps {
  title?: string;
  headline?: string;
  subheading?: string;
}

export const Hero: React.FC<HeroProps> = ({
  title = "For Recruiters — Mini ATS",
  headline = "Track Candidates. Visualize Pipeline. Decide Faster.",
  subheading =
    "A recruiter-friendly Applicant Tracking System with drag-and-drop Kanban, quick filters, and a live analytics dashboard.",
}) => {
  return (
    <div className={cn("relative min-h-screen flex items-center justify-center text-center px-6")}>
      
      <div
        className="absolute inset-0 z-[0] bg-white bg-[url('https://raw.githubusercontent.com/AarushiDaksh/assets/main/skillswap-light.png')] bg-cover bg-center dark:hidden"
        style={{ backgroundBlendMode: "screen", backgroundColor: "#f5f5f5" }}
      />

      <div className="absolute inset-0 z-[0] hidden dark:block bg-gradient-to-b from-black via-neutral-900 to-black" />
      <RetroGrid />
      <section className="relative max-w-full mx-auto z-[1] min-h-screen flex items-center">
        <div className="max-w-screen-xl z-10 mx-auto px-4 py-20 md:px-8 w-full">
          <div className="space-y-5 max-w-3xl leading-snug lg:leading-5 mx-auto text-center">
            
       
<h2
  className="
    text-4xl md:text-6xl tracking-tight font-bold
    bg-clip-text text-transparent mx-auto
    bg-[linear-gradient(90deg,#ec4899,#3b82f6,#f59e0b)]
    dark:bg-[linear-gradient(90deg,#f9a8d4,#60a5fa,#fbbf24)]
  "
>
  {headline}
</h2>



            <p className="max-w-2xl mx-auto text-gray-700 dark:text-gray-300 text-base md:text-lg leading-relaxed px-4">
              {subheading}
            </p>

            
            <h1
              className="text-sm text-gray-600 dark:text-gray-400 group font-medium mx-auto px-5 py-2
                         bg-gradient-to-tr from-zinc-300/20 via-blue-300/10 to-transparent
                         dark:from-zinc-300/10 dark:via-blue-400/10
                         border border-black/5 dark:border-white/10 rounded-3xl w-fit"
            >
              {title}
              <ChevronRight className="inline w-4 h-4 ml-2 group-hover:translate-x-1 duration-300" />
            </h1>
          </div>
        </div>
      </section>
    </div>
  );
};
