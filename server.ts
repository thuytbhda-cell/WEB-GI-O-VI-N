import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// API: Kiểm tra trạng thái hệ thống và cấu hình Gemini API
app.get('/api/status', (req, res) => {
  const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY');
  res.json({
    status: 'online',
    system: 'VĂN HỌC CÙNG CÔ THỦY - TRƯỜNG THPT HOÀI ĐỨC A',
    teacher: 'Thủy Nguyễn',
    academicYear: '2026-2027',
    hasGeminiKey,
    environment: process.env.NODE_ENV || 'development',
  });
});

// API: Trợ lý AI học Văn Cô Thủy (kết nối trực tiếp Gemini qua máy chủ)
app.post('/api/ai/chat', async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return res.status(503).json({
      error: 'MISSING_API_KEY',
      message: 'Khóa API Gemini chưa được cấu hình trên máy chủ. Vui lòng cấu hình GEMINI_API_KEY trong AI Studio Secrets để sử dụng Trợ lý AI thực tế.',
      guidance: 'Để kích hoạt: Mở bảng Secrets / Environment variables trong Google AI Studio và điền GEMINI_API_KEY.',
    });
  }

  const { prompt, history, grade, topic } = req.body;

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Nội dung câu hỏi không hợp lệ.' });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    const systemInstruction = `Bạn là TRỢ LÝ VĂN HỌC CÙNG CÔ THỦY - Hệ thống dạy học môn Ngữ văn THPT Hoài Đức A (Hà Nội).
Giáo viên hướng dẫn: Cô Thủy Nguyễn.
Khẩu hiệu: "Hành trình gieo yêu thương qua những con chữ".
Năm học: 2026-2027.
Khối lớp học sinh đang học: ${grade || 'THPT (Lớp 10, 11, 12)'}.
Chủ đề liên quan: ${topic || 'Ngữ văn THPT - Bộ sách Kết nối tri thức với cuộc sống'}.

YÊU CẦU SƯ PHẠM QUAN TRỌNG:
1. Luôn dùng tiếng Việt chuẩn Unicode, giọng điệu ấm áp, trang trọng, gần gũi, khích lệ tinh thần văn chương.
2. Phương pháp sư phạm: Ưu tiên gợi mở từng bước bằng các câu hỏi định hướng để học sinh tự suy nghĩ và liên tưởng; KHÔNG viết sẵn nguyên vẹn một bài văn hoàn chỉnh cho học sinh chép để đi thi.
3. Khi hướng dẫn dàn ý: Nêu rõ cấu trúc Mở bài - Thân bài (các luận điểm, luận cứ, dẫn chứng) - Kết bài.
4. Tuyệt đối KHÔNG bịa đặt dẫn chứng, tác giả, tác phẩm, năm sáng tác hay trích dẫn thơ/văn. Nếu không chắc chắn, hãy thừa nhận rõ ràng.
5. Khi giải thích biện pháp tu từ: Nêu rõ dấu hiệu nhận biết, tác dụng nghệ thuật và hiệu quả biểu cảm trong văn cảnh cụ thể.
6. Kết thúc câu trả lời bằng một lời động viên truyền cảm hứng hoặc một câu hỏi gợi mở suy ngẫm sâu hơn cho học sinh.`;

    // Gọi Gemini 3.8 Flash
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const reply = response.text || 'Cô chưa nhận được phản hồi, em hãy thử hỏi lại nhé!';
    return res.json({ reply, success: true });
  } catch (error: any) {
    console.error('Lỗi khi gọi Gemini API:', error);
    return res.status(500).json({
      error: 'GEMINI_CALL_FAILED',
      message: 'Không thể kết nối đến máy chủ Gemini AI: ' + (error?.message || 'Lỗi không xác định'),
    });
  }
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: PORT,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 [VĂN HỌC CÙNG CÔ THỦY] Server is running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
