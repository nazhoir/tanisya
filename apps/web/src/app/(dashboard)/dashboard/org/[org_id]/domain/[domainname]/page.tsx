import { SidebarPageHeader } from "@/components/sidebar-page-header";

export default async function DomainPage({
	params,
}: {
	params: Promise<{ org_id: string; domainname: string }>;
}) {
	const { org_id, domainname } = await params;

	return (
		<>
			<SidebarPageHeader
				items={[
					{ label: "Organisasi", href: `/dashboard/org/${org_id}` },
					{ label: "Domain", href: `/dashboard/org/${org_id}/domain` },
					{ label: domainname },
				]}
			/>
		</>
	);
}
