import sql from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(request, { params }) {
  const { slug } = await params;
  
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }

    // Fetch restaurant matching slug with credentials
    const [restaurant] = await sql`
      SELECT id, admin_username, admin_password 
      FROM restaurants 
      WHERE slug = ${slug} AND deleted_at IS NULL
      LIMIT 1
    `;

    if (!restaurant) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
    }

    // Check credentials (case insensitive for username, exact match for password)
    if (
      restaurant.admin_username.toLowerCase() === username.toLowerCase() &&
      restaurant.admin_password === password
    ) {
      return NextResponse.json({ 
        success: true, 
        message: 'Authenticated successfully',
        restaurantId: restaurant.id
      });
    } else {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }

  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
