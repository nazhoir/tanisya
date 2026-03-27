"use client";

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
import { Globe, LogOut, Monitor, Smartphone } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SessionItem {
	id: string;
	token: string;
	ipAddress?: string | null;
	userAgent?: string | null;
	createdAt: Date;
	expiresAt: Date;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Baca nama browser & OS dari userAgent string */
function parseUserAgent(ua: string | null | undefined): {
	browser: string;
	os: string;
	isMobile: boolean;
} {
	if (!ua)
		return {
			browser: "Browser tidak diketahui",
			os: "OS tidak diketahui",
			isMobile: false,
		};

	const isMobile = /mobile|android|iphone|ipad/i.test(ua);

	let browser = "Browser tidak diketahui";
	if (/edg\//i.test(ua)) browser = "Microsoft Edge";
	else if (/opr\//i.test(ua)) browser = "Opera";
	else if (/chrome/i.test(ua)) browser = "Google Chrome";
	else if (/safari/i.test(ua)) browser = "Safari";
	else if (/firefox/i.test(ua)) browser = "Mozilla Firefox";

	let os = "OS tidak diketahui";
	if (/windows nt 10/i.test(ua)) os = "Windows 10/11";
	else if (/windows/i.test(ua)) os = "Windows";
	else if (/mac os x/i.test(ua)) os = "macOS";
	else if (/android/i.test(ua)) os = "Android";
	else if (/iphone|ipad/i.test(ua)) os = "iOS";
	else if (/linux/i.test(ua)) os = "Linux";

	return { browser, os, isMobile };
}

function formatDate(date: Date) {
	return new Intl.DateTimeFormat("id-ID", {
		day: "numeric",
		month: "short",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	}).format(new Date(date));
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ManageSessionForm() {
	const [sessions, setSessions] = useState<SessionItem[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [revokingId, setRevokingId] = useState<string | null>(null);
	const [isRevokingOthers, setIsRevokingOthers] = useState(false);

	// Ambil token sesi aktif untuk menandai "Saat ini"
	const { data: currentSession } = authClient.useSession();
	const currentToken = currentSession?.session?.token;

	// ─── Fetch sessions ────────────────────────────────────────────────────
	const fetchSessions = async () => {
		setIsLoading(true);
		const result = await authClient.listSessions();
		if (result.data) {
			// Urutkan: sesi aktif di atas, lalu terbaru
			const sorted = [...result.data].sort((a, b) => {
				if (a.token === currentToken) return -1;
				if (b.token === currentToken) return 1;
				return (
					new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
				);
			});
			setSessions(sorted as SessionItem[]);
		}
		setIsLoading(false);
	};

	useEffect(() => {
		fetchSessions();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentToken]);

	// ─── Revoke satu sesi ──────────────────────────────────────────────────
	const handleRevoke = async (token: string, sessionId: string) => {
		setRevokingId(sessionId);
		await authClient.revokeSession(
			{ token },
			{
				onSuccess: () => {
					setSessions((prev) => prev.filter((s) => s.id !== sessionId));
					toast.success("Sesi berhasil dicabut");
				},
				onError: ({ error }) => {
					toast.error(error.message || "Gagal mencabut sesi");
				},
			},
		);
		setRevokingId(null);
	};

	// ─── Revoke semua sesi lain (kecuali sesi aktif) ──────────────────────
	const handleRevokeOthers = async () => {
		setIsRevokingOthers(true);
		await authClient.revokeOtherSessions(
			{},
			{
				onSuccess: () => {
					setSessions((prev) => prev.filter((s) => s.token === currentToken));
					toast.success("Semua sesi lain berhasil dicabut");
				},
				onError: ({ error }) => {
					toast.error(error.message || "Gagal mencabut sesi lain");
				},
			},
		);
		setIsRevokingOthers(false);
	};

	// ─── Revoke semua sesi (termasuk aktif → logout) ──────────────────────
	const handleRevokeAll = async () => {
		await authClient.revokeSessions(
			{},
			{
				onSuccess: () => {
					toast.success("Semua sesi berhasil dicabut. Kamu akan keluar.");
					// Redirect ke halaman login setelah semua sesi dicabut
					window.location.href = "/auth/sign-in";
				},
				onError: ({ error }) => {
					toast.error(error.message || "Gagal mencabut semua sesi");
				},
			},
		);
	};

	const otherSessionsCount = sessions.filter(
		(s) => s.token !== currentToken,
	).length;

	// ─── Render ────────────────────────────────────────────────────────────
	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-base">Sesi Aktif</CardTitle>
				<CardDescription>Kelola sesi login aktif kamu.</CardDescription>
			</CardHeader>

			<CardContent className="space-y-3">
				{isLoading ? (
					// Skeleton
					Array.from({ length: 2 }).map((_, i) => (
						<div
							key={i}
							className="flex items-center justify-between rounded-lg border p-3"
						>
							<div className="flex items-center gap-3">
								<div className="h-8 w-8 animate-pulse rounded-md bg-muted" />
								<div className="space-y-1.5">
									<div className="h-3.5 w-32 animate-pulse rounded bg-muted" />
									<div className="h-3 w-24 animate-pulse rounded bg-muted" />
								</div>
							</div>
						</div>
					))
				) : sessions.length === 0 ? (
					<p className="py-4 text-center text-muted-foreground text-sm">
						Tidak ada sesi aktif.
					</p>
				) : (
					sessions.map((session) => {
						const isCurrent = session.token === currentToken;
						const { browser, os, isMobile } = parseUserAgent(session.userAgent);
						const isRevoking = revokingId === session.id;

						return (
							<div
								key={session.id}
								className="flex items-center justify-between rounded-lg border p-3"
							>
								<div className="flex items-center gap-3">
									<div className="rounded-md bg-muted p-2">
										{isMobile ? (
											<Smartphone className="h-4 w-4 text-muted-foreground" />
										) : (
											<Monitor className="h-4 w-4 text-muted-foreground" />
										)}
									</div>
									<div>
										<p className="font-medium text-sm">
											{browser} · {os}
										</p>
										<p className="text-muted-foreground text-xs">
											{session.ipAddress ?? "IP tidak diketahui"} ·{" "}
											{formatDate(session.createdAt)}
										</p>
									</div>
								</div>

								<div className="flex items-center gap-2">
									{isCurrent ? (
										<Badge
											variant="outline"
											className="border-emerald-300 text-emerald-600 text-xs dark:border-emerald-700 dark:text-emerald-400"
										>
											Saat ini
										</Badge>
									) : (
										<Button
											variant="ghost"
											size="sm"
											className="h-8 gap-1 text-destructive text-xs hover:text-destructive"
											onClick={() => handleRevoke(session.token, session.id)}
											disabled={isRevoking || isRevokingOthers}
										>
											<LogOut className="h-3.5 w-3.5" />
											{isRevoking ? "Mencabut..." : "Cabut"}
										</Button>
									)}
								</div>
							</div>
						);
					})
				)}
			</CardContent>

			{/* Footer aksi batch — hanya tampil jika ada sesi lain */}
			{otherSessionsCount > 0 && (
				<CardFooter className="flex justify-end gap-2 border-t pt-4">
					<Button
						variant="outline"
						size="sm"
						onClick={handleRevokeOthers}
						disabled={isRevokingOthers || revokingId !== null}
					>
						{isRevokingOthers
							? "Mencabut..."
							: `Cabut Sesi Lain (${otherSessionsCount})`}
					</Button>
					<Button
						variant="destructive"
						size="sm"
						onClick={handleRevokeAll}
						disabled={isRevokingOthers || revokingId !== null}
					>
						<LogOut className="mr-1.5 h-3.5 w-3.5" />
						Cabut Semua & Keluar
					</Button>
				</CardFooter>
			)}
		</Card>
	);
}
