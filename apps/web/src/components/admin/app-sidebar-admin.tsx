// file: components/app-sidebar-admin.tsx
"use client"

import * as React from "react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@tanisya/ui/components/sidebar"
import {
  RiShieldStarLine,
  RiLineChartLine,
  RiUserSettingsLine,
  RiBankCardLine,
  RiTicketLine,
  RiComputerLine,
  RiShieldKeyholeLine,
  RiMegaphoneLine,
  RiTerminalBoxLine,
  RiToolsLine,
  RiSettingsLine,
} from "@remixicon/react"

const adminData = {
  user: {
    name: "Admin Super",
    email: "admin@acme.com",
    avatar: "/avatars/admin.jpg",
  },
  navAdmin: [
    { title: "Revenue Dashboard", url: "/admin/revenue", icon: <RiLineChartLine />, status: "progress" },
    { title: "User Management", url: "/admin/users", icon: <RiUserSettingsLine />, status: "show" },
    { title: "Transactions", url: "/admin/transactions", icon: <RiBankCardLine />, status: "show" },
    { title: "Support Tickets", url: "/admin/tickets", icon: <RiTicketLine />, status: "show" },
    { title: "Node Management", url: "/admin/nodes", icon: <RiComputerLine />, status: "progress" },
    { title: "Abuse & Compliance", url: "/admin/compliance", icon: <RiShieldKeyholeLine />, status: "show" },
    { title: "Announcements", url: "/admin/announcements", icon: <RiMegaphoneLine />, status: "show" },
    { title: "System Logs", url: "/admin/logs", icon: <RiTerminalBoxLine />, status: "show" },
    { title: "Global Settings", url: "/admin/settings", icon: <RiToolsLine />, status: "show" },
  ],
  navAccount: [
    { title: "Admin Profile", url: "/admin/profile", icon: <RiSettingsLine />, status: "show" },
  ],
}

const filterActiveItems = (navArray: any[]) => {
  const allowedStatuses = ["show", "progress"]
  return navArray
    .filter((item) => allowedStatuses.includes(item.status))
    .map((item) => {
      if (item.items) {
        return {
          ...item,
          items: item.items.filter((subItem: any) => allowedStatuses.includes(subItem.status)),
        }
      }
      return item
    })
    .filter((item) => !item.items || item.items.length > 0)
}

export function AppSidebarAdmin({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const filteredAdmin = React.useMemo(() => filterActiveItems(adminData.navAdmin), [])
  const filteredAccount = React.useMemo(() => filterActiveItems(adminData.navAccount), [])

  return (
    <Sidebar collapsible="offcanvas" variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/admin">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
                  <RiShieldStarLine className="size-5" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">Administration</span>
                  <span className="text-xs text-muted-foreground">Control Panel</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {filteredAdmin.length > 0 && <NavMain label="Management" items={filteredAdmin} />}
        {filteredAccount.length > 0 && <NavSecondary items={filteredAccount} className="mt-auto" />}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={adminData.user} />
      </SidebarFooter>
    </Sidebar>
  )
}