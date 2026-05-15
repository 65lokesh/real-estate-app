import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET all tickets
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
        ? { property: { ownerId: session.user.id } }
        : { tenantId: session.user.id };

    if (status) where.status = status;

    const tickets = await prisma.maintenanceTicket.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        property: true,
        tenant: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json(tickets);
  } catch (error) {
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}

// POST create ticket
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { propertyId, title, description, category, priority, images } = body;

    if (!propertyId || !title || !description || !category) {
      return NextResponse.json(
        { message: "propertyId, title, description and category are required" },
        { status: 400 }
      );
    }

    const ticket = await prisma.maintenanceTicket.create({
      data: {
        propertyId,
        tenantId: session.user.id,
        title,
        description,
        category,
        priority: priority || "MEDIUM",
        images: images || [],
      },
    });

    return NextResponse.json(ticket, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}