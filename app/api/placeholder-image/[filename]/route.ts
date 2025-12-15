import { NextRequest, NextResponse } from 'next/server';

// This handles the dynamic route for placeholder images
export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    // Extract filename from the URL
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const filename = pathParts[pathParts.length - 1] || 'property-image';
    
    // Create a simple placeholder SVG
    const svg = `
      <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f3f4f6"/>
        <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" 
              font-family="Arial, sans-serif" font-size="24" fill="#6b7280">
          ${decodeURIComponent(filename)}
        </text>
        <text x="50%" y="60%" text-anchor="middle" dominant-baseline="middle" 
              font-family="Arial, sans-serif" font-size="16" fill="#9ca3af">
          Property Image Placeholder
        </text>
      </svg>
    `;
    
    const buffer = Buffer.from(svg);
    
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error serving placeholder image:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}