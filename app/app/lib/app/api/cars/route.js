import { NextResponse } from 'next/server';
import { sql, initDB } from '@/lib/db';

export async function GET() {
  try {
    await initDB();
    const { rows } = await sql`SELECT * FROM cars ORDER BY id`;
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await initDB();
    const { type, plate } = await request.json();
    const { rows } = await sql`
      INSERT INTO cars (type, plate, status) 
      VALUES (${type}, ${plate}, 'Tersedia') 
      RETURNING *
    `;
    return NextResponse.json(rows[0]);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    await initDB();
    const { id, type, plate, status } = await request.json();
    const { rows } = await sql`
      UPDATE cars 
      SET type = ${type}, plate = ${plate}, status = ${status}
      WHERE id = ${id}
      RETURNING *
    `;
    return NextResponse.json(rows[0]);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    await initDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    await sql`DELETE FROM cars WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
