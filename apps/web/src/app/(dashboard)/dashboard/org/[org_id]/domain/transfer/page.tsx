import { SidebarPageHeader } from "@/components/sidebar-page-header";
import { DomainTransferForm } from "./domain-transfer-form";

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
					{ label: "Domain", href: `/dashboard/org/${org_id}/domain/` },
					{ label: "Transfer" },
				]}
			/>

			<DomainTransferForm />
		</>
	);
}
