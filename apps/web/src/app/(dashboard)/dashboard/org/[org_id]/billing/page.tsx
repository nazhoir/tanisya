import React from "react";
import { SidebarPageHeader } from "@/components/sidebar-page-header";

export default async function Page({
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
					{ label: "Tagihan" },
				]}
			/>
		</>
	);
}
