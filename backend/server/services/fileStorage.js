import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

// Upload buffer instead of file path
export async function uploadPhotoBuffer(buffer, keyName, mimeType) {
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: keyName,
    Body: buffer,
    ContentType: mimeType,
  });

  await r2.send(command);
  return keyName;
}

