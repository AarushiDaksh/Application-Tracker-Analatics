// src/providers/auth-init.tsx
"use client";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setUser } from "@/store/slices/userSlice";

export default function AuthInit() {
  const dispatch = useDispatch();
  useEffect(() => {
    try {
      const raw = localStorage.getItem("eraah_user");
      if (raw) dispatch(setUser(JSON.parse(raw)));
    } catch {}
  }, [dispatch]);
  return null;
}
