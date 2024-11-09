import { redirect } from "next/navigation";
import Login from "./(authentication)/_components/login";
import { getSession } from "@/lib/session";

export default async function Home() {
  const session = await getSession()
  if (!session){
    redirect("/login")
    return null
  }
  if (session?.role === 'admin') {
    redirect('/admin');
    return null
  } else if (session?.role === 'cashier') {
    redirect('/cashier');
    return null
  } else 
  return
}
