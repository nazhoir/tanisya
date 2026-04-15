"use client";

import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@tanisya/ui/components/avatar";
import { Badge } from "@tanisya/ui/components/badge";
import { Button } from "@tanisya/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@tanisya/ui/components/card";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@tanisya/ui/components/dropdown-menu";
import { ScrollArea } from "@tanisya/ui/components/scroll-area";
import { Separator } from "@tanisya/ui/components/separator";
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
} from "@tanisya/ui/components/sheet";
import {
	ArrowRight,
	Calendar,
	Edit,
	Eye,
	Mail,
	MoreVertical,
	Shield,
	Trash2,
	User,
	Users,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type UserItem = {
	id: string;
	name: string;
	email?: string | null;
	image?: string | null;
	role?: string;
	createdAt?: Date | string;
	emailVerified?: boolean;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string) {
	return name
		.split(" ")
		.map((n) => n[0])
		.slice(0, 2)
		.join("")
		.toUpperCase();
}

function formatDate(date?: Date | string) {
	if (!date) return "—";
	return new Date(date).toLocaleDateString("id-ID", {
		day: "numeric",
		month: "long",
		year: "numeric",
	});
}

// ─── InfoRow ─────────────────────────────────────────────────────────────────

function InfoRow({
	icon,
	label,
	value,
	mono,
}: {
	icon: React.ReactNode;
	label: string;
	value: string;
	mono?: boolean;
}) {
	return (
		<div className="flex items-start gap-3">
			<span className="mt-0.5 shrink-0 text-muted-foreground">{icon}</span>
			<div className="min-w-0 flex-1">
				<p className="text-muted-foreground text-xs">{label}</p>
				<p
					className={`break-all font-medium text-sm ${mono ? "font-mono text-xs" : ""}`}
				>
					{value}
				</p>
			</div>
		</div>
	);
}

// ─── UserSheet ────────────────────────────────────────────────────────────────

function UserSheet({
	user,
	open,
	onClose,
}: {
	user: UserItem | null;
	open: boolean;
	onClose: () => void;
}) {
	if (!user) return null;

	return (
		<Sheet open={open} onOpenChange={(v) => !v && onClose()}>
			<SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
				{/* Banner */}
				<div className="h-28 shrink-0 bg-linear-to-br from-slate-800 to-slate-600" />

				{/* Avatar overlap */}
				<div className="-mt-10 mb-4 px-6">
					<Avatar className="h-20 w-20 border-4 border-background shadow-xl">
						<AvatarImage src={user.image ?? undefined} alt={user.name} />
						<AvatarFallback className="bg-slate-700 font-bold text-white text-xl">
							{getInitials(user.name)}
						</AvatarFallback>
					</Avatar>
				</div>

				<SheetHeader className="px-6 pb-4">
					<SheetTitle className="font-semibold text-xl">{user.name}</SheetTitle>
					<SheetDescription className="flex items-center gap-1.5 text-sm">
						<Mail className="h-3.5 w-3.5" />
						{user.email ?? "Tidak ada email"}
					</SheetDescription>
					<div className="flex flex-wrap gap-2 pt-1">
						{user.role && (
							<Badge variant="secondary" className="capitalize">
								<Shield className="mr-1 h-3 w-3" />
								{user.role}
							</Badge>
						)}
						<Badge variant={user.emailVerified ? "default" : "outline"}>
							{user.emailVerified ? "Terverifikasi" : "Belum Verifikasi"}
						</Badge>
					</div>
				</SheetHeader>

				<Separator />

				<ScrollArea className="flex-1 px-6 py-4">
					<div className="space-y-5">
						<div className="space-y-3">
							<p className="font-semibold text-muted-foreground text-xs uppercase tracking-widest">
								Informasi Akun
							</p>
							<div className="grid gap-3">
								<InfoRow
									icon={<User className="h-4 w-4" />}
									label="ID"
									value={user.id}
									mono
								/>
								<InfoRow
									icon={<Calendar className="h-4 w-4" />}
									label="Bergabung"
									value={formatDate(user.createdAt)}
								/>
								<InfoRow
									icon={<Mail className="h-4 w-4" />}
									label="Email"
									value={user.email ?? "—"}
								/>
							</div>
						</div>

						<Separator />

						<div className="space-y-3">
							<p className="font-semibold text-muted-foreground text-xs uppercase tracking-widest">
								Aksi Cepat
							</p>
							<div className="grid grid-cols-2 gap-2">
								<Button
									variant="outline"
									size="sm"
									className="justify-start gap-2"
								>
									<Edit className="h-3.5 w-3.5" /> Edit
								</Button>
								<Button
									variant="outline"
									size="sm"
									className="justify-start gap-2 text-destructive hover:text-destructive"
								>
									<Trash2 className="h-3.5 w-3.5" /> Hapus
								</Button>
							</div>
						</div>
					</div>
				</ScrollArea>

				<SheetFooter className="gap-2 border-t p-4">
					<SheetClose asChild>
						<Button variant="ghost" className="flex-1">
							Tutup
						</Button>
					</SheetClose>
					<Button asChild className="flex-1 gap-2">
						<Link href={`/admin/users/${user.id}` as any}>
							Lihat Detail <ArrowRight className="h-4 w-4" />
						</Link>
					</Button>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	);
}

// ─── UserCard ─────────────────────────────────────────────────────────────────

function UserCard({ user, onClick }: { user: UserItem; onClick: () => void }) {
	return (
		<Card
			className="group relative cursor-pointer overflow-hidden transition-all duration-200 hover:border-primary/30 hover:shadow-md"
			onClick={onClick}
		>
			<span className="absolute top-0 bottom-0 left-0 w-0.5 origin-center scale-y-0 rounded-full bg-primary transition-transform duration-200 group-hover:scale-y-100" />

			<CardHeader className="pb-2">
				<div className="flex items-start justify-between gap-3">
					<div className="flex min-w-0 items-center gap-3">
						<Avatar className="h-10 w-10 shrink-0">
							<AvatarImage src={user.image ?? undefined} alt={user.name} />
							<AvatarFallback className="bg-slate-100 font-semibold text-sm dark:bg-slate-800">
								{getInitials(user.name)}
							</AvatarFallback>
						</Avatar>
						<div className="min-w-0">
							<CardTitle className="truncate text-base leading-tight">
								{user.name}
							</CardTitle>
							<CardDescription className="mt-0.5 truncate text-xs">
								{user.email ?? "Tidak ada email"}
							</CardDescription>
						</div>
					</div>

					<DropdownMenu>
						<DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
							<Button
								variant="ghost"
								size="icon"
								className="h-8 w-8 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
							>
								<MoreVertical className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="w-44">
							<DropdownMenuLabel>Opsi Pengguna</DropdownMenuLabel>
							<DropdownMenuSeparator />
							<DropdownMenuItem asChild>
								<Link
									href={`/admin/users/${user.id}` as any}
									className="flex items-center gap-2"
									onClick={(e) => e.stopPropagation()}
								>
									<Eye className="h-4 w-4" /> Lihat Detail
								</Link>
							</DropdownMenuItem>
							<DropdownMenuItem
								className="gap-2"
								onClick={(e) => e.stopPropagation()}
							>
								<Edit className="h-4 w-4" /> Edit Pengguna
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem
								className="gap-2 text-destructive focus:text-destructive"
								onClick={(e) => e.stopPropagation()}
							>
								<Trash2 className="h-4 w-4" /> Hapus
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</CardHeader>

			<CardContent className="pb-3">
				<div className="flex flex-wrap gap-2">
					{user.role && (
						<Badge variant="secondary" className="text-xs capitalize">
							{user.role}
						</Badge>
					)}
					<Badge
						variant={user.emailVerified ? "default" : "outline"}
						className="text-xs"
					>
						{user.emailVerified ? "Terverifikasi" : "Belum Verifikasi"}
					</Badge>
				</div>
			</CardContent>

			<CardFooter className="pt-0 pb-3">
				<p className="text-muted-foreground text-xs">
					Bergabung {formatDate(user.createdAt)}
				</p>
			</CardFooter>
		</Card>
	);
}

// ─── UsersGrid ────────────────────────────────────────────────────────────────

export function UsersGrid({ users }: { users: UserItem[] }) {
	const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
	const [sheetOpen, setSheetOpen] = useState(false);

	const handleCardClick = (user: UserItem) => {
		setSelectedUser(user);
		setSheetOpen(true);
	};

	if (users.length === 0) {
		return (
			<div className="py-20 text-center text-muted-foreground">
				<Users className="mx-auto mb-3 h-12 w-12 opacity-20" />
				<p className="font-medium text-sm">Tidak ada pengguna ditemukan</p>
				<p className="mt-1 text-xs">
					Coba ubah filter atau kata kunci pencarian
				</p>
			</div>
		);
	}

	return (
		<>
			<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
				{users.map((user) => (
					<UserCard
						key={user.id}
						user={user}
						onClick={() => handleCardClick(user)}
					/>
				))}
			</div>

			<UserSheet
				user={selectedUser}
				open={sheetOpen}
				onClose={() => setSheetOpen(false)}
			/>
		</>
	);
}
