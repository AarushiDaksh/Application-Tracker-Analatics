"use client";
import React from "react";

export default function RetroGrid() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-white dark:bg-black ">
    
      <div
        className="absolute inset-0"
        style={{
          WebkitMaskImage:
            "linear-gradient(to bottom, black 0%, black 70%, rgba(0,0,0,0) 100%)",
          maskImage:
            "linear-gradient(to bottom, black 0%, black 70%, rgba(0,0,0,0) 100%)",
        }}
      >
        <div
          className="w-full h-full dark:hidden"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0,0,0,0.06) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,0,0,0.06) 1px, transparent 1px)
            `,
            backgroundSize: "36px 36px",
         
          }}
        />

       
        <div
          className="hidden dark:block w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.09) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.09) 1px, transparent 1px)
            `,
            backgroundSize: "36px 36px",
         
          }}
        />
      </div>

     

 
    </div>
  );
}
