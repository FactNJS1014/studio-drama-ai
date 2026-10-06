// components/Navbar.tsx
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-blue-900 text-white shadow-md border-b border-blue-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="text-xl font-bold tracking-wider text-sky-300 hover:text-white transition"
        >
          🎬 AI Script Generator
        </Link>
        <div className="flex space-x-6 font-medium">
          <Link href="/characters" className="hover:text-sky-300 transition">
            👤 ตัวละคร
          </Link>
          <Link href="/scenes" className="hover:text-sky-300 transition">
            🌌 ฉาก
          </Link>
          <Link href="/dialogues" className="hover:text-sky-300 transition">
            💬 บทพูด
          </Link>
        </div>
      </div>
    </nav>
  );
}
