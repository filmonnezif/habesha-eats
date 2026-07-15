/**
 * GET /api/restaurants/[slug]
 * Fetch a single restaurant with full details including menu, branches, social links.
 * 
 * PUT /api/restaurants/[slug]
 * Update restaurant info (name, tagline, description, cuisines, branches, social links, delivery partners, and admin credentials)
 */
import sql from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  const { slug } = await params;
  
  try {
    // Fetch restaurant
    const [restaurant] = await sql`
      SELECT 
        r.*, rt.name as type_name, rt.code as type_code
      FROM restaurants r
      JOIN restaurant_types rt ON r.restaurant_type_id = rt.id
      WHERE r.slug = ${slug} AND r.deleted_at IS NULL
      LIMIT 1
    `;

    if (!restaurant) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
    }

    // Fetch branches with emirate
    const branches = await sql`
      SELECT 
        b.*, e.name as emirate_name, e.code as emirate_code
      FROM branches b
      JOIN emirates e ON b.emirate_id = e.id
      WHERE b.restaurant_id = ${restaurant.id} AND b.deleted_at IS NULL
      ORDER BY b.is_featured DESC, b.name
    `;

    // Fetch branch hours
    const branchHours = await sql`
      SELECT bh.* FROM branch_hours bh
      JOIN branches b ON bh.branch_id = b.id
      WHERE b.restaurant_id = ${restaurant.id}
      ORDER BY bh.day_of_week
    `;

    // Fetch cuisines
    const cuisines = await sql`
      SELECT c.name, c.code FROM restaurant_cuisines rc
      JOIN cuisines c ON rc.cuisine_id = c.id
      WHERE rc.restaurant_id = ${restaurant.id}
    `;

    // Fetch social links
    const socialLinks = await sql`
      SELECT sp.name as platform, sp.code as platform_code, rsl.url
      FROM restaurant_social_links rsl
      JOIN social_platforms sp ON rsl.social_platform_id = sp.id
      WHERE rsl.restaurant_id = ${restaurant.id}
    `;

    // Fetch menu categories + items
    const menuCategories = await sql`
      SELECT * FROM menu_categories
      WHERE restaurant_id = ${restaurant.id} AND is_active = true
      ORDER BY display_order, name
    `;

    const menuItems = await sql`
      SELECT mi.* FROM menu_items mi
      JOIN menu_categories mc ON mi.category_id = mc.id
      WHERE mc.restaurant_id = ${restaurant.id}
      ORDER BY mi.display_order, mi.name
    `;

    // Fetch delivery partners for branches
    const deliveryPartners = await sql`
      SELECT bdp.branch_id, dp.name, dp.code, dp.website_url, bdp.partner_url
      FROM branch_delivery_partners bdp
      JOIN delivery_partners dp ON bdp.delivery_partner_id = dp.id
      JOIN branches b ON bdp.branch_id = b.id
      WHERE b.restaurant_id = ${restaurant.id}
    `;

    // Assemble menu
    const menu = menuCategories.map(cat => ({
      id: cat.id,
      name: cat.name,
      displayOrder: cat.display_order,
      items: menuItems
          .filter(item => item.category_id === cat.id)
          .map(item => ({
            id: item.id,
            name: item.name,
            description: item.description,
            price: parseFloat(item.price),
            imageUrl: item.image_url,
            tags: item.tags || [],
            isAvailable: item.is_available,
            displayOrder: item.display_order,
          })),
    }));

    const primaryBranch = branches.find(b => b.is_featured) || branches[0] || null;

    const result = {
      id: restaurant.id,
      name: restaurant.name,
      slug: restaurant.slug,
      description: restaurant.description || '',
      tagline: restaurant.tagline || '',
      logoUrl: restaurant.logo_url,
      websiteUrl: restaurant.website_url,
      email: restaurant.email,
      status: restaurant.status,
      heroImage: restaurant.hero_image_url || '/images/dish_injera.webp',
      rating: parseFloat(restaurant.rating) || 4.5,
      reviewCount: restaurant.review_count || 0,
      priceRange: restaurant.price_range || '$$',
      adminUsername: restaurant.admin_username,
      adminPassword: restaurant.admin_password,
      type: { name: restaurant.type_name, code: restaurant.type_code },
      cuisines: cuisines.map(c => c.code), // Return cuisine codes for easier matching in edit form
      socialLinks: socialLinks.map(s => ({
        platform: s.platform,
        code: s.platform_code,
        url: s.url,
      })),
      menu,
      branches: branches.map(b => {
        const bHours = branchHours.filter(h => h.branch_id === b.id);
        const bPartners = deliveryPartners.filter(dp => dp.branch_id === b.id);
        return {
          id: b.id,
          name: b.name,
          slug: b.slug,
          area: b.area || '',
          address: b.address || '',
          phone: b.phone?.trim() || '',
          whatsapp: b.whatsapp_number?.trim() || '',
          whatsappUrl: b.whatsapp_url || '',
          googleMapsUrl: b.google_maps_url || '',
          email: b.email || '',
          description: b.description || '',
          latitude: b.latitude ? parseFloat(b.latitude) : null,
          longitude: b.longitude ? parseFloat(b.longitude) : null,
          emirate: b.emirate_name,
          emirateCode: b.emirate_code,
          acceptsDineIn: b.accepts_dine_in,
          acceptsDelivery: b.accepts_delivery,
          status: b.status,
          isFeatured: b.is_featured,
          hours: bHours.map(h => ({
            day: h.day_of_week,
            open: h.open_time,
            close: h.close_time,
            isClosed: h.is_closed,
          })),
          deliveryPartners: bPartners.map(dp => ({
            name: dp.name,
            code: dp.code,
            websiteUrl: dp.website_url,
            partnerUrl: dp.partner_url,
          })),
        };
      }),
      emirate: primaryBranch?.emirate_name || '',
      area: primaryBranch?.area || '',
      phone: primaryBranch?.phone?.trim() || '',
      googleMapsUrl: primaryBranch?.google_maps_url || '',
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching restaurant:', error);
    return NextResponse.json({ error: 'Failed to fetch restaurant' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const { slug } = await params;
  
  try {
    const body = await request.json();
    const { 
      name, tagline, description, priceRange, heroImageUrl,
      adminUsername, adminPassword,
      cuisines, socialLinks, branches 
    } = body;

    // 1. Update basic restaurant info
    const [restaurant] = await sql`
      UPDATE restaurants
      SET 
        name = COALESCE(${name || null}, name),
        tagline = COALESCE(${tagline || null}, tagline),
        description = COALESCE(${description || null}, description),
        price_range = COALESCE(${priceRange || null}, price_range),
        hero_image_url = COALESCE(${heroImageUrl || null}, hero_image_url),
        admin_username = COALESCE(${adminUsername || null}, admin_username),
        admin_password = COALESCE(${adminPassword || null}, admin_password),
        updated_at = now()
      WHERE slug = ${slug} AND deleted_at IS NULL
      RETURNING *
    `;

    if (!restaurant) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
    }

    // 2. Update cuisines (if provided)
    if (cuisines) {
      // Clear existing cuisines
      await sql`DELETE FROM restaurant_cuisines WHERE restaurant_id = ${restaurant.id}`;
      // Re-insert new cuisines
      for (const cuisineCode of cuisines) {
        const [cuisine] = await sql`SELECT id FROM cuisines WHERE code = ${cuisineCode} OR name = ${cuisineCode}`;
        if (cuisine) {
          await sql`
            INSERT INTO restaurant_cuisines (restaurant_id, cuisine_id)
            VALUES (${restaurant.id}, ${cuisine.id})
          `;
        }
      }
    }

    // 3. Update social links (if provided)
    if (socialLinks) {
      // Clear existing social links
      await sql`DELETE FROM restaurant_social_links WHERE restaurant_id = ${restaurant.id}`;
      // Re-insert new ones
      for (const link of socialLinks) {
        if (!link.url) continue;
        const [platform] = await sql`SELECT id FROM social_platforms WHERE code = ${link.code || link.platformCode || link.platform}`;
        if (platform) {
          await sql`
            INSERT INTO restaurant_social_links (restaurant_id, social_platform_id, url)
            VALUES (${restaurant.id}, ${platform.id}, ${link.url})
          `;
        }
      }
    }

    // 4. Update branches and their delivery partners (if provided)
    if (branches) {
      for (const b of branches) {
        // Update branch details
        await sql`
          UPDATE branches
          SET
            area = COALESCE(${b.area || null}, area),
            address = COALESCE(${b.address || null}, address),
            phone = COALESCE(${b.phone || null}, phone),
            whatsapp_number = COALESCE(${b.whatsapp || null}, whatsapp_number),
            google_maps_url = COALESCE(${b.googleMapsUrl || null}, google_maps_url),
            latitude = ${b.latitude !== undefined ? b.latitude : null},
            longitude = ${b.longitude !== undefined ? b.longitude : null},
            accepts_dine_in = ${b.acceptsDineIn !== undefined ? b.acceptsDineIn : true},
            accepts_delivery = ${b.acceptsDelivery !== undefined ? b.acceptsDelivery : true},
            updated_at = now()
          WHERE id = ${b.id} AND restaurant_id = ${restaurant.id}
        `;

        // Update branch delivery partners if provided inside the branch object
        if (b.deliveryPartners) {
          // Clear existing delivery partners for this branch
          await sql`DELETE FROM branch_delivery_partners WHERE branch_id = ${b.id}`;
          // Re-insert new ones
          for (const dp of b.deliveryPartners) {
            if (!dp.partnerUrl) continue;
            const [partner] = await sql`SELECT id FROM delivery_partners WHERE code = ${dp.code}`;
            if (partner) {
              await sql`
                INSERT INTO branch_delivery_partners (branch_id, delivery_partner_id, partner_url)
                VALUES (${b.id}, ${partner.id}, ${dp.partnerUrl})
              `;
            }
          }
        }
      }
    }

    return NextResponse.json({ success: true, restaurant });
  } catch (error) {
    console.error('Error updating restaurant:', error);
    return NextResponse.json({ error: 'Failed to update restaurant', details: error.message }, { status: 500 });
  }
}
