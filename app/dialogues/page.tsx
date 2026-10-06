"use client";

import { useState, useEffect } from "react";

interface Character {
  id: string;
  name: string;
}

interface Scene {
  id: string;
  title: string;
}

interface Dialogue {
  id: string;
  character_id: string;
  scene_id: string;
  character_name: string;
  character_image: string;
  scene_title: string;
  content: string;
  emotion: string;
  created_at: string;
}

export default function DialoguesPage() {
  const [dialogues, setDialogues] = useState<Dialogue[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [scenes, setScenes] = useState<Scene[]>([]);

  const [selectedCharacter, setSelectedCharacter] = useState("");
  const [selectedScene, setSelectedScene] = useState("");
  const [context, setContext] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDialogues();
    fetchOptions();
  }, []);

  const fetchDialogues = async () => {
    const res = await fetch("/api/dialogues");
    const data = await res.json();
    setDialogues(data);
  };

  const fetchOptions = async () => {
    const [charRes, sceneRes] = await Promise.all([
      fetch("/api/characters"),
      fetch("/api/scenes"),
    ]);
    const charData = await charRes.json();
    const sceneData = await sceneRes.json();
    setCharacters(charData);
    setScenes(sceneData);

    if (charData.length > 0) setSelectedCharacter(charData[0].id);
    if (sceneData.length > 0) setSelectedScene(sceneData[0].id);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!context.trim() || !selectedCharacter || !selectedScene) return;
    setLoading(true);

    try {
      const res = await fetch("/api/dialogues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          character_id: selectedCharacter,
          scene_id: selectedScene,
          context,
        }),
      });

      if (res.ok) {
        setContext("");
        fetchDialogues();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("คุณต้องการลบบทพูดนี้ใช่หรือไม่?")) return;
    await fetch(`/api/dialogues/${id}`, { method: "DELETE" });
    fetchDialogues();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Box สร้างบทพูด */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-sky-100">
        <h2 className="text-2xl font-bold text-blue-900 mb-4">
          💬 สร้างบทพูดด้วย AI
        </h2>

        {characters.length === 0 || scenes.length === 0 ? (
          <p className="text-amber-600 bg-amber-50 p-4 rounded-xl border border-amber-200">
            ⚠️ กรุณาสร้าง <strong>ตัวละคร</strong> และ <strong>ฉาก</strong>{" "}
            อย่างน้อย 1 รายการก่อนเริ่มสร้างบทพูด
          </p>
        ) : (
          <form onSubmit={handleGenerate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  เลือกตัวละคร
                </label>
                <select
                  value={selectedCharacter}
                  onChange={(e) => setSelectedCharacter(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none"
                >
                  {characters.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  เลือกฉาก
                </label>
                <select
                  value={selectedScene}
                  onChange={(e) => setSelectedScene(e.target.value)}
                  className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none"
                >
                  {scenes.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                บริบท/สิ่งที่ต้องการให้พูด
              </label>
              <textarea
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="ป้อนบริบท เช่น: สารภาพความจริงเรื่องคดีความด้วยความสับสนและหวาดกลัว..."
                className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none min-h-[90px]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition disabled:opacity-50"
            >
              {loading ? "⏳ AI กำลังแต่งบทพูดตามบุคลิก..." : "🚀 เจนบทพูด"}
            </button>
          </form>
        )}
      </div>

      {/* Script Stream Timeline */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-blue-900">
          📜 บทละครทั้งหมด (Script Stream)
        </h3>

        {dialogues.length === 0 ? (
          <p className="text-slate-400 text-center py-8">
            ยังไม่มีบทพูด ถูกสร้างขึ้น
          </p>
        ) : (
          <div className="space-y-4">
            {dialogues.map((d) => (
              <div
                key={d.id}
                className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex gap-4 items-start"
              >
                {d.character_image ? (
                  <img
                    src={d.character_image}
                    alt={d.character_name}
                    className="w-14 h-14 rounded-full object-cover shrink-0 border-2 border-sky-200"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold shrink-0">
                    {d.character_name?.[0] || "?"}
                  </div>
                )}

                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-blue-950">
                        {d.character_name}
                      </span>
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                        🎬 {d.scene_title}
                      </span>
                      {d.emotion && (
                        <span className="text-xs bg-sky-50 text-sky-700 px-2 py-0.5 rounded-md font-medium">
                          🎭 {d.emotion}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleDelete(d.id)}
                      className="text-xs text-red-500 hover:text-red-700 transition"
                    >
                      ลบ
                    </button>
                  </div>

                  <p className="text-slate-800 bg-slate-50 p-3 rounded-xl mt-2 italic border border-slate-100">
                    "{d.content}"
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
