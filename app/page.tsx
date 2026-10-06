import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-blue-900 via-blue-800 to-slate-900 text-white flex flex-col justify-center items-center px-4 text-center">
      <div className="max-w-3xl space-y-6">
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white">
          AI Short Drama &{" "}
          <span className="text-sky-400">Movie Script Generator</span>
        </h1>
        <p className="text-lg text-slate-300">
          ระบบช่วยสร้างบทละคร บทภาพยนตร์ และหนังสั้นอัตโนมัติด้วย AI พร้อมเจนภาพ
          concept art ตัวละครและฉากแบบ Full-Stack
        </p>

        <div className="pt-6 flex flex-wrap justify-center gap-4">
          <Link
            href="/characters"
            className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold px-6 py-3.5 rounded-xl shadow-lg transition"
          >
            👤 สร้างตัวละคร
          </Link>
          <Link
            href="/scenes"
            className="bg-blue-700 hover:bg-blue-600 border border-blue-500 text-white font-bold px-6 py-3.5 rounded-xl shadow-lg transition"
          >
            🎬 ออกแบบฉาก
          </Link>
          <Link
            href="/dialogues"
            className="bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-3.5 rounded-xl backdrop-blur-sm transition"
          >
            💬 เขียนบทพูด
          </Link>
        </div>
      </div>
    </div>
  );
}
