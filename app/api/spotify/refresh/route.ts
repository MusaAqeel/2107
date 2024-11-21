import { manualRefreshToken } from "@/utils/spotify";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  try {
    const result = await manualRefreshToken(userId);
    if (result.success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: 'Refresh failed' }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Refresh failed' }, { status: 500 });
  }
} 