// file: components/app-sidebar-user.tsx
"use client";

import * as React from "react";

import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@tanisya/ui/components/sidebar";
import {
  RiBuildingLine,
  RiArrowDropDownLine,
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
  RiCertificate2Line,
} from "@remixicon/react";
import { UserMenus } from "./user-menus";
import { authClient } from "@/lib/auth-client";
import Loader from "./loader";

export function AppSidebarUser({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: activeOrganization, isPending } = authClient.useActiveOrganization();

  if (!activeOrganization || isPending) {
    return <div/>;
  }

  const menus = UserMenus({ orgId: activeOrganization.id });
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <RiBuildingLine className="size-4" />
              </div>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-semibold">{activeOrganization.name}</span>
                {/* <span className="text-xs text-muted-foreground">{userData.activeOrganization.plan}</span> */}
              </div>
              <RiArrowDropDownLine className="ml-auto size-5" />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {menus.map(({ label, items }) => (
          <NavMain key={label} label={label} items={items} />
        ))}
      </SidebarContent>
      <SidebarFooter>{/* <NavUser user={userData.user} /> */}</SidebarFooter>
    </Sidebar>
  );
}
