"use client";
import React from "react";
import Image from "next/image";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";

interface FloatingNavProps {
  className?: string;
  showLogo?: boolean;
  showThemeToggle?: boolean;
}

export const FloatingNav: React.FC<FloatingNavProps> = ({
  className = "",
  showLogo = true,
  showThemeToggle = true,
}) => {
  const { scrollYProgress } = useScroll();
  const [visible, setVisible] = React.useState(true);
  const router = useRouter();

  const user = useAppSelector((s) => s.user.user);

  useMotionValueEvent(scrollYProgress, "change", (current) => {
    const prev = scrollYProgress.getPrevious() ?? 0;
    const direction = current - prev;
    setVisible(direction < 0 || window.scrollY < window.innerHeight);
  });

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1, y: 0 }}
        animate={{ y: visible ? 0 : -100, opacity: visible ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        className={`fixed top-3 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-lg px-5 py-2.5 rounded-full flex items-center justify-between border border-neutral-300 dark:border-white/20 bg-white/10 dark:bg-white/5 backdrop-blur-lg ${className}`}
      >
        {/* Logo */}
        {showLogo && (
          <div className="flex items-center gap-2 font-bold">
            <div className="size-7 rounded-full overflow-hidden flex items-center justify-center bg-white/20">
              <Image
                src="/Images/eraah.jpg"
                alt="EraahAnalytics Logo"
                width={28}
                height={28}
                className="w-full h-full object-cover"
                priority
              />
            </div>
            <span className="text-black dark:text-white">EraahAnalytics</span>
          </div>
        )}

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Greeting (when logged in) */}
          {user && (
            <span className="text-sm text-black/70 dark:text-white/80 mr-1">
              Hi, {user.name.split(" ")[0]}
            </span>
          )}

          {showThemeToggle && <ThemeToggle />}

          {/* If not logged in -> Login; If logged in -> ATS (to /dashboard) */}
          {!user ? (
            <button
              onClick={() => router.push("/sign-in")}
              className="px-3 py-1 rounded-full border border-neutral-300 dark:border-white/20 text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/10 transition"
            >
              Login
            </button>
          ) : (
            <button
              onClick={() => router.push("/dashboard")}
              className="px-3 py-1 rounded-full bg-black text-white dark:bg-white dark:text-black border border-transparent hover:opacity-90 transition"
            >
              ATS
            </button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
