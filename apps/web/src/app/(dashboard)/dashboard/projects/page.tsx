import { PageHeader } from "@/components/dashboard/page-header";
import { ProjectsClient } from "@/components/projects/projects-client";

export default function ProjectsPage() {
  return (
    <>
      <PageHeader
        crumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Projects" },
        ]}
      />
      <ProjectsClient />
    </>
  );
}