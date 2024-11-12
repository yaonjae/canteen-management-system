import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AdminSidebar } from "@/app/_components/admin-sidebar"

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            <AdminSidebar />
            <main className="w-full">
                <SidebarTrigger />
                <div className="px-10">
                    {children}
                </div>
            </main>
        </SidebarProvider>
    )
}
