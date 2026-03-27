import { Button } from "@tanisya/ui/components/button";
import {
	Card,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@tanisya/ui/components/card";

export default function RequestDeleteAccount() {
	return (
		<div className="mt-10 space-y-4">
			<div>
				<h2 className="font-semibold text-destructive text-xl tracking-tight">
					Zona Berbahaya
				</h2>
				<p className="mt-1 text-muted-foreground text-sm">
					Hati-hati dengan pengaturan ini. Tindakan ini tidak dapat dibatalkan.
				</p>
			</div>

			<Card className="border border-destructive/40 bg-destructive/5 shadow-none dark:bg-destructive/10">
				<CardHeader>
					<CardTitle className="font-bold text-base text-destructive">
						Permohonan Penghapusan Akun
					</CardTitle>
					<CardDescription className="text-destructive/80 text-sm leading-relaxed dark:text-destructive/70">
						Penghapusan akun Anda bersifat permanen dan tidak dapat dibatalkan.
						Data Anda akan dihapus dalam waktu 30 hari, tetapi kami dapat
						menyimpan beberapa metadata dan log lebih lama jika diperlukan atau
						diizinkan oleh hukum.
					</CardDescription>
				</CardHeader>

				<CardFooter className="flex justify-end border-destructive/20 border-t bg-destructive/10 px-6 py-3 dark:bg-destructive/15">
					<Button
						variant="outline"
						className="w-full border-destructive/50 text-destructive transition-colors hover:bg-destructive hover:text-destructive-foreground sm:w-auto dark:border-destructive/40 dark:hover:bg-destructive/80"
					>
						Ajukan Penghapusan Akun
					</Button>
				</CardFooter>
			</Card>
		</div>
	);
}
