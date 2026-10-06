import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { generateDialogueAI } from "@/lib/ai";

export async function GET() {
  try {
    const sql = `
      SELECT d.*, 
             c.name AS character_name, c.image_url AS character_image,
             s.title AS scene_title
      FROM dialogues d
      LEFT JOIN characters c ON d.character_id = c.id
      LEFT JOIN scenes s ON d.scene_id = s.id
      ORDER BY d.created_at ASC
    `;
    const res = await query(sql);
    return NextResponse.json(res.rows);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { character_id, scene_id, context } = await req.json();

    // ดึงข้อมูลตัวละครและฉากจาก DB
    const charRes = await query("SELECT * FROM characters WHERE id = $1", [
      character_id,
    ]);
    const sceneRes = await query("SELECT * FROM scenes WHERE id = $1", [
      scene_id,
    ]);

    if (charRes.rows.length === 0 || sceneRes.rows.length === 0) {
      return NextResponse.json(
        { error: "Character or Scene not found" },
        { status: 404 },
      );
    }

    const aiResult = await generateDialogueAI(
      charRes.rows[0],
      sceneRes.rows[0],
      context,
    );

    const insertSql = `
      INSERT INTO dialogues (character_id, scene_id, content, emotion)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const res = await query(insertSql, [
      character_id,
      scene_id,
      aiResult.content,
      aiResult.emotion,
    ]);

    return NextResponse.json(res.rows[0], { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
