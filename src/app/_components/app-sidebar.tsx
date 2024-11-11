'use client'
import { Calendar, Home, Inbox, Search, Settings, LayoutDashboard, PackagePlus, Package, ListCollapse, PackageSearch, ArrowLeftRight, ChartNoAxesCombined, CircleUser, Users, ChevronDown, UserPen, LogOut } from "lucide-react"
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

const itemsAdmin = [
    {
        title: "Dashboard",
        url: "#",
        icon: LayoutDashboard,
    },
    {
        title: "Items",
        url: "#",
        icon: Package,
    },
    {
        title: "Add Items",
        url: "#",
        icon: PackagePlus,
    },
    {
        title: "Category",
        url: "#",
        icon: ListCollapse,
    },
    {
        title: "Manage Items",
        url: "#",
        icon: PackageSearch,
    },
    {
        title: "Transaction",
        url: "#",
        icon: ArrowLeftRight,
    },
    {
        title: "Sales",
        url: "#",
        icon: ChartNoAxesCombined,
    },
    {
        title: "Employee",
        url: "#",
        icon: CircleUser,
    },
    {
        title: "Customer",
        url: "#",
        icon: Users,
    },
]

const itemsCashier = [
    {
        title: "Dashboard",
        url: "#",
        icon: LayoutDashboard,
    },
    {
        title: "Items",
        url: "#",
        icon: Package,
    },
    {
        title: "Category",
        url: "#",
        icon: ListCollapse,
    },
    {
        title: "Transaction",
        url: "#",
        icon: ArrowLeftRight,
    },
    {
        title: "Sales",
        url: "#",
        icon: ChartNoAxesCombined,
    },
    {
        title: "Employee",
        url: "#",
        icon: CircleUser,
    },
    {
        title: "Customer",
        url: "#",
        icon: Users,
    },
]

export function AppSidebar() {
    const user = useStore()
    const items = user.user?.role === "admin" ? itemsAdmin : itemsCashier
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
                                    <p className="uppercase font-bold">{user.user?.username}</p>
                                    <ChevronDown className="ml-auto" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-[--radix-popper-anchor-width]">
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
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <a href={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    )
}
