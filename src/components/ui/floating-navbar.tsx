"use client";
import React from "react";
import Image from "next/image";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { Home, LayoutDashboard, LogIn } from "lucide-react";

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
<div className="flex items-center gap-1 sm:gap-2">
  {/* Greeting (md+ only) */}
  {user && (
    <span
      className="hidden md:inline text-sm text-black/70 dark:text-white/80 mr-1 max-w-[10rem] truncate"
      title={user.name}
    >
      Hi, {(user.name || "").split(" ")[0]}
    </span>
  )}

  {showThemeToggle && <ThemeToggle />}

  {/* Auth / Nav */}
  {!user ? (
    <>
      {/* Mobile: icon only */}
      <button
        onClick={() => router.push("/sign-in")}
        aria-label="Login"
        className="md:hidden inline-flex items-center justify-center h-10 w-10 rounded-full border border-neutral-300 dark:border-white/20 text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/10 transition active:scale-[0.98]"
      >
        <LogIn className="h-5 w-5" />
      </button>

      {/* md+: text button */}
      <button
        onClick={() => router.push("/sign-in")}
        className="hidden md:inline-flex px-3 py-1 rounded-full border border-neutral-300 dark:border-white/20 text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/10 transition"
      >
        Login
      </button>
    </>
  ) : (
    <>
      {/* Mobile: icon only */}
      <button
        onClick={() => router.push("/dashboard")}
        aria-label="Open Dashboard"
        className="md:hidden inline-flex items-center justify-center h-10 w-10 rounded-full bg-black text-white dark:bg-white dark:text-black border border-transparent hover:opacity-90 transition active:scale-[0.98]"
      >
         <LayoutDashboard className="h-5 w-5" />
      </button>

      {/* md+: text button */}
      <button
        onClick={() => router.push("/dashboard")}
        className="hidden md:inline-flex px-3 py-1 rounded-full bg-black text-white dark:bg-white dark:text-black border border-transparent hover:opacity-90 transition"
      >
        ATS
      </button>
    </>
  )}
</div>
      </motion.div>
    </AnimatePresence>
  );
};
