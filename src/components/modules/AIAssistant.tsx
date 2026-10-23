import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Bot,
  Send,
  Sparkles,
  BookOpen,
  HelpCircle,
  Lightbulb,
  FileQuestion,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Key,
  ShieldCheck,
  Feather,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
  topic?: string;
}

export const AIAssistant: React.FC = () => {
  const { currentUser, showToast } = useApp();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      content: `Chào em ${currentUser.name}! Cô Thủy rất vui được đồng hành cùng em trong thế giới diệu kỳ của văn chương.

Trợ lý học Văn có thể hỗ trợ em:
• Hướng dẫn tìm ý & lập dàn ý bài văn nghị luận xã hội, nghị luận văn học.
• Hướng dẫn phương pháp giải các dạng câu hỏi đọc hiểu văn bản.
• Phân tích tác dụng của các biện pháp tu từ trong tác phẩm THPT.
• Góp ý, nhận xét cho bản nháp bài viết của em.

Cô luôn ưu tiên gợi mở từng bước để em tự suy nghĩ và cảm thụ. Hôm nay em đang gặp khó khăn ở bài học nào?`,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState('Ngữ văn THPT Kết nối tri thức');
  const [apiStatus, setApiStatus] = useState<{
    hasGeminiKey: boolean;
    checked: boolean;
  }>({
    hasGeminiKey: false,
    checked: false,
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check backend Gemini API key status on mount
  useEffect(() => {
    fetch('/api/status')
      .then((res) => res.json())
      .then((data) => {
        setApiStatus({
          hasGeminiKey: Boolean(data.hasGeminiKey),
          checked: true,
        });
      })
      .catch(() => {
        setApiStatus({
          hasGeminiKey: false,
          checked: true,
        });
      });
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const promptSuggestions = [
    'Hướng dẫn lập dàn ý đoạn văn 200 chữ về Lòng biết ơn',
    'Chỉ ra và phân tích biện pháp tu từ trong hai câu thơ đầu bài Tây Tiến',
    'Cách mở bài gián tiếp cho bài văn phân tích Vợ nhặt (Kim Lân)',
    'Các bước trả lời câu hỏi thông hiểu và vận dụng trong đề thi tốt nghiệp',
    'Gợi ý cách triển khai luận điểm: Vẻ đẹp thiên lương trong Chữ người tử tù',
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputPrompt.trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: text,
          grade: currentUser.className ? `Lớp ${currentUser.className}` : 'THPT',
          topic: selectedTopic,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error === 'MISSING_API_KEY') {
          setMessages((prev) => [
            ...prev,
            {
              id: `msg-err-${Date.now()}`,
              sender: 'assistant',
              content: `⚠️ **THÔNG BÁO TỪ HỆ THỐNG**:
Khóa API Gemini chưa được cấu hình trên máy chủ.
Theo nguyên tắc sư phạm và tính trung thực học thuật, hệ thống không giả lập câu trả lời AI khi chưa có kết nối thật.

👉 **Cách kích hoạt:**
Vui lòng mở bảng điều khiển Secrets trong Google AI Studio và cấu hình biến môi trường \`GEMINI_API_KEY\` để kích hoạt Trợ lý AI thực tế.`,
              timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
            },
          ]);
        } else {
          setMessages((prev) => [
            ...prev,
            {
              id: `msg-err-${Date.now()}`,
              sender: 'assistant',
              content: `⚠️ Có lỗi kết nối đến máy chủ: ${data.message || 'Vui lòng thử lại sau.'}`,
              timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
            },
          ]);
        }
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `msg-ai-${Date.now()}`,
            sender: 'assistant',
            content: data.reply,
            timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-err-${Date.now()}`,
          sender: 'assistant',
          content: `⚠️ Không thể gửi yêu cầu đến máy chủ: ${err.message || 'Lỗi mạng'}`,
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title Bar */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-[#1769E0] rounded-xl">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold text-[#102E56]">
                Phân hệ 6: Trợ lý AI học Văn cùng Cô Thủy
              </h2>
              {apiStatus.checked && (
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    apiStatus.hasGeminiKey
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {apiStatus.hasGeminiKey ? 'Gemini 2.5 Sẵn sàng' : 'Cần cấu hình API Key'}
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-500">
              Phương pháp gợi mở sư phạm, định hướng tư duy, không viết sẵn bài thay học sinh
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="px-3 py-2 bg-[#EFF7FF] border border-blue-200 text-[#102E56] rounded-xl text-xs font-semibold"
          >
            <option value="Ngữ văn 10 - Thần thoại, Sử thi, Thơ Đường luật">Ngữ văn 10</option>
            <option value="Ngữ văn 11 - Văn học lãng mạn & hiện thực">Ngữ văn 11</option>
            <option value="Ngữ văn 12 - Tùy bút, Truyện ngắn & Ôn thi TN">Ngữ văn 12</option>
            <option value="Kỹ năng viết đoạn văn & bài văn nghị luận">Kỹ năng Viết</option>
          </select>
        </div>
      </div>

      {/* API Key Status Notice if Not Configured */}
      {apiStatus.checked && !apiStatus.hasGeminiKey && (
        <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 leading-relaxed">
            <strong className="block font-bold">Chế độ sẵn sàng kết nối Gemini API qua máy chủ:</strong>
            Hiện tại biến môi trường <code className="bg-amber-100 px-1 py-0.5 rounded text-amber-900">GEMINI_API_KEY</code> chưa được truyền từ AI Studio Secrets.
            Hệ thống đã chuẩn bị sẵn endpoint bảo mật <code className="bg-amber-100 px-1 py-0.5 rounded text-amber-900">/api/ai/chat</code> và prompt sư phạm Cô Thủy. Khi bạn thêm khóa API vào Secrets, Trợ lý sẽ tự động kích hoạt trả lời thông minh ngay lập tức!
          </div>
        </div>
      )}

      {/* Chat Window */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col h-[540px]">
        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${
                msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold shadow-xs ${
                  msg.sender === 'user'
                    ? 'bg-[#1769E0] text-white'
                    : 'bg-gradient-to-br from-[#102E56] to-[#1769E0] text-white border border-cyan-400/30'
                }`}
              >
                {msg.sender === 'user' ? (
                  currentUser.name.charAt(0)
                ) : (
                  <Bot className="w-5 h-5 text-cyan-200" />
                )}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed font-serif shadow-2xs ${
                  msg.sender === 'user'
                    ? 'bg-[#1769E0] text-white rounded-tr-none font-sans'
                    : 'bg-[#F8FBFF] text-slate-800 border border-blue-100/80 rounded-tl-none whitespace-pre-wrap'
                }`}
              >
                {msg.sender === 'assistant' && (
                  <div className="font-sans text-[11px] font-bold text-[#1769E0] mb-1 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Cô Thủy Nguyễn (Gợi ý sư phạm)</span>
                  </div>
                )}
                <div>{msg.content}</div>
                <div
                  className={`mt-2 text-[10px] text-right font-sans ${
                    msg.sender === 'user' ? 'text-blue-100' : 'text-slate-400'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-[#102E56] text-white flex items-center justify-center flex-shrink-0 animate-pulse">
                <Bot className="w-5 h-5 text-cyan-200" />
              </div>
              <div className="bg-[#F8FBFF] border border-blue-100 p-4 rounded-2xl rounded-tl-none text-xs text-slate-500 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#1769E0] animate-bounce"></span>
                <span className="w-2 h-2 rounded-full bg-[#1769E0] animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 rounded-full bg-[#1769E0] animate-bounce [animation-delay:0.4s]"></span>
                <span className="ml-1 font-serif italic text-slate-600">
                  Cô Thủy đang suy nghĩ định hướng gợi mở cho em...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Chips */}
        <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/70 overflow-x-auto flex items-center gap-2">
          <span className="text-[11px] font-bold text-slate-500 whitespace-nowrap flex items-center gap-1">
            <Lightbulb className="w-3 h-3 text-amber-500" />
            Gợi ý câu hỏi:
          </span>
          {promptSuggestions.map((sug, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(sug)}
              className="text-[11px] whitespace-nowrap px-2.5 py-1 bg-white border border-blue-100 text-[#102E56] rounded-full hover:bg-blue-50 hover:border-blue-300 transition-colors"
            >
              {sug}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 border-t border-slate-100 bg-white rounded-b-2xl">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Hỏi cô Thủy về dàn ý, biện pháp tu từ, cách mở bài, đọc hiểu..."
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:border-blue-400 focus:bg-white font-serif"
            />
            <button
              type="submit"
              disabled={!inputPrompt.trim() || isLoading}
              className="p-2.5 bg-[#1769E0] hover:bg-[#1358BE] disabled:opacity-40 text-white rounded-xl shadow-md transition-all flex items-center justify-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="mt-1 text-[11px] text-slate-400 text-center">
            * Trợ lý học Văn tuân thủ quy chuẩn sư phạm: hướng dẫn từng bước và không tạo bài văn giả mạo.
          </div>
        </div>
      </div>
    </div>
  );
};
