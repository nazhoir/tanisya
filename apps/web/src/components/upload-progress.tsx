import type { UploadHookControl } from "@better-upload/client";
import { formatBytes } from "@better-upload/client/helpers";
import { Progress } from "@tanisya/ui/components/progress";
import { cn } from "@tanisya/ui/lib/utils";
import { Dot, File } from "lucide-react";

type UploadProgressProps = {
	control: UploadHookControl<true>;

	// Add any additional props you need.
};

export function UploadProgress({
	control: { progresses },
}: UploadProgressProps) {
	return (
		<div className="grid gap-2">
			{progresses.map((progress) => (
				<div
					key={progress.objectInfo.key}
					className={cn(
						"flex items-center gap-2 rounded-lg border bg-transparent p-3 dark:bg-input/10",
						{
							"border-red-500/60 bg-red-500/[0.04]!":
								progress.status === "failed",
						},
					)}
				>
					<FileIcon type={progress.type} />

					<div className="grid grow gap-1">
						<div className="flex items-center gap-0.5">
							<p className="max-w-40 truncate font-medium text-sm">
								{progress.name}
							</p>
							<Dot className="size-4 text-muted-foreground" />
							<p className="text-muted-foreground text-xs">
								{formatBytes(progress.size)}
							</p>
						</div>

						<div className="flex h-4 items-center">
							{progress.progress < 1 && progress.status !== "failed" ? (
								<Progress className="h-1.5" value={progress.progress * 100} />
							) : progress.status === "failed" ? (
								<p className="text-red-500 text-xs">Failed</p>
							) : (
								<p className="text-muted-foreground text-xs">Completed</p>
							)}
						</div>
					</div>
				</div>
			))}
		</div>
	);
}

const iconCaptions = {
	"image/": "IMG",
	"video/": "VID",
	"audio/": "AUD",
	"application/pdf": "PDF",
	"application/zip": "ZIP",
	"application/x-rar-compressed": "RAR",
	"application/x-7z-compressed": "7Z",
	"application/x-tar": "TAR",
	"application/json": "JSON",
	"application/javascript": "JS",
	"text/plain": "TXT",
	"text/csv": "CSV",
	"text/html": "HTML",
	"text/css": "CSS",
	"application/xml": "XML",
	"application/x-sh": "SH",
	"application/x-python-code": "PY",
	"application/x-executable": "EXE",
	"application/x-disk-image": "ISO",
};

function FileIcon({ type }: { type: string }) {
	const caption = Object.entries(iconCaptions).find(([key]) =>
		type.startsWith(key),
	)?.[1];

	return (
		<div className="relative shrink-0">
			<File className="size-12 text-muted-foreground" strokeWidth={1} />

			{caption && (
				<span className="absolute start-0.5 bottom-2.5 select-none rounded bg-primary px-1 py-px font-semibold text-primary-foreground text-xs">
					{caption}
				</span>
			)}
		</div>
	);
}
