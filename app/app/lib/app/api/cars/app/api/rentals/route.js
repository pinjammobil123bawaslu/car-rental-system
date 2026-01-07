import { NextResponse } from 'next/server';
import { sql, initDB } from '@/lib/db';

export async function GET() {
  try {
    await initDB();
    const { rows } = await sql`SELECT * FROM rentals ORDER BY id DESC`;
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await initDB();
    const { carId, carType, carPlate, borrowerName, purpose, rentDate, rentTime } = await request.json();
    
    const { rows } = await sql`
      INSERT INTO rentals (car_id, car_type, car_plate, borrower_name, purpose, rent_date, rent_time, status)
      VALUES (${carId}, ${carType}, ${carPlate}, ${borrowerName}, ${purpose}, ${rentDate}, ${rentTime}, 'Dipinjam')
      RETURNING *
    `;
    
    await sql`UPDATE cars SET status = 'Dipinjam' WHERE id = ${carId}`;
    
    return NextResponse.json(rows[0]);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    await initDB();
    const { id, returnDate, returnTime, condition } = await request.json();
    
    const rental = await sql`SELECT car_id FROM rentals WHERE id = ${id}`;
    
    const { rows } = await sql`
      UPDATE rentals 
      SET return_date = ${returnDate}, return_time = ${returnTime}, condition = ${condition}, status = 'Selesai'
      WHERE id = ${id}
      RETURNING *
    `;
    
    await sql`UPDATE cars SET status = 'Tersedia' WHERE id = ${rental.rows[0].car_id}`;
    
    return NextResponse.json(rows[0]);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
