import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import React from "react";

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getSession();
  console.log(session, "session")
  if (!session) {
    redirect("/login");
  }
  return <div>{children}</div>;
}
