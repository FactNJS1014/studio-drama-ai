// lib/ai.ts
import { GoogleGenAI } from "@google/genai";

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("กรุณาระบุ GEMINI_API_KEY ในไฟล์ .env.local");
  }
  return new GoogleGenAI({ apiKey });
}

// ฟังก์ชันสร้าง URL ภาพจาก AI ฟรีผ่าน Pollinations.ai
function generateImageUrl(prompt: string) {
  if (!prompt) return "";
  const cleanPrompt = encodeURIComponent(prompt.trim());
  return `https://image.pollinations.ai/prompt/${cleanPrompt}?width=1024&height=1024&seed=${Math.floor(Math.random() * 100000)}&nologo=true`;
}

// ฟังก์ชันสำหรับเรียก Gemini API แบบรองรับ Retry เมื่อเจอ 503
async function callGeminiWithRetry(params: any, retries = 3, delay = 2000) {
  const ai = getGeminiClient();
  for (let i = 0; i < retries; i++) {
    try {
      return await ai.models.generateContent(params);
    } catch (error: any) {
      // ถ้าเจอ Error 503 (High Demand) ให้ลองส่งซ้ำใหม่
      if ((error?.status === 503 || error?.code === 503) && i < retries - 1) {
        console.warn(
          `[Gemini API] Server busy (503). Retrying in ${delay / 1000}s... (Attempt ${i + 1}/${retries})`,
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
  throw new Error(
    "Gemini API is currently unavailable. Please try again later.",
  );
}

// 1. ฟังก์ชันสร้างตัวละคร (Character)
export async function generateCharacterAI(input: {
  name: string;
  role: string;
  prompt: string;
}) {
  const systemInstruction = `คุณคือผู้ช่วยเขียนบทภาพยนตร์/บทละคร มืออาชีพ ให้ขยายความรายละเอียดของตัวละครจากชื่อ บทบาท และรายละเอียดดิบที่ผู้ใช้ระบุ แล้วส่งกลับมาเป็น JSON Object ตามโครงสร้างนี้เท่านั้น:
{
  "name": "ชื่อตัวละคร",
  "description": "คำอธิบายตัวละครโดยย่อ",
  "personality": "บุคลิกภาพ อุปนิสัย นิสัยใจคอ",
  "appearance": "ลักษณะภายนอก การแต่งกาย เครื่องแต่งกาย รูปร่างหน้าตา",
  "backstory": "ประวัติความเป็นมา ปูหลังชีวิต และปมในใจ",
  "imagePrompt": "Detailed English prompt for character art generation, highly detailed cinematic character portrait"
}`;

  const response = await callGeminiWithRetry({
    model: "gemini-3.8-flash",
    contents: `ชื่อตัวละคร: ${input.name || "ไม่ระบุ"}\nบทบาท: ${input.role || "ไม่ระบุ"}\nรายละเอียดเพิ่มเติม: ${input.prompt}`,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
    },
  });

  const parsed = JSON.parse(response.text || "{}");

  if (input.name) {
    parsed.name = input.name;
  }

  const imageUrl = parsed.imagePrompt
    ? generateImageUrl(parsed.imagePrompt)
    : "";

  return { ...parsed, imageUrl };
}

// 2. ฟังก์ชันสร้างฉาก (Scene)
export async function generateSceneAI(promptInput: string) {
  const systemInstruction = `คุณคือผู้ช่วยสร้างฉากภาพยนตร์/บทละคร ให้แปลงข้อมูลของผู้ใช้เป็น JSON Object ตามโครงสร้างนี้เท่านั้น:
{
  "title": "ชื่อฉาก",
  "description": "รายละเอียดเหตุการณ์ในฉาก",
  "setting": "สถานที่",
  "atmosphere": "บรรยากาศ/โทนอารมณ์",
  "time_period": "ช่วงเวลา (เช่น กลางคืนยุค 90s, เช้าวันสดใส)",
  "imagePrompt": "Detailed English prompt for cinematic scene concept art, highly detailed environmental design"
}`;

  const response = await callGeminiWithRetry({
    model: "gemini-3.8-flash",
    contents: promptInput,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
    },
  });

  const parsed = JSON.parse(response.text || "{}");
  const imageUrl = parsed.imagePrompt
    ? generateImageUrl(parsed.imagePrompt)
    : "";

  return { ...parsed, imageUrl };
}

// 3. ฟังก์ชันสร้างบทพูด (Dialogue)
export async function generateDialogueAI(
  character: any,
  scene: any,
  contextInput: string,
) {
  const systemInstruction = `คุณคือตัวละครชื่อ "${character.name}" 
- บุคลิกภาพ: ${character.personality}
- ลักษณะ: ${character.appearance}
- ประวัติ: ${character.backstory}

สถานการณ์ฉากปัจจุบัน:
- ชื่อฉาก: ${scene.title}
- รายละเอียดฉาก: ${scene.description}
- บรรยากาศ: ${scene.atmosphere}

คำสั่ง: จงสร้างบทพูดของตัวละครนี้ให้อินกับคาแรคเตอร์และเข้ากับสถานการณ์ และตอบกลับมาเป็น JSON Object โครงสร้างดังนี้เท่านั้น:
{
  "content": "ข้อความบทพูดของตัวละคร",
  "emotion": "อารมณ์ขณะพูด (เช่น โกรธ, ซาบซึ้ง, กระซิบ, สับสน)"
}`;

  const response = await callGeminiWithRetry({
    model: "gemini-3.8-flash",
    contents: contextInput,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
    },
  });

  return JSON.parse(response.text || "{}");
}
