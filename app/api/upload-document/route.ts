import { NextRequest, NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client } from "@/lib/s3-client"; // assuming you have this configured
import { AuthService } from "@/lib/auth";
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const userId = formData.get('userId') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Verify user authentication
    if (!userId) {
      const sessionToken = request.cookies.get("session_token")?.value;
      if (sessionToken) {
        const user = await AuthService.verifySession(sessionToken);
        if (user) {
          userId = user.id;
        }
      }
    }

    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'File type not supported' }, { status: 400 });
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size exceeds 10MB limit' }, { status: 400 });
    }

    // Generate unique filename
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'unknown';
    const uniqueFileName = `${userId}/${uuidv4()}.${fileExtension}`;
    
    // Read file buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Upload to S3/MinIO
    const putObjectCommand = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME || 'msa-documents',
      Key: uniqueFileName,
      Body: buffer,
      ContentType: file.type,
    });

    await s3Client.send(putObjectCommand);

    // Store document metadata in database
    const documentRecord = {
      id: crypto.randomUUID(),
      userId: userId,
      fileName: file.name,
      originalName: file.name,
      fileKey: uniqueFileName,
      fileSize: file.size,
      mimeType: file.type,
      uploadDate: new Date().toISOString(),
      status: 'processed'
    };

    // Assuming you have a documents table in your database
    // Replace this with your actual database call
    // await db.insert(documents).values(documentRecord);

    return NextResponse.json({
      success: true,
      documentId: documentRecord.id,
      fileName: documentRecord.fileName,
      fileKey: documentRecord.fileKey
    });
  } catch (error) {
    console.error('Document upload error:', error);
    return NextResponse.json({ error: 'Failed to upload document' }, { status: 500 });
  }
}