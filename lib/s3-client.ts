import { S3Client } from "@aws-sdk/client-s3";

// Create S3 client instance
export const s3Client = new S3Client({
  region: process.env.S3_REGION || "us-east-1", // Use your preferred region
  endpoint: process.env.S3_ENDPOINT, // For MinIO or other S3-compatible services
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "",
  },
  // For local MinIO or other S3-compatible services, you may need to disable SSL
  forcePathStyle: process.env.S3_FORCE_PATH_STYLE === "true", // Needed for MinIO
});