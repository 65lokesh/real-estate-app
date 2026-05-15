import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET single application
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        listing: { include: { property: true } },
        applicant: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
    });

    if (!application) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    return NextResponse.json(application);
  } catch (error) {
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}

// PATCH approve / reject / withdraw
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { status } = await req.json();

    const validStatuses = ["APPROVED", "REJECTED", "WITHDRAWN"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ message: "Invalid status" }, { status: 400 });
    }

    const application = await prisma.application.findUnique({
      where: { id },
      include: { listing: { include: { property: true } } },
    });

    if (!application) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    // Only landlord can approve/reject, only applicant can withdraw
    if (
      status === "WITHDRAWN" &&
      application.applicantId !== session.user.id
    ) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    if (
      ["APPROVED", "REJECTED"].includes(status) &&
      application.listing.property.ownerId !== session.user.id
    ) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const updated = await prisma.application.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}