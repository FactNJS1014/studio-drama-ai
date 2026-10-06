"use client";

import { useState, useEffect } from "react";

interface Scene {
  id: string;
  title: string;
  description: string;
  setting: string;
  atmosphere: string;
  time_period: string;
  image_url: string;
}

export default function ScenesPage() {
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchScenes = async () => {
    const res = await fetch("/api/scenes");
    const data = await res.json();
    setScenes(data);
  };

  useEffect(() => {
    fetchScenes();
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    setLoading(true);

    try {
      const res = await fetch("/api/scenes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      if (res.ok) {
        setPrompt("");
        fetchScenes();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("คุณต้องการลบฉากนี้ใช่หรือไม่?")) return;
    await fetch(`/api/scenes/${id}`, { method: "DELETE" });
    fetchScenes();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Box สร้างฉาก */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-sky-100">
        <h2 className="text-2xl font-bold text-blue-900 mb-4">
          🎬 สร้างฉากด้วย AI
        </h2>
        <form onSubmit={handleGenerate} className="space-y-4">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="อธิบายฉาก เช่น: ร้านกาแฟริมถนนในกรุงโตเกียว ฝนตกพรำๆ บรรยากาศเงียบสงบ มีแสงไฟนีออนสะท้อนพื้นถนน ตอนกลางคืน..."
            className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none min-h-[100px]"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition disabled:opacity-50"
          >
            {loading ? "⏳ กำลังสร้างฉากและภาพบรรยากาศ..." : "🚀 สร้างฉาก"}
          </button>
        </form>
      </div>

      {/* Grid รายการฉาก */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {scenes.map((scene) => (
          <div
            key={scene.id}
            className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col"
          >
            {scene.image_url ? (
              <img
                src={scene.image_url}
                alt={scene.title}
                className="w-full h-72 object-cover"
              />
            ) : (
              <div className="w-full h-72 bg-slate-100 flex items-center justify-center text-slate-400">
                ไม่มีรูปภาพฉาก
              </div>
            )}
            <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start">
                  <h3 className="text-xl font-bold text-blue-950">
                    {scene.title}
                  </h3>
                  <span className="text-xs bg-sky-100 text-sky-800 px-2.5 py-1 rounded-full font-medium">
                    {scene.time_period}
                  </span>
                </div>
                <p className="text-sm text-slate-600 mt-2">
                  {scene.description}
                </p>

                <div className="mt-4 flex flex-wrap gap-2 text-xs">
                  <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-lg">
                    📍 {scene.setting}
                  </span>
                  <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-lg">
                    ✨ {scene.atmosphere}
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleDelete(scene.id)}
                className="mt-4 w-full bg-red-50 text-red-600 hover:bg-red-100 py-2 rounded-lg font-medium text-sm transition"
              >
                ลบฉาก
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
