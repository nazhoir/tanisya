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
  RiCommandLine,
  RiGraduationCapLine,
  RiTeamLine,
  RiChat3Line,
  RiRobot2Line,
  RiStore2Line,
  RiShieldCheckLine,
  RiWallet3Line,
  RiHardDrive2Line,
  RiBox3Line,
  RiServerLine,
  RiDatabase2Line,
  RiCloudLine,
  RiGlobalLine,
  RiBroadcastLine,
  RiMailSendLine,
  RiShareLine,
  RiBillLine,
  RiMoneyDollarCircleLine,
  RiSettingsLine,
  RiCustomerService2Line,
  RiUserSettingsLine,
  RiLineChartLine,
  RiTerminalBoxLine,
  RiToolsLine,
} from "@remixicon/react"

// Status yang tersedia: "early" | "soon" | "progress" | "show"
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
    role: "admin", 
  },
  navLearning: [
    {
      title: "Learn",
      url: "/learn",
      icon: <RiGraduationCapLine />,
      roles: ["user", "admin"],
      status: "show",
    },
    {
      title: "Community",
      url: "/community",
      icon: <RiTeamLine />,
      roles: ["user", "admin"],
      status: "progress",
    },
  ],
  navServices: [
    {
      title: "Chat",
      url: "/services/chat",
      icon: <RiChat3Line />,
      roles: ["user", "admin"],
      status: "early",
    },
    {
      title: "AI",
      url: "/services/ai",
      icon: <RiRobot2Line />,
      roles: ["user", "admin"],
      status: "soon",
    },
    {
      title: "API Marketplace",
      url: "/services/marketplace",
      icon: <RiStore2Line />,
      roles: ["user", "admin"],
      status: "show",
    },
    {
      title: "Security Advisor",
      url: "/services/security",
      icon: <RiShieldCheckLine />,
      roles: ["user", "admin"],
      status: "progress",
    },
    {
      title: "Managed Payment",
      url: "/services/payment",
      icon: <RiWallet3Line />,
      roles: ["user", "admin"],
      status: "show",
    },
  ],
  navInfrastructure: [
    {
      title: "Infrastructure",
      icon: <RiHardDrive2Line />,
      roles: ["user", "admin"],
      status: "show",
      isActive: true,
      items: [
        {
          title: "Pods",
          url: "/infrastructure/pods",
          icon: <RiBox3Line />,
          roles: ["user", "admin"],
          status: "show",
        },
        {
          title: "VPS",
          url: "/infrastructure/vps",
          icon: <RiServerLine />,
          roles: ["user", "admin"],
          status: "show",
        },
        {
          title: "Database",
          url: "/infrastructure/database",
          icon: <RiDatabase2Line />,
          roles: ["user", "admin"],
          status: "soon",
        },
        {
          title: "Object Storage",
          url: "/infrastructure/storage",
          icon: <RiCloudLine />,
          roles: ["user", "admin"],
          status: "progress",
        },
        {
          title: "Domains",
          url: "/infrastructure/domains",
          icon: <RiGlobalLine />,
          roles: ["user", "admin"],
          status: "early",
        },
      ],
    },
    {
      title: "Communication",
      icon: <RiBroadcastLine />,
      roles: ["user", "admin"],
      status: "show",
      items: [
        {
          title: "Email SMTP",
          url: "/communication/smtp",
          icon: <RiMailSendLine />,
          roles: ["user", "admin"],
          status: "show",
        },
        {
          title: "Social API",
          url: "/communication/social",
          icon: <RiShareLine />,
          roles: ["user", "admin"],
          status: "early",
        },
      ],
    },
  ],
  navAdmin: [
    {
      title: "User Management",
      url: "/admin/users",
      icon: <RiUserSettingsLine />,
      roles: ["admin"],
      status: "show",
    },
    {
      title: "Revenue Dashboard",
      url: "/admin/revenue",
      icon: <RiLineChartLine />,
      roles: ["admin"],
      status: "progress",
    },
    {
      title: "System Logs",
      url: "/admin/logs",
      icon: <RiTerminalBoxLine />,
      roles: ["admin"],
      status: "show",
    },
    {
      title: "Global Settings",
      url: "/admin/settings",
      icon: <RiToolsLine />,
      roles: ["admin"],
      status: "show",
    },
  ],
  navAccount: [
    {
      title: "Billing",
      url: "/account/billing",
      icon: <RiBillLine />,
      roles: ["user", "admin"],
      status: "show",
    },
    {
      title: "Affiliate",
      url: "/account/affiliate",
      icon: <RiMoneyDollarCircleLine />,
      roles: ["user", "admin"],
      status: "soon",
    },
    {
      title: "Settings",
      url: "/account/settings",
      icon: <RiSettingsLine />,
      roles: ["user", "admin"],
      status: "show",
    },
    {
      title: "Support",
      url: "/account/support",
      icon: <RiCustomerService2Line />,
      roles: ["user", "admin"],
      status: "progress",
    },
  ],
}

const getFilteredNav = (role: string) => {
  const allowedStatuses = ["show", "progress"]

  const filterItems = (navArray: any[]) =>
    navArray
      .filter((item) => item.roles.includes(role) && allowedStatuses.includes(item.status))
      .map((item) => {
        // Jika memiliki sub-items, filter juga sub-items tersebut
        if (item.items) {
          const filteredSubItems = item.items.filter(
            (subItem: any) =>
              subItem.roles.includes(role) && allowedStatuses.includes(subItem.status)
          )
          return { ...item, items: filteredSubItems }
        }
        return item
      })
      // Menghapus parent menu yang items-nya menjadi kosong setelah difilter
      .filter((item) => !item.items || item.items.length > 0)

  return {
    user: data.user,
    navLearning: filterItems(data.navLearning),
    navServices: filterItems(data.navServices),
    navInfrastructure: filterItems(data.navInfrastructure),
    navAdmin: filterItems(data.navAdmin),
    navAccount: filterItems(data.navAccount),
  }
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const userRole = data.user.role || "user"
  const filteredData = React.useMemo(() => getFilteredNav(userRole), [userRole])

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <a href="/">
                <RiCommandLine className="size-5!" />
                <span className="text-base font-semibold">Acme Inc.</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {filteredData.navLearning.length > 0 && (
          <NavMain label="Learning" items={filteredData.navLearning} />
        )}
        {filteredData.navServices.length > 0 && (
          <NavMain label="Services" items={filteredData.navServices} />
        )}
        {filteredData.navInfrastructure.length > 0 && (
          <NavMain label="Infrastructure & Comms" items={filteredData.navInfrastructure} />
        )}
        {filteredData.navAdmin.length > 0 && (
          <NavMain label="Administration" items={filteredData.navAdmin} />
        )}
        {filteredData.navAccount.length > 0 && (
          <NavSecondary items={filteredData.navAccount} className="mt-auto" />
        )}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={filteredData.user} />
      </SidebarFooter>
    </Sidebar>
  )
}