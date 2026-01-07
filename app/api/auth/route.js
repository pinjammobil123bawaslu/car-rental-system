import { NextResponse } from 'next/server';
import { sql, initDB } from '@/lib/db';

export async function POST(request) {
  try {
    await initDB();
    const { password } = await request.json();
    const { rows } = await sql`SELECT * FROM admin WHERE password = ${password}`;
    
    if (rows.length > 0) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
