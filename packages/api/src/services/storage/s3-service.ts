// services/storage/s3-service.ts
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { customAlphabet } from "nanoid";

const nanoid = customAlphabet("1234567890abcdefghijklmnopqrstuvwxyz", 10);

const s3Client = new S3Client({
  region: process.env.S3_REGION || "auto",
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
  forcePathStyle: true,
});

export const uploadFileToS3 = async (fileBuffer: Buffer, fileName: string, mimeType: string, folder = "receipts") => {
  const bucketName = process.env.S3_BUCKET_NAME!;
  const fileExtension = fileName.split('.').pop();
  const uniqueFileName = `${folder}/${Date.now()}-${nanoid()}.${fileExtension}`;

  await s3Client.send(new PutObjectCommand({
    Bucket: bucketName,
    Key: uniqueFileName,
    Body: fileBuffer,
    ContentType: mimeType,
    ACL: "public-read",
  }));

  const publicEndpoint = process.env.S3_PUBLIC_ENDPOINT || process.env.S3_ENDPOINT;
  return `${publicEndpoint}/${bucketName}/${uniqueFileName}`;
};