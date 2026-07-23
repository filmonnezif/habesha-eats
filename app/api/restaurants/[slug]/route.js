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
    // Single query fetches EVERYTHING using CTEs + json_agg.
    // This eliminates 7 extra HTTP roundtrips to Neon (~300-430ms each).
    const [row] = await sql`
      WITH r AS (
        SELECT r.*, rt.name AS type_name, rt.code AS type_code
        FROM restaurants r
        JOIN restaurant_types rt ON r.restaurant_type_id = rt.id
        WHERE r.slug = ${slug} AND r.deleted_at IS NULL
        LIMIT 1
      ),
      b AS (
        SELECT json_agg(
          json_build_object(
            'id', b.id, 'name', b.name, 'slug', b.slug,
            'area', b.area, 'address', b.address,
            'phone', b.phone, 'whatsapp_number', b.whatsapp_number,
            'whatsapp_url', b.whatsapp_url, 'google_maps_url', b.google_maps_url,
            'email', b.email, 'description', b.description,
            'latitude', b.latitude, 'longitude', b.longitude,
            'emirate_name', e.name, 'emirate_code', e.code,
            'accepts_dine_in', b.accepts_dine_in, 'accepts_delivery', b.accepts_delivery,
            'status', b.status, 'is_featured', b.is_featured
          ) ORDER BY b.is_featured DESC, b.name
        ) AS data
        FROM branches b
        JOIN emirates e ON b.emirate_id = e.id
        WHERE b.restaurant_id = (SELECT id FROM r) AND b.deleted_at IS NULL
      ),
      bh AS (
        SELECT json_agg(
          json_build_object(
            'branch_id', bh.branch_id, 'day_of_week', bh.day_of_week,
            'open_time', bh.open_time, 'close_time', bh.close_time, 'is_closed', bh.is_closed
          ) ORDER BY bh.day_of_week
        ) AS data
        FROM branch_hours bh
        JOIN branches br ON bh.branch_id = br.id
        WHERE br.restaurant_id = (SELECT id FROM r)
      ),
      c AS (
        SELECT json_agg(json_build_object('name', cu.name, 'code', cu.code)) AS data
        FROM restaurant_cuisines rc
        JOIN cuisines cu ON rc.cuisine_id = cu.id
        WHERE rc.restaurant_id = (SELECT id FROM r)
      ),
      sl AS (
        SELECT json_agg(
          json_build_object('platform', sp.name, 'platform_code', sp.code, 'url', rsl.url)
        ) AS data
        FROM restaurant_social_links rsl
        JOIN social_platforms sp ON rsl.social_platform_id = sp.id
        WHERE rsl.restaurant_id = (SELECT id FROM r)
      ),
      mc AS (
        SELECT json_agg(
          json_build_object('id', cat.id, 'name', cat.name, 'display_order', cat.display_order)
          ORDER BY cat.display_order, cat.name
        ) AS data
        FROM menu_categories cat
        WHERE cat.restaurant_id = (SELECT id FROM r) AND cat.is_active = true
      ),
      mi AS (
        SELECT json_agg(
          json_build_object(
            'id', item.id, 'category_id', item.category_id, 'name', item.name,
            'description', item.description, 'price', item.price,
            'image_url', item.image_url, 'tags', item.tags,
            'is_available', item.is_available, 'display_order', item.display_order
          ) ORDER BY item.display_order, item.name
        ) AS data
        FROM menu_items item
        JOIN menu_categories mcat ON item.category_id = mcat.id
        WHERE mcat.restaurant_id = (SELECT id FROM r)
      ),
      dp AS (
        SELECT json_agg(
          json_build_object(
            'branch_id', bdp.branch_id, 'name', dpart.name,
            'code', dpart.code, 'website_url', dpart.website_url, 'partner_url', bdp.partner_url
          )
        ) AS data
        FROM branch_delivery_partners bdp
        JOIN delivery_partners dpart ON bdp.delivery_partner_id = dpart.id
        JOIN branches br ON bdp.branch_id = br.id
        WHERE br.restaurant_id = (SELECT id FROM r)
      )
      SELECT
        r.*,
        COALESCE(b.data, '[]'::json) AS branches_json,
        COALESCE(bh.data, '[]'::json) AS branch_hours_json,
        COALESCE(c.data, '[]'::json) AS cuisines_json,
        COALESCE(sl.data, '[]'::json) AS social_links_json,
        COALESCE(mc.data, '[]'::json) AS menu_categories_json,
        COALESCE(mi.data, '[]'::json) AS menu_items_json,
        COALESCE(dp.data, '[]'::json) AS delivery_partners_json
      FROM r, b, bh, c, sl, mc, mi, dp
    `;

    if (!row) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
    }

    // Parse JSON arrays — Neon returns already-parsed objects, with fallbacks for safety
    const parseJson = (val) => {
      if (Array.isArray(val)) return val;
      if (typeof val === 'string') try { return JSON.parse(val); } catch { return []; }
      return [];
    };
    const branches = parseJson(row.branches_json);
    const branchHours = parseJson(row.branch_hours_json);
    const cuisines = parseJson(row.cuisines_json);
    const socialLinks = parseJson(row.social_links_json);
    const menuCategories = parseJson(row.menu_categories_json);
    const menuItems = parseJson(row.menu_items_json);
    const deliveryPartners = parseJson(row.delivery_partners_json);

    // Assemble menu
    const menu = menuCategories.map(cat => ({
      id: cat.id,
      name: cat.name,
      displayOrder: cat.display_order,
      items: menuItems
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

    const primaryBranch = branches.find(b => b.is_featured) || branches[0] || null;

    const result = {
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description || '',
      tagline: row.tagline || '',
      logoUrl: row.logo_url,
      websiteUrl: row.website_url,
      email: row.email,
      status: row.status,
      heroImage: row.hero_image_url || '/images/dish_injera.webp',
      rating: parseFloat(row.rating) || 4.5,
      reviewCount: row.review_count || 0,
      priceRange: row.price_range || '$$',
      adminUsername: row.admin_username,
      adminPassword: row.admin_password,
      type: { name: row.type_name, code: row.type_code },
      cuisines: cuisines.map(c => c.code),
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

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
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
