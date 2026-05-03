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

export function UserMenus({ orgId, orgSlug }: { orgId?: string; orgSlug?: string }) {
  const baseUrl = orgId || orgSlug ? `/org/${orgId || orgSlug}` : "";
  const menus = [
    {
      label: "Services",
      items: [
        { title: "AI", url: baseUrl + "/ai", icon: <RiRobot2Line />, status: "show" },
        { title: "SSL", url: baseUrl + "/ssl", icon: <RiCertificate2Line />, status: "show" },
        { title: "Email", url: baseUrl + "/email", icon: <RiMailSendLine />, status: "show" },
        { title: "Social API", url: baseUrl + "/social-api", icon: <RiShareLine />, status: "show" },
      ],
    },

    {
      label: "Cloud",
      items: [
        { title: "Domains", url: baseUrl + "/domains", icon: <RiGlobalLine />, status: "show" },
        { title: "Compute", url: baseUrl + "/compute", icon: <RiCloudLine />, status: "show" },
        { title: "Hosting", url: baseUrl + "/hosting", icon: <RiServerLine />, status: "show" },
        { title: "Object Storage", url: baseUrl + "/object-storage", icon: <RiBox3Line />, status: "show" },
        { title: "Block Storage", url: baseUrl + "/block-storage", icon: <RiHardDrive2Line />, status: "show" },
        { title: "Managed Database", url: baseUrl + "/managed-database", icon: <RiDatabase2Line />, status: "show" },
      ],
    },

    {
      label: "Other",
      items: [
        { title: "Billing", url: baseUrl + "/billing", icon: <RiBillLine />, status: "show" },
        { title: "Settings", url: baseUrl +"/settings", icon: <RiSettingsLine />, status: "show" },
        { title: "Support", url: "/support", icon: <RiCustomerService2Line />, status: "show" },
      ],
    },
  ];

  return menus;
}
