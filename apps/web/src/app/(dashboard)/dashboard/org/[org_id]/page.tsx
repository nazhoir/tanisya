import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@tanisya/ui/components/breadcrumb";
import { Separator } from "@tanisya/ui/components/separator";
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@tanisya/ui/components/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarPageHeader } from "@/components/sidebar-page-header";

export default function Page() {
	return (
		<>
			<SidebarPageHeader items={[{ label: "Organisasi" }]} />

			<div className="flex flex-1 flex-col gap-4 p-4 pt-0">
				<div className="grid auto-rows-min gap-4 md:grid-cols-3">
					<div className="aspect-video rounded-xl bg-muted/50" />
					<div className="aspect-video rounded-xl bg-muted/50" />
					<div className="aspect-video rounded-xl bg-muted/50" />
				</div>
				<div className="min-h-screen flex-1 rounded-xl bg-muted/50 md:min-h-min" />
			</div>
		</>
	);
}
