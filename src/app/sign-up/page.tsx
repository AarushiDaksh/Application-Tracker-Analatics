"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/store/hooks";
import { setUser } from "@/store/slices/userSlice";
import Image from "next/image";

export default function SignUpPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        setLoading(false);
        return setError(data.error || "Failed to sign up");
      }

   
      dispatch(setUser(data.user));
      localStorage.setItem("eraah_user", JSON.stringify(data.user));

      router.push("/dashboard");
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid place-items-center px-4 bg-gradient-to-b from-white to-zinc-100 dark:from-black dark:to-neutral-900">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm space-y-5 rounded-2xl border border-black/10 dark:border-white/10 
                   bg-white/70 dark:bg-white/5 backdrop-blur-md shadow-sm p-6"
      >
      
        <div className="flex items-center gap-3 justify-center">
          <div className="size-9 rounded-full overflow-hidden ring-1 ring-black/10 dark:ring-white/10">
            <Image
              src="/Images/eraah.jpg"
              alt="EraahAnalytics"
              width={36}
              height={36}
              className="w-full h-full object-cover"
              priority
            />
          </div>
          <div className="text-lg font-semibold tracking-tight">
            <span className="text-black dark:text-white">EraahAnalytics</span>
          </div>
        </div>

        <h1 className="text-xl font-semibold text-center">Create your account</h1>

        {error && (
          <div className="text-sm rounded-lg border border-red-300/60 bg-red-50 text-red-700 p-2.5 dark:bg-red-950/30 dark:text-red-300 dark:border-red-900/40">
            {error}
          </div>
        )}

      
        <div className="space-y-1.5">
          <label className="block text-sm text-black/70 dark:text-white/70">Name</label>
          <input
            className="w-full rounded-lg border border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/5
                       px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/30 transition"
            placeholder="Aarushi Daksh"
            value={form.name}
            onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
            required
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm text-black/70 dark:text-white/70">Email</label>
          <input
            className="w-full rounded-lg border border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/5
                       px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/30 transition"
            placeholder="you@example.com"
            type="email"
            value={form.email}
            onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
            required
          />
        </div>

     
        <div className="space-y-1.5">
          <label className="block text-sm text-black/70 dark:text-white/70">Password</label>
          <div className="relative">
            <input
              className="w-full rounded-lg border border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/5
                         px-3 py-2.5 pr-14 outline-none focus:ring-2 focus:ring-blue-500/30 transition"
              placeholder="••••••••"
              type={showPwd ? "text" : "password"}
              value={form.password}
              onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
              required
            />
            <button
              type="button"
              onClick={() => setShowPwd((v) => !v)}
              className="absolute inset-y-0 right-2 my-1 rounded-md px-2 text-xs
                         text-black/60 dark:text-white/70 hover:bg-black/5 dark:hover:bg-white/10"
              aria-label={showPwd ? "Hide password" : "Show password"}
            >
              {showPwd ? "Hide" : "Show"}
            </button>
          </div>
          <p className="text-xs text-black/50 dark:text-white/50">
            Minimum 6 characters recommended.
          </p>
        </div>

       
        <div className="space-y-3">
          <button
            disabled={loading}
            className="w-full rounded-lg px-3 py-2.5 bg-blue-600 text-white 
                       hover:bg-blue-500 disabled:opacity-50 transition font-medium"
          >
            {loading ? "Creating..." : "Sign up"}
          </button>

        
          <button
            type="button"
            onClick={() => router.push("/")}
            className="w-full rounded-lg px-3 py-2.5 border border-black/10 dark:border-white/10
                       text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/10 transition"
          >
            Back to Home
          </button>
        </div>

        
        <p className="text-sm text-center">
          Already have an account?{" "}
          <a className="underline hover:text-blue-600" href="/sign-in">
            Sign in
          </a>
        </p>
      </form>
    </div>
  );
}
