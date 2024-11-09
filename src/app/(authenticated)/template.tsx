"use client";
import { useStore } from "@/lib/store/app";
import axios from "axios";
import React, { useEffect } from "react";

export default function Template({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { setUser } = useStore();
  //  eslint-disable @typescript-eslint/no-unused-expressions
  const logout = async () => {
    await axios.post("/api/auth/logout");
    window.location.href = "/";
  };
  useEffect(() => {
    const local = localStorage.getItem("user") || null;
    const user = (local ? JSON.parse(local) : null) as {
      username: string;
      role: string;
      user_id: string;
    } | null;
    if (user) {
      setUser({
        id: Number(user.user_id),
        role: user.role,
        username: user.username,
      });
    } else {
      async () => await logout();
    }
  },[]);
  return <div>{children}</div>;
}
