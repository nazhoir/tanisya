import type { Metadata } from "next";
import OrganizationsPageClient from "./page-client";

export const metadata: Metadata = {
	title: "Organisasi Kamu",
};
export default function OrganizationsPage() {
	return <OrganizationsPageClient />;
}
