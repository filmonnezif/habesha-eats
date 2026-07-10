/**
 * GET /api/restaurants
 * Fetch all restaurants with their branches, cuisines, and social links.
 * Used by the Discover page and TasteOfHome section.
 */
import sql from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Fetch restaurants with their type
    const restaurants = await sql`
      SELECT 
        r.id, r.name, r.slug, r.description, r.logo_url, r.website_url, 
        r.email, r.status, r.hero_image_url, r.rating, r.review_count,
        r.price_range, r.tagline,
        rt.name as type_name, rt.code as type_code
      FROM restaurants r
      JOIN restaurant_types rt ON r.restaurant_type_id = rt.id
      WHERE r.deleted_at IS NULL
      ORDER BY r.name
    `;

    // Fetch all branches
    const branches = await sql`
      SELECT 
        b.id, b.restaurant_id, b.name, b.slug, b.area, b.address,
        b.phone, b.whatsapp_number, b.whatsapp_url, b.google_maps_url,
        b.latitude, b.longitude, b.email, b.description,
        b.accepts_dine_in, b.accepts_delivery, b.status, b.is_featured,
        e.name as emirate_name, e.code as emirate_code
      FROM branches b
      JOIN emirates e ON b.emirate_id = e.id
      WHERE b.deleted_at IS NULL
      ORDER BY b.name
    `;

    // Fetch all restaurant-cuisine mappings
    const cuisineMappings = await sql`
      SELECT rc.restaurant_id, c.name as cuisine_name, c.code as cuisine_code
      FROM restaurant_cuisines rc
      JOIN cuisines c ON rc.cuisine_id = c.id
    `;

    // Fetch all social links
    const socialLinks = await sql`
      SELECT rsl.restaurant_id, sp.name as platform_name, sp.code as platform_code, rsl.url
      FROM restaurant_social_links rsl
      JOIN social_platforms sp ON rsl.social_platform_id = sp.id
    `;

    // Assemble the full restaurant objects
    const result = restaurants.map(r => {
      const rBranches = branches.filter(b => b.restaurant_id === r.id);
      const rCuisines = cuisineMappings.filter(c => c.restaurant_id === r.id);
      const rSocial = socialLinks.filter(s => s.restaurant_id === r.id);
      
      // Use the first branch for primary location info
      const primaryBranch = rBranches.find(b => b.is_featured) || rBranches[0] || null;

      return {
        id: r.id,
        name: r.name,
        slug: r.slug,
        description: r.description || r.tagline || '',
        tagline: r.tagline || '',
        logoUrl: r.logo_url,
        websiteUrl: r.website_url,
        email: r.email,
        status: r.status,
        heroImage: r.hero_image_url || '/images/dish_injera.webp',
        rating: parseFloat(r.rating) || 4.5,
        reviewCount: r.review_count || 0,
        priceRange: r.price_range || '$$',
        type: { name: r.type_name, code: r.type_code },
        cuisines: rCuisines.map(c => c.cuisine_name),
        cuisineCodes: rCuisines.map(c => c.cuisine_code),
        socialLinks: rSocial.map(s => ({
          platform: s.platform_name,
          code: s.platform_code,
          url: s.url,
        })),
        branches: rBranches.map(b => ({
          id: b.id,
          name: b.name,
          slug: b.slug,
          area: b.area || '',
          address: b.address || '',
          phone: b.phone?.trim() || '',
          whatsapp: b.whatsapp_number?.trim() || '',
          whatsappUrl: b.whatsapp_url || '',
          googleMapsUrl: b.google_maps_url || '',
          latitude: b.latitude ? parseFloat(b.latitude) : null,
          longitude: b.longitude ? parseFloat(b.longitude) : null,
          emirate: b.emirate_name,
          emirateCode: b.emirate_code,
          acceptsDineIn: b.accepts_dine_in,
          acceptsDelivery: b.accepts_delivery,
          status: b.status,
          isFeatured: b.is_featured,
        })),
        // Convenience fields from primary branch
        emirate: primaryBranch?.emirate_name || '',
        area: primaryBranch?.area || '',
        phone: primaryBranch?.phone?.trim() || '',
        googleMapsUrl: primaryBranch?.google_maps_url || '',
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    return NextResponse.json({ error: 'Failed to fetch restaurants' }, { status: 500 });
  }
}
