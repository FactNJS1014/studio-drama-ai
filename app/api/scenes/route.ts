import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { generateSceneAI } from "@/lib/ai";

export async function GET() {
  try {
    const res = await query("SELECT * FROM scenes ORDER BY created_at DESC");
    return NextResponse.json(res.rows);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    if (!prompt)
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 },
      );

    const aiResult = await generateSceneAI(prompt);

    const insertSql = `
      INSERT INTO scenes (title, description, setting, atmosphere, time_period, image_url)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const values = [
      aiResult.title,
      aiResult.description,
      aiResult.setting,
      aiResult.atmosphere,
      aiResult.time_period,
      aiResult.imageUrl,
    ];

    const res = await query(insertSql, values);
    return NextResponse.json(res.rows[0], { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
