/**
 * Menu CRUD for a restaurant
 * GET  /api/restaurants/[slug]/menu — Fetch all categories + items
 * POST /api/restaurants/[slug]/menu — Add category or item
 * PUT  /api/restaurants/[slug]/menu — Update item
 * DELETE /api/restaurants/[slug]/menu — Delete item
 */
import sql from '@/lib/db';
import { NextResponse } from 'next/server';

async function getRestaurantId(slug) {
  const [r] = await sql`SELECT id FROM restaurants WHERE slug = ${slug} AND deleted_at IS NULL`;
  return r?.id || null;
}

export async function GET(request, { params }) {
  const { slug } = await params;
  const restaurantId = await getRestaurantId(slug);
  if (!restaurantId) return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });

  try {
    const categories = await sql`
      SELECT * FROM menu_categories
      WHERE restaurant_id = ${restaurantId} AND is_active = true
      ORDER BY display_order, name
    `;

    const items = await sql`
      SELECT mi.* FROM menu_items mi
      JOIN menu_categories mc ON mi.category_id = mc.id
      WHERE mc.restaurant_id = ${restaurantId}
      ORDER BY mi.display_order, mi.name
    `;

    const menu = categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      displayOrder: cat.display_order,
      items: items
        .filter(item => item.category_id === cat.id)
        .map(item => ({
          id: item.id,
          categoryId: item.category_id,
          name: item.name,
          description: item.description,
          price: parseFloat(item.price),
          imageUrl: item.image_url,
          tags: item.tags || [],
          isAvailable: item.is_available,
          displayOrder: item.display_order,
        })),
    }));

    return NextResponse.json(menu);
  } catch (error) {
    console.error('Error fetching menu:', error);
    return NextResponse.json({ error: 'Failed to fetch menu' }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  const { slug } = await params;
  const restaurantId = await getRestaurantId(slug);
  if (!restaurantId) return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });

  try {
    const body = await request.json();

    // Add a category
    if (body.type === 'category') {
      const [cat] = await sql`
        INSERT INTO menu_categories (restaurant_id, name, display_order)
        VALUES (${restaurantId}, ${body.name}, ${body.displayOrder || 0})
        RETURNING *
      `;
      return NextResponse.json({ success: true, category: cat });
    }

    // Add a menu item
    if (body.type === 'item') {
      const [item] = await sql`
        INSERT INTO menu_items (category_id, name, description, price, image_url, tags, display_order)
        VALUES (${body.categoryId}, ${body.name}, ${body.description || ''}, ${body.price || 0}, ${body.imageUrl || null}, ${body.tags || []}, ${body.displayOrder || 0})
        RETURNING *
      `;
      return NextResponse.json({ success: true, item });
    }

    return NextResponse.json({ error: 'Invalid type. Use "category" or "item"' }, { status: 400 });
  } catch (error) {
    console.error('Error creating menu item:', error);
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const { slug } = await params;
  const restaurantId = await getRestaurantId(slug);
  if (!restaurantId) return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });

  try {
    const body = await request.json();

    if (body.type === 'category') {
      const [cat] = await sql`
        UPDATE menu_categories
        SET name = ${body.name}, display_order = ${body.displayOrder || 0}, updated_at = now()
        WHERE id = ${body.id} AND restaurant_id = ${restaurantId}
        RETURNING *
      `;
      return NextResponse.json({ success: true, category: cat });
    }

    if (body.type === 'item') {
      const [item] = await sql`
        UPDATE menu_items
        SET 
          category_id = ${body.categoryId},
          name = ${body.name},
          description = ${body.description || ''},
          price = ${body.price || 0},
          image_url = ${body.imageUrl || null},
          tags = ${body.tags || []},
          is_available = ${body.isAvailable !== undefined ? body.isAvailable : true},
          display_order = ${body.displayOrder || 0},
          updated_at = now()
        WHERE id = ${body.id}
        RETURNING *
      `;
      return NextResponse.json({ success: true, item });
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (error) {
    console.error('Error updating menu:', error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const { slug } = await params;
  const restaurantId = await getRestaurantId(slug);
  if (!restaurantId) return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });

  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');

    if (!type || !id) {
      return NextResponse.json({ error: 'type and id are required' }, { status: 400 });
    }

    if (type === 'category') {
      // Deleting a category cascades to its items
      await sql`DELETE FROM menu_categories WHERE id = ${id} AND restaurant_id = ${restaurantId}`;
    } else if (type === 'item') {
      await sql`DELETE FROM menu_items WHERE id = ${id}`;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting:', error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
