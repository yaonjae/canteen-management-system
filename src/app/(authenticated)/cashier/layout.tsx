import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { CashierSidebar } from "@/app/_components/cashier-sidebar"

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            <CashierSidebar />
            <main>
                <SidebarTrigger />
                <div className="px-10">
                    {children}
                </div>
            </main>
        </SidebarProvider>
    )
}
