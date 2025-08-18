import { Hero } from "@/components/HeroSection/Hero";
import { HeaderH } from "@/components/Header";
import ShootingStars from "@/components/Background/ShootingStars";
import Image from "next/image";

export default async function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-black text-white relative">
 
      <HeaderH />

      <main className="flex-1">
        <Hero
          title="For Recruiters — Mini ATS"
          headline="Track Candidates. Visualize Pipeline. Decide Faster."
          subheading="A recruiter-friendly Applicant Tracking System with drag-and-drop Kanban, instant filters, and a live analytics dashboard."
       >
         </Hero>
      </main>

      <footer className="bg-[#ffffff] dark:bg-black dark:border-white/10">
        <div className="flex flex-col md:flex-row justify-between items-center py-8 px-4 md:px-6 max-w-screen-xl mx-auto">
          
          <div className="flex items-center gap-2 font-bold mb-4 md:mb-0 text-black dark:text-white">
            <div className="size-6 rounded-full overflow-hidden flex items-center justify-center bg-white/20">
              <Image
                src="/Images/eraah.jpg" 
                alt="EraahAnalytics Logo"
                width={24}
                height={24}
                className="w-full h-full object-cover"
                priority
              />
            </div>
            <span>EraahAnalytics</span>
          </div>

          <p className="text-sm text-gray-600 dark:text-white">
            © 2025 EraahAnalytics. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
