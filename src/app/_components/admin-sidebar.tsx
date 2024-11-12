'use client'
import { LayoutDashboard, PackagePlus, Package, ListCollapse, ArrowLeftRight, ChartNoAxesCombined, CircleUser, Users, ChevronDown, UserPen, LogOut } from "lucide-react"
import {
    Sidebar,
    SidebarContent,
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

const items: SidebarItem[] = [
    { title: "Dashboard", url: "#", icon: LayoutDashboard },
    { title: "Products", url: "#", icon: Package },
    { title: "Add Products", url: "/admin/add-items", icon: PackagePlus },
    { title: "Category", url: "/admin/category", icon: ListCollapse },
    { title: "Transaction", url: "#", icon: ArrowLeftRight },
    { title: "Sales", url: "#", icon: ChartNoAxesCombined },
    { title: "Employee", url: "#", icon: CircleUser },
    { title: "Customer", url: "#", icon: Users },
];

export function AdminSidebar() {
    const { user } = useStore()

    const logout = async () => {
        await axios.post("/api/auth/logout");
        window.location.href = "/";
    };

    return (
        <Sidebar>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton>
                                    <p className="uppercase font-bold">{user?.username}</p>
                                    <ChevronDown className="ml-auto" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem>
                                    <UserPen />
                                    <span>Profile</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={logout}>
                                    <LogOut />
                                    <span>Logout</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
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
        </Sidebar>
    );
}