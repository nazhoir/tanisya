import { SidebarPageHeader } from "@/components/sidebar-page-header";
import { DomainClient } from "./domain-lists-client";

export default async function DomainPage({
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
					{ label: "Domain" },
				]}
			/>
			<DomainClient orgId={org_id} />
		</>
	);
}
