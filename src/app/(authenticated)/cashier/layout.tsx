import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { CashierSidebar } from "@/app/_components/cashier-sidebar"

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <main>
            <div className="px-10">
                {children}
            </div>
        </main>
    )
}
