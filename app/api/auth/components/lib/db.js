import { sql } from '@vercel/postgres';

export async function initDB() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS cars (
        id SERIAL PRIMARY KEY,
        type TEXT NOT NULL,
        plate TEXT NOT NULL,
        status TEXT DEFAULT 'Tersedia'
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS rentals (
        id SERIAL PRIMARY KEY,
        car_id INTEGER,
        car_type TEXT,
        car_plate TEXT,
        borrower_name TEXT,
        purpose TEXT,
        rent_date TEXT,
        rent_time TEXT,
        return_date TEXT,
        return_time TEXT,
        condition TEXT,
        status TEXT DEFAULT 'Dipinjam'
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS admin (
        id SERIAL PRIMARY KEY,
        password TEXT NOT NULL
      );
    `;

    const adminExists = await sql`SELECT * FROM admin LIMIT 1`;
    if (adminExists.rows.length === 0) {
      await sql`INSERT INTO admin (password) VALUES ('admin123')`;
    }
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

export { sql };
