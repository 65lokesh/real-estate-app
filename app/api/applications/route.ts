import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET all applications
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const where: any =
      session.user.role === "LANDLORD"
        ? {
            listing: {
              property: { ownerId: session.user.id },
            },
          }
        : { applicantId: session.user.id };

    if (status) where.status = status;

    const applications = await prisma.application.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        listing: {
          include: {
            property: true,
            photos: { where: { isPrimary: true }, take: 1 },
          },
        },
        applicant: {
          select: { id: true, name: true, email: true, phone: true, avatar: true },
        },
      },
    });

    return NextResponse.json(applications);
  } catch (error) {
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}

// POST submit application
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { listingId, monthlyIncome, employerName, message, creditConsent } = body;

    if (!listingId) {
      return NextResponse.json({ message: "Listing ID required" }, { status: 400 });
    }

    // Check listing exists
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
    });

    if (!listing) {
      return NextResponse.json({ message: "Listing not found" }, { status: 404 });
    }

    // Check already applied
    const existing = await prisma.application.findFirst({
      where: { listingId, applicantId: session.user.id },
    });

    if (existing) {
      return NextResponse.json(
        { message: "You have already applied for this listing" },
        { status: 400 }
      );
    }

    const application = await prisma.application.create({
      data: {
        listingId,
        applicantId: session.user.id,
        monthlyIncome: monthlyIncome ? parseFloat(monthlyIncome) : null,
        employerName,
        message,
        creditConsent: creditConsent || false,
      },
    });

    return NextResponse.json(application, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}