import { type Router, route } from "@better-upload/server";
import { toRouteHandler } from "@better-upload/server/adapters/next";
import { cloudflare } from "@better-upload/server/clients";
import { env } from "@tanisya/env/server";

// URL publik R2 bucket kamu — tambahkan ke env
// Contoh: https://pub-xxxx.r2.dev  atau custom domain seperti https://cdn.tanisya.com
const R2_PUBLIC_URL = env.STORAGE_PUBLIC_URL; // e.g. "https://pub-xxxx.r2.dev"

const router: Router = {
	client: cloudflare({
		accountId: env.STORAGE_ACCOUNT_ID,
		accessKeyId: env.STORAGE_ACCESS_KEY_ID,
		secretAccessKey: env.STORAGE_SECRET_ACCESS_KEY,
	}),
	bucketName: "tanisya-bucket-dev",
	routes: {
		images: route({
			fileTypes: ["image/*"],
			multipleFiles: true,
			maxFiles: 4,
			maxFileSize: 1024 * 1024 * 2, // 2MB

			// 1. Sebelum upload: generate key unik per file
			onBeforeUpload: async ({ files }) => {
				return {
					generateObjectInfo: ({ file }) => ({
						// Gunakan key unik agar tidak tertimpa file lain
						key: `profile/${crypto.randomUUID()}-${file.name}`,
					}),
				};
			},

			// 2. Setelah signed URL dibuat: kembalikan URL publik ke client
			// onAfterSignedUrl dipanggil sekali setelah semua signed URL digenerate,
			// dengan files[] yang sudah berisi objectInfo.key final.
			onAfterSignedUrl: async ({ files }) => {
				return {
					metadata: {
						// Kirim array URL publik ke client
						urls: files.map(
							(file) => `${R2_PUBLIC_URL}/${file.objectInfo.key}`,
						),
					},
				};
			},
		}),
	},
};

export const { POST } = toRouteHandler(router);
