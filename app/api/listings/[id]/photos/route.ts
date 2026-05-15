import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { url, publicId, isPrimary } = body;

    if (!url || !publicId) {
      return NextResponse.json({ message: "URL and publicId required" }, { status: 400 });
    }

    const existingCount = await prisma.photo.count({
      where: { listingId: id },
    });

    const photo = await prisma.photo.create({
      data: {
        listingId: id,
        url,
        publicId,
        isPrimary: existingCount === 0 ? true : isPrimary || false,
        order: existingCount,
      },
    });

    console.log("✅ Photo saved:", photo.id);
    return NextResponse.json(photo, { status: 201 });
  } catch (error) {
    console.error("❌ Photo save error:", error);
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { photoId } = await req.json();
    await prisma.photo.delete({ where: { id: photoId } });
    return NextResponse.json({ message: "Photo deleted" });
  } catch (error) {
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}