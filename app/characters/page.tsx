"use client";

import { useState, useEffect } from "react";

interface Character {
  id: string;
  name: string;
  description: string;
  personality: string;
  appearance: string;
  backstory: string;
  image_url: string;
}

export default function CharactersPage() {
  const [characters, setCharacters] = useState<Character[]>([]);

  // State สำหรับฟอร์ม
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchCharacters = async () => {
    const res = await fetch("/api/characters");
    const data = await res.json();
    setCharacters(data);
  };

  useEffect(() => {
    fetchCharacters();
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !prompt.trim()) return;
    setLoading(true);

    try {
      const res = await fetch("/api/characters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, role, prompt }),
      });

      if (res.ok) {
        setName("");
        setRole("");
        setPrompt("");
        fetchCharacters();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("คุณต้องการลบตัวละครนี้ใช่หรือไม่?")) return;
    await fetch(`/api/characters/${id}`, { method: "DELETE" });
    fetchCharacters();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Box ฟอร์มสร้างตัวละคร */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-sky-100">
        <h2 className="text-2xl font-bold text-blue-900 mb-4">
          ✨ สร้างตัวละครด้วย AI
        </h2>

        <form onSubmit={handleGenerate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Input ชื่อตัวละคร */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                ชื่อตัวละคร <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="เช่น: อนาคิน สกายวอล์กเกอร์"
                className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>

            {/* Input บทบาท */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                บทบาท (Role)
              </label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="เช่น: พระเอก, ตัวร้าย, นักสืบเอกชน, เพื่อนสนิท"
                className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Input รายละเอียดเพิ่มเติม */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              คำอธิบายรายละเอียดเพิ่มเติม{" "}
              <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="อธิบายบุคลิก ลักษณะภายนอก หรือประวัติเพิ่มเติม เช่น: อายุ 28 ปี เป็นคนเงียบขรึม สวมเสื้อโค้ทสีเทา มีรอยแผลเป็นที่แก้มขวา เคยเป็นอดีตตำรวจ..."
              className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none min-h-[100px]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition disabled:opacity-50"
          >
            {loading
              ? "⏳ กำลังสร้างรายละเอียดตัวละครและรูปภาพ..."
              : "🚀 เจนตัวละคร & บันทึกลงฐานข้อมูล"}
          </button>
        </form>
      </div>

      {/* Grid แสดงรายการตัวละครที่บันทึกแล้ว */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {characters.map((char) => (
          <div
            key={char.id}
            className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col"
          >
            {char.image_url ? (
              <img
                src={char.image_url}
                alt={char.name}
                className="w-full h-64 object-cover"
              />
            ) : (
              <div className="w-full h-64 bg-slate-100 flex items-center justify-center text-slate-400">
                ไม่มีรูปภาพ
              </div>
            )}
            <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold text-blue-950">{char.name}</h3>
                <p className="text-sm text-slate-600 mt-1">
                  {char.description}
                </p>

                <div className="mt-3 space-y-1 text-xs text-slate-500">
                  <p>
                    <strong className="text-slate-700">บุคลิก:</strong>{" "}
                    {char.personality}
                  </p>
                  <p>
                    <strong className="text-slate-700">ลักษณะ:</strong>{" "}
                    {char.appearance}
                  </p>
                  <p>
                    <strong className="text-slate-700">ปูหลัง:</strong>{" "}
                    {char.backstory}
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleDelete(char.id)}
                className="mt-4 w-full bg-red-50 text-red-600 hover:bg-red-100 py-2 rounded-lg font-medium text-sm transition"
              >
                ลบตัวละคร
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
