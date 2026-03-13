// app/domainsearch/page.tsx
// Server Component — tidak ada "use client"
// Menyatukan DomainSearchClient (interaktif) dalam wrapper min-h-screen

export const dynamic = "force-dynamic";

import { DomainSearchClient } from "./domain-search-client"

export default function DomainSearchPage() {
	return (
		<div className="min-h-screen bg-background">
			<DomainSearchClient />
		</div>
	);
}