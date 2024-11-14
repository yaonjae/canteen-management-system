'use client'
import { LayoutDashboard, Package, ListCollapse, ArrowLeftRight, ChartNoAxesCombined, CircleUser, Users, ChevronDown, UserPen, LogOut } from "lucide-react"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarSeparator,
} from "@/components/ui/sidebar"
import { useStore } from "@/lib/store/app"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import axios from "axios"
import { SidebarItem } from "../../lib/types/sidebar"
import { useRouter } from "next/navigation"

const items: SidebarItem[] = [
    { title: "Dashboard", url: "#", icon: LayoutDashboard },
    { title: "Products", url: "#", icon: Package },
    { title: "Category", url: "#", icon: ListCollapse },
    { title: "Transaction", url: "#", icon: ArrowLeftRight },
    { title: "Sales", url: "#", icon: ChartNoAxesCombined },
    { title: "Employee", url: "#", icon: CircleUser },
    { title: "Customer", url: "#", icon: Users },
];

export function CashierSidebar() {
    const { user } = useStore()
    const router = useRouter()
    
    const logout = async () => {
        await axios.post("/api/auth/logout");
        window.location.href = "/";
    };

    return (
        <Sidebar>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton onClick={() => router.push('/')}>
                            <p className="uppercase font-bold">{user?.username}</p>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarSeparator />
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map(({ title, url, icon: Icon }) => (
                                <SidebarMenuItem key={title}>
                                    <SidebarMenuButton asChild>
                                        <a href={url}>
                                            <Icon />
                                            <span>{title}</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarSeparator />
            <SidebarFooter className="pb-3">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton onClick={logout}>
                            <LogOut />
                            <span>Logout</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}