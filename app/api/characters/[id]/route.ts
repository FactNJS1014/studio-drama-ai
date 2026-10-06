import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }, // 👈 ปรับประเภทเป็น Promise
) {
  try {
    const { id } = await params; // 👈 เติม await ตรงนี้
    await query("DELETE FROM characters WHERE id = $1", [id]);
    return NextResponse.json({ message: "Character deleted successfully" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
