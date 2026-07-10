/**
 * POST /api/register
 * Register a new restaurant (Partner onboarding flow).
 * Creates a restaurant + first branch in the database.
 */
import sql from '@/lib/db';
import { NextResponse } from 'next/server';

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      name, description, cuisineIds, typeCode, 
      emirateCode, area, address, phone, whatsapp, email,
      googleMapsUrl, socialLinks,
      adminUsername, adminPassword,
      latitude, longitude, deliveryPartners, menuItems,
      acceptsDineIn = true, acceptsDelivery = true
    } = body;

    if (!name || !typeCode || !emirateCode) {
      return NextResponse.json({ 
        error: 'Name, restaurant type, and emirate are required' 
      }, { status: 400 });
    }

    // Get restaurant type ID
    const [type] = await sql`SELECT id FROM restaurant_types WHERE code = ${typeCode}`;
    if (!type) return NextResponse.json({ error: 'Invalid restaurant type' }, { status: 400 });

    // Get emirate ID
    const [emirate] = await sql`SELECT id FROM emirates WHERE code = ${emirateCode}`;
    if (!emirate) return NextResponse.json({ error: 'Invalid emirate' }, { status: 400 });

    // Generate unique slug
    let baseSlug = slugify(name);
    let slug = baseSlug;
    let counter = 1;
    let existing = await sql`SELECT 1 FROM restaurants WHERE slug = ${slug}`;
    while (existing.length > 0) {
      slug = `${baseSlug}-${counter}`;
      counter++;
      existing = await sql`SELECT 1 FROM restaurants WHERE slug = ${slug}`;
    }

    // Create restaurant with credentials
    const [restaurant] = await sql`
      INSERT INTO restaurants (
        name, slug, description, email, restaurant_type_id, status, source, 
        admin_username, admin_password
      )
      VALUES (
        ${name}, ${slug}, ${description || null}, ${email || null}, ${type.id}, 'PENDING', 'PARTNER',
        ${adminUsername || 'Habesha'}, ${adminPassword || '1234'}
      )
      RETURNING *
    `;

    // Create primary branch
    const branchSlug = `${slug}-${emirateCode.toLowerCase()}`;
    const [branch] = await sql`
      INSERT INTO branches (
        restaurant_id, name, slug, emirate_id, area, address, phone, whatsapp_number, 
        email, google_maps_url, is_featured, latitude, longitude, accepts_dine_in, accepts_delivery
      )
      VALUES (
        ${restaurant.id}, ${`${name} - Main Branch`}, ${branchSlug}, ${emirate.id}, ${area || null}, 
        ${address || null}, ${phone || null}, ${whatsapp || null}, ${email || null}, ${googleMapsUrl || null}, 
        true, ${latitude || null}, ${longitude || null}, ${acceptsDineIn}, ${acceptsDelivery}
      )
      RETURNING *
    `;

    // Add cuisine mappings
    if (cuisineIds && cuisineIds.length > 0) {
      for (const cuisineCode of cuisineIds) {
        const [cuisine] = await sql`SELECT id FROM cuisines WHERE code = ${cuisineCode}`;
        if (cuisine) {
          await sql`INSERT INTO restaurant_cuisines (restaurant_id, cuisine_id) VALUES (${restaurant.id}, ${cuisine.id})`;
        }
      }
    }

    // Add social links
    if (socialLinks && socialLinks.length > 0) {
      for (const link of socialLinks) {
        if (!link.url) continue;
        const [platform] = await sql`SELECT id FROM social_platforms WHERE code = ${link.platformCode}`;
        if (platform) {
          await sql`
            INSERT INTO restaurant_social_links (restaurant_id, social_platform_id, url)
            VALUES (${restaurant.id}, ${platform.id}, ${link.url})
          `;
        }
      }
    }

    // Add delivery partner links
    if (deliveryPartners && deliveryPartners.length > 0) {
      for (const dp of deliveryPartners) {
        if (!dp.partnerUrl) continue;
        const [partner] = await sql`SELECT id FROM delivery_partners WHERE code = ${dp.code}`;
        if (partner) {
          await sql`
            INSERT INTO branch_delivery_partners (branch_id, delivery_partner_id, partner_url)
            VALUES (${branch.id}, ${partner.id}, ${dp.partnerUrl})
          `;
        }
      }
    }

    // Add menu items (grouped by categories)
    if (menuItems && menuItems.length > 0) {
      const categoriesMap = {};
      for (const item of menuItems) {
        const categoryName = item.category || 'Mains';
        if (!categoriesMap[categoryName]) {
          const [cat] = await sql`
            INSERT INTO menu_categories (restaurant_id, name, display_order)
            VALUES (${restaurant.id}, ${categoryName}, ${Object.keys(categoriesMap).length})
            RETURNING id
          `;
          categoriesMap[categoryName] = cat.id;
        }
        const categoryId = categoriesMap[categoryName];
        
        const tags = item.tags ? (Array.isArray(item.tags) ? item.tags : item.tags.split(',').map(t => t.trim()).filter(Boolean)) : [];

        await sql`
          INSERT INTO menu_items (category_id, name, description, price, image_url, tags, is_available)
          VALUES (${categoryId}, ${item.name}, ${item.description || ''}, ${item.price || 0}, ${item.imageUrl || null}, ${tags}, true)
        `;
      }
    }

    return NextResponse.json({ 
      success: true, 
      slug: restaurant.slug,
      id: restaurant.id,
      message: 'Restaurant registered successfully! You can now manage it from your admin dashboard.'
    });
  } catch (error) {
    console.error('Error registering restaurant:', error);
    return NextResponse.json({ error: 'Failed to register restaurant' }, { status: 500 });
  }
}
