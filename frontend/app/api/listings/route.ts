import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET all listings with filters
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const bedrooms = searchParams.get("bedrooms");
    const city = searchParams.get("city");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const skip = (page - 1) * limit;

    const where: any = {
      status: "AVAILABLE",
    };

    if (type) where.type = type;
    if (bedrooms) where.bedrooms = parseInt(bedrooms);
    if (city) where.property = { city: { contains: city, mode: "insensitive" } };
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          property: true,
          photos: { where: { isPrimary: true }, take: 1 },
          amenities: true,
        },
      }),
      prisma.listing.count({ where }),
    ]);

    return NextResponse.json({
      listings,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}

// POST create new listing (landlord only)
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "LANDLORD" && session.user.role !== "AGENT" && session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Only landlords can create listings" }, { status: 403 });
    }

    const body = await req.json();
    const {
      title, description, address, city, state,
      zipCode, lat, lng, propertyType, listingType,
      price, bedrooms, bathrooms, areaSqFt,
      availableFrom, amenities,
    } = body;

    // Create property first
    const property = await prisma.property.create({
      data: {
        ownerId: session.user.id,
        title,
        description,
        address,
        city,
        state,
        zipCode,
        lat: lat ? parseFloat(lat) : null,
        lng: lng ? parseFloat(lng) : null,
        type: propertyType,
      },
    });

    // Create listing
    const listing = await prisma.listing.create({
      data: {
        propertyId: property.id,
        type: listingType,
        price: parseFloat(price),
        bedrooms: parseInt(bedrooms),
        bathrooms: parseInt(bathrooms),
        areaSqFt: areaSqFt ? parseFloat(areaSqFt) : null,
        availableFrom: availableFrom ? new Date(availableFrom) : null,
        amenities: {
          create: amenities?.map((name: string) => ({ name })) || [],
        },
      },
      include: {
        property: true,
        amenities: true,
      },
    });

    return NextResponse.json(listing, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}