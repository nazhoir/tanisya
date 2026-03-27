import { SidebarPageHeader } from "@/components/sidebar-page-header";
import { DomainRegisterClient } from "./domain-register-client";

export default async function DomainRegisterPage({
	params,
}: {
	params: Promise<{ org_id: string }>;
}) {
	const { org_id } = await params;

	return (
		<>
			<SidebarPageHeader
				items={[
					{ label: "Organisasi", href: `/dashboard/org/${org_id}` },
					{ label: "Domain", href: `/dashboard/org/${org_id}/domain/` },
					{ label: "Register" },
				]}
			/>
			<DomainRegisterClient orgId={org_id} />
		</>
	);
}
