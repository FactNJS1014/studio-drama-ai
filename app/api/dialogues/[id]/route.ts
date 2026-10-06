import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params; // 👈 เติม await ตรงนี้เช่นกัน
    await query("DELETE FROM dialogues WHERE id = $1", [id]);
    return NextResponse.json({ message: "Dialogue deleted successfully" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
