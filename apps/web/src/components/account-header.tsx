import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@tanisya/ui/components/breadcrumb";
import { Separator } from "@tanisya/ui/components/separator";
import { SidebarTrigger } from "@tanisya/ui/components/sidebar";

interface AccountHeaderProps {
	page?: string;
}

export function AccountHeader({ page }: AccountHeaderProps) {
	return (
		<header className="flex h-16 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
			<div className="flex items-center gap-2 px-4">
				<SidebarTrigger className="-ms-1" />
				<Separator
					orientation="vertical"
					className="me-2 data-vertical:h-4 data-vertical:self-auto"
				/>
				<Breadcrumb>
					<BreadcrumbList>
						{page ? (
							<>
								<BreadcrumbItem className="hidden md:block">
									<BreadcrumbLink href="/account">Akun</BreadcrumbLink>
								</BreadcrumbItem>
								<BreadcrumbSeparator className="hidden md:block" />
								<BreadcrumbItem>
									<BreadcrumbPage>{page}</BreadcrumbPage>
								</BreadcrumbItem>
							</>
						) : (
							<BreadcrumbItem>
								<BreadcrumbPage>Profil Akun</BreadcrumbPage>
							</BreadcrumbItem>
						)}
					</BreadcrumbList>
				</Breadcrumb>
			</div>
		</header>
	);
}
