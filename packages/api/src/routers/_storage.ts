import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { ORPCError } from "@orpc/server";
import { env } from "@tanisya/env/server";

import {
	decodeBase64File,
	inferStorageBucketFromPublicUrl,
	makePublicStorageUrl,
	makeVerificationStorageKey,
	sha256Hex,
} from "./_shared";

function createStorageClient() {
	if (!env.STORAGE_ACCOUNT_ID || !env.STORAGE_ACCESS_KEY_ID || !env.STORAGE_SECRET_ACCESS_KEY) {
		throw new ORPCError("INTERNAL_SERVER_ERROR", {
			message: "Konfigurasi storage belum lengkap.",
		});
	}

	return new S3Client({
		region: "auto",
		endpoint: `https://${env.STORAGE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
		credentials: {
			accessKeyId: env.STORAGE_ACCESS_KEY_ID,
			secretAccessKey: env.STORAGE_SECRET_ACCESS_KEY,
		},
	});
}

export async function uploadVerificationFileToStorage(input: {
	organizationId: string;
	domainId: string;
	domainName: string;
	fileName: string;
	contentType: string;
	fileBase64: string;
}) {
	const buffer = decodeBase64File(input.fileBase64);
	if (buffer.byteLength === 0) {
		throw new ORPCError("BAD_REQUEST", {
			message: "File verifikasi kosong.",
		});
	}

	const bucket = inferStorageBucketFromPublicUrl();
	const key = makeVerificationStorageKey({
		organizationId: input.organizationId,
		domainId: input.domainId,
		domainName: input.domainName,
		originalFileName: input.fileName,
	});

	const client = createStorageClient();

	await client.send(
		new PutObjectCommand({
			Bucket: bucket,
			Key: key,
			Body: buffer,
			ContentType: input.contentType,
			ContentLength: buffer.byteLength,
		}),
	);

	return {
		bucket,
		key,
		publicUrl: makePublicStorageUrl(key),
		sizeBytes: buffer.byteLength,
		checksumSha256: sha256Hex(buffer),
	};
}

export async function deleteVerificationFileFromStorage(storageKey: string) {
	const bucket = inferStorageBucketFromPublicUrl();
	const client = createStorageClient();

	await client.send(
		new DeleteObjectCommand({
			Bucket: bucket,
			Key: storageKey,
		}),
	);
}
