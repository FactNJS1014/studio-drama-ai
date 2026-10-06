import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { generateCharacterAI } from "@/lib/ai";

export async function GET() {
  try {
    const res = await query(
      "SELECT * FROM characters ORDER BY created_at DESC",
    );
    return NextResponse.json(res.rows);
  } catch (err: any) {
    console.error("Database GET Error:", err);
    return NextResponse.json(
      { error: "Failed to fetch characters", details: err.message },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const { name, role, prompt } = await req.json();

    if (!name || !prompt) {
      return NextResponse.json(
        { error: "กรุณากรอกชื่อตัวละครและรายละเอียด" },
        { status: 400 },
      );
    }

    // เจนข้อมูลรายละเอียดตัวละคร + รูปภาพผ่าน AI
    const aiResult = await generateCharacterAI({ name, role, prompt });

    // บันทึกลงฐานข้อมูล Neon PostgreSQL
    const insertSql = `
      INSERT INTO characters (name, description, personality, appearance, backstory, image_url)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const values = [
      aiResult.name || name,
      aiResult.description || "",
      aiResult.personality || "",
      aiResult.appearance || "",
      aiResult.backstory || "",
      aiResult.imageUrl || "",
    ];

    const res = await query(insertSql, values);
    return NextResponse.json(res.rows[0], { status: 201 });
  } catch (err: any) {
    console.error("Character Creation Error:", err);
    return NextResponse.json(
      { error: "Failed to create character", details: err.message },
      { status: 500 },
    );
  }
}
