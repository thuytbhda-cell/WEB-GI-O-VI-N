import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import confetti from 'canvas-confetti';
import {
  Puzzle,
  Play,
  RotateCcw,
  Trophy,
  Clock,
  Sparkles,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  Shuffle,
  ChevronRight,
  BookOpen,
  Award,
} from 'lucide-react';

type GameId =
  | 'quiz'        // 1. Đố vui văn học
  | 'match'       // 2. Ghép tác giả - tác phẩm
  | 'crossword'   // 3. Ô chữ văn học
  | 'speed'       // 4. Trắc nghiệm nhanh 60s
  | 'wheel'       // 5. Vòng quay câu hỏi
  | 'timeline'    // 6. Sắp xếp sự kiện tác phẩm
  | 'reading';    // 7. Thử thách đọc hiểu

export const LearningGames: React.FC = () => {
  const { currentUser, showToast } = useApp();

  const [activeGame, setActiveGame] = useState<GameId | null>(null);

  // 1. Đố vui văn học state
  const [quizIdx, setQuizIdx] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizSelected, setQuizSelected] = useState<number | null>(null);
  const [quizFinished, setQuizFinished] = useState(false);

  // 2. Ghép tác giả - tác phẩm state
  const [matchPairs, setMatchPairs] = useState<{ author: string; work: string; matched: boolean }[]>([
    { author: 'Quang Dũng', work: 'Tây Tiến', matched: false },
    { author: 'Kim Lân', work: 'Vợ nhặt', matched: false },
    { author: 'Nguyễn Tuân', work: 'Người lái đò Sông Đà', matched: false },
    { author: 'Nguyễn Khoa Điềm', work: 'Đất Nước', matched: false },
  ]);
  const [selectedAuthor, setSelectedAuthor] = useState<string | null>(null);
  const [selectedWork, setSelectedWork] = useState<string | null>(null);
  const [matchCount, setMatchCount] = useState(0);

  // 3. Ô chữ văn học state
  const crosswordClues = [
    { num: 1, answer: 'TAYTIEN', clue: 'Tên bài thơ viết về đoàn binh hào hoa Tây tiến của Quang Dũng (7 chữ cái)' },
    { num: 2, answer: 'KIMLAN', clue: 'Tác giả của truyện ngắn Làng và Vợ nhặt (6 chữ cái)' },
    { num: 3, answer: 'SONGDA', clue: 'Con sông vừa hung bạo vừa trữ tình trong tùy bút của Nguyễn Tuân (6 chữ cái)' },
  ];
  const [crosswordInputs, setCrosswordInputs] = useState<Record<number, string>>({ 1: '', 2: '', 3: '' });
  const [crosswordChecked, setCrosswordChecked] = useState(false);

  // 4. Trắc nghiệm nhanh 60s state
  const [speedTimer, setSpeedTimer] = useState(60);
  const [speedScore, setSpeedScore] = useState(0);
  const [speedActive, setSpeedActive] = useState(false);
  const [speedIdx, setSpeedIdx] = useState(0);

  // 5. Vòng quay câu hỏi state
  const wheelQuestions = [
    'Ai là tác giả của thiên truyện "Chữ người tử tù"?',
    'Hình tượng người lính Tây Tiến mang vẻ đẹp bi tráng hay hiện thực trần trụi?',
    'Trong Vợ nhặt, chi tiết kết thúc tác phẩm là hình ảnh gì?',
    'Thể loại sử thi thể hiện khát vọng của cộng đồng hay của cá nhân?',
    'Biện pháp tu từ nào làm nổi bật vẻ đẹp dòng sông Đà?',
  ];
  const [wheelResult, setWheelResult] = useState<string | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);

  // 6. Sắp xếp sự kiện Vợ nhặt
  const initialEvents = [
    { id: 'ev3', text: 'Bữa cơm ngày đói với nồi cháo cám đắng chát nhưng ấm áp tình thương' },
    { id: 'ev1', text: 'Tràng gặp thị đói ở cổng chợ tỉnh, đãi 4 bát bánh đúc và nói đùa một câu' },
    { id: 'ev2', text: 'Tràng đưa thị về nhà, bà cụ Tứ vừa mừng vừa tủi đón nhận con dâu' },
    { id: 'ev4', text: 'Tiếng trống thúc thuế dồn dập và hình ảnh lá cờ đỏ sao vàng hiện lên' },
  ];
  const [timelineItems, setTimelineItems] = useState(initialEvents);
  const [timelineSuccess, setTimelineSuccess] = useState<boolean | null>(null);

  // 7. Thử thách đọc hiểu nhanh
  const [readingAnswer, setReadingAnswer] = useState<string | null>(null);
  const [readingResult, setReadingResult] = useState<boolean | null>(null);

  // Quiz questions
  const quizQuestions = [
    {
      q: 'Tác phẩm "Chữ người tử tù" của Nguyễn Tuân được in trong tập truyện nào?',
      options: ['A. Vang bóng một thời', 'B. Chiếc lư đồng mắt cua', 'C. Sông Đà', 'D. Hà Nội băm sáu phố phường'],
      correct: 0,
    },
    {
      q: 'Đoàn quân Tây Tiến được thành lập vào năm nào?',
      options: ['A. 1945', 'B. 1947', 'C. 1954', 'D. 1975'],
      correct: 1,
    },
    {
      q: 'Trong "Vợ nhặt", bà cụ Tứ đã chuẩn bị nồi cháo cám và gọi đùa là món gì?',
      options: ['A. Chè hạt sen', 'B. Chè khoán ngon đáo để', 'C. Bánh trôi nước', 'D. Chè đỗ xanh'],
      correct: 1,
    },
  ];

  // Confetti trigger
  const triggerWin = () => {
    try {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    } catch {}
  };

  // Speed timer effect
  useEffect(() => {
    let interval: any = null;
    if (speedActive && speedTimer > 0) {
      interval = setInterval(() => {
        setSpeedTimer((t) => t - 1);
      }, 1000);
    } else if (speedTimer === 0 && speedActive) {
      setSpeedActive(false);
      showToast(`Hết giờ! Em đạt ${speedScore} điểm trong 60 giây`, 'info');
      triggerWin();
    }
    return () => clearInterval(interval);
  }, [speedActive, speedTimer, speedScore]);

  // Handle Match Click
  const handleSelectAuthor = (author: string) => {
    setSelectedAuthor(author);
    if (selectedWork) {
      checkMatch(author, selectedWork);
    }
  };

  const handleSelectWork = (work: string) => {
    setSelectedWork(work);
    if (selectedAuthor) {
      checkMatch(selectedAuthor, work);
    }
  };

  const checkMatch = (author: string, work: string) => {
    const pair = matchPairs.find((p) => p.author === author && p.work === work);
    if (pair) {
      setMatchPairs((prev) =>
        prev.map((p) => (p.author === author ? { ...p, matched: true } : p))
      );
      setMatchCount((c) => c + 1);
      showToast(`Chính xác: ${author} sáng tác ${work}!`, 'success');
      if (matchCount + 1 === matchPairs.length) {
        triggerWin();
      }
    } else {
      showToast('Chưa chính xác, hãy thử ghép cặp khác nhé!', 'error');
    }
    setSelectedAuthor(null);
    setSelectedWork(null);
  };

  // Timeline move
  const moveTimelineItem = (index: number, direction: 'up' | 'down') => {
    const newItems = [...timelineItems];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newItems.length) return;
    const temp = newItems[index];
    newItems[index] = newItems[targetIdx];
    newItems[targetIdx] = temp;
    setTimelineItems(newItems);
  };

  const checkTimelineOrder = () => {
    const correctOrder = ['ev1', 'ev2', 'ev3', 'ev4'];
    const currentOrder = timelineItems.map((item) => item.id);
    const isCorrect = JSON.stringify(correctOrder) === JSON.stringify(currentOrder);
    setTimelineSuccess(isCorrect);
    if (isCorrect) {
      triggerWin();
      showToast('Tuyệt vời! Em đã sắp xếp đúng tiến trình diễn biến cốt truyện Vợ nhặt.', 'success');
    } else {
      showToast('Thứ tự chưa chính xác, hãy xem xét lại các sự kiện nhé!', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Title Bar */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-[#1769E0] rounded-xl">
            <Puzzle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#102E56]">
              Phân hệ 7: Trò chơi học tập Ngữ văn
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              7 trò chơi tương tác thực sự: Đố vui, Ghép cặp, Ô chữ, Trắc nghiệm nhanh, Vòng quay, Dòng thời gian
            </p>
          </div>
        </div>

        {activeGame && (
          <button
            onClick={() => setActiveGame(null)}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
          >
            &larr; Về danh sách trò chơi
          </button>
        )}
      </div>

      {/* Grid of 7 playable games */}
      {!activeGame && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Game 1 */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#1769E0] flex items-center justify-center font-bold text-lg mb-3">
                1
              </div>
              <h3 className="text-base font-bold text-[#102E56]">Đố vui văn học</h3>
              <p className="text-xs text-slate-500 mt-1">
                Thử tài hiểu biết về các tác giả, tác phẩm văn học trung đại và hiện đại Việt Nam.
              </p>
            </div>
            <button
              onClick={() => {
                setActiveGame('quiz');
                setQuizIdx(0);
                setQuizScore(0);
                setQuizFinished(false);
                setQuizSelected(null);
              }}
              className="mt-4 w-full py-2 bg-[#1769E0] text-white text-xs font-bold rounded-xl hover:bg-[#1358BE] transition-all flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Chơi ngay</span>
            </button>
          </div>

          {/* Game 2 */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-lg mb-3">
                2
              </div>
              <h3 className="text-base font-bold text-[#102E56]">Ghép tác giả - tác phẩm</h3>
              <p className="text-xs text-slate-500 mt-1">
                Ghép nối đúng tác giả văn học với những tác phẩm kinh điển tương ứng trong chương trình THPT.
              </p>
            </div>
            <button
              onClick={() => {
                setActiveGame('match');
                setMatchPairs(matchPairs.map((p) => ({ ...p, matched: false })));
                setMatchCount(0);
              }}
              className="mt-4 w-full py-2 bg-purple-600 text-white text-xs font-bold rounded-xl hover:bg-purple-700 transition-all flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Chơi ngay</span>
            </button>
          </div>

          {/* Game 3 */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg mb-3">
                3
              </div>
              <h3 className="text-base font-bold text-[#102E56]">Ô chữ văn học</h3>
              <p className="text-xs text-slate-500 mt-1">
                Giải mã các hàng ô chữ theo gợi ý văn học THPT để mở ra từ khóa chủ đề bí ẩn.
              </p>
            </div>
            <button
              onClick={() => setActiveGame('crossword')}
              className="mt-4 w-full py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition-all flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Chơi ngay</span>
            </button>
          </div>

          {/* Game 4 */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-lg mb-3">
                4
              </div>
              <h3 className="text-base font-bold text-[#102E56]">Trắc nghiệm nhanh 60 giây</h3>
              <p className="text-xs text-slate-500 mt-1">
                Thử thách phản xạ chớp nhoáng: Trả lời tối đa câu hỏi Ngữ văn đúng trước khi đồng hồ điểm 0.
              </p>
            </div>
            <button
              onClick={() => {
                setActiveGame('speed');
                setSpeedTimer(60);
                setSpeedScore(0);
                setSpeedActive(true);
              }}
              className="mt-4 w-full py-2 bg-amber-600 text-white text-xs font-bold rounded-xl hover:bg-amber-700 transition-all flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Bắt đầu đếm ngược</span>
            </button>
          </div>

          {/* Game 5 */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-lg mb-3">
                5
              </div>
              <h3 className="text-base font-bold text-[#102E56]">Vòng quay câu hỏi ngẫu nhiên</h3>
              <p className="text-xs text-slate-500 mt-1">
                Quay thưởng câu hỏi văn học bất ngờ để trả lời trong giờ sinh hoạt lớp hoặc tiết ôn tập.
              </p>
            </div>
            <button
              onClick={() => setActiveGame('wheel')}
              className="mt-4 w-full py-2 bg-rose-600 text-white text-xs font-bold rounded-xl hover:bg-rose-700 transition-all flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Quay vòng</span>
            </button>
          </div>

          {/* Game 6 */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center font-bold text-lg mb-3">
                6
              </div>
              <h3 className="text-base font-bold text-[#102E56]">Sắp xếp sự kiện tác phẩm</h3>
              <p className="text-xs text-slate-500 mt-1">
                Kéo thả sắp xếp các biến cố cốt truyện văn xuôi theo đúng trình tự thời gian tác phẩm.
              </p>
            </div>
            <button
              onClick={() => setActiveGame('timeline')}
              className="mt-4 w-full py-2 bg-cyan-600 text-white text-xs font-bold rounded-xl hover:bg-cyan-700 transition-all flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Sắp xếp</span>
            </button>
          </div>

          {/* Game 7 */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg mb-3">
                7
              </div>
              <h3 className="text-base font-bold text-[#102E56]">Thử thách đọc hiểu nhanh</h3>
              <p className="text-xs text-slate-500 mt-1">
                Đọc một đoạn thơ/văn ngắn và tìm ra biện pháp tu từ then chốt trong thời gian quy định.
              </p>
            </div>
            <button
              onClick={() => setActiveGame('reading')}
              className="mt-4 w-full py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Thử thách</span>
            </button>
          </div>
        </div>
      )}

      {/* GAME 1: ĐỐ VUI */}
      {activeGame === 'quiz' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm max-w-xl mx-auto">
          {!quizFinished ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Câu hỏi {quizIdx + 1} / {quizQuestions.length}</span>
                <span className="font-bold text-[#1769E0]">Điểm hiện tại: {quizScore}</span>
              </div>

              <h3 className="text-base font-bold text-[#102E56] font-serif">
                {quizQuestions[quizIdx].q}
              </h3>

              <div className="space-y-2">
                {quizQuestions[quizIdx].options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => setQuizSelected(i)}
                    className={`w-full text-left p-3 rounded-xl border text-xs sm:text-sm font-serif transition-all ${
                      quizSelected === i
                        ? 'bg-blue-50 border-[#1769E0] font-bold text-[#102E56]'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button
                  disabled={quizSelected === null}
                  onClick={() => {
                    const isCorrect = quizSelected === quizQuestions[quizIdx].correct;
                    if (isCorrect) {
                      setQuizScore((s) => s + 10);
                      showToast('Chính xác! +10 điểm', 'success');
                    } else {
                      showToast('Chưa chính xác!', 'error');
                    }

                    if (quizIdx + 1 < quizQuestions.length) {
                      setQuizIdx((i) => i + 1);
                      setQuizSelected(null);
                    } else {
                      setQuizFinished(true);
                      triggerWin();
                    }
                  }}
                  className="px-5 py-2 bg-[#1769E0] disabled:opacity-40 text-white rounded-xl text-xs font-bold shadow-md"
                >
                  {quizIdx + 1 === quizQuestions.length ? 'Xem kết quả' : 'Câu tiếp theo &rarr;'}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 space-y-3">
              <Trophy className="w-14 h-14 text-amber-500 mx-auto" />
              <h3 className="text-xl font-bold text-[#102E56]">Hoàn thành đố vui văn học!</h3>
              <p className="text-sm text-slate-600">
                Chúc mừng em đã đạt <strong className="text-[#1769E0] text-lg">{quizScore} / {quizQuestions.length * 10} điểm</strong>!
              </p>
              <button
                onClick={() => {
                  setQuizIdx(0);
                  setQuizScore(0);
                  setQuizFinished(false);
                  setQuizSelected(null);
                }}
                className="mt-3 px-5 py-2 bg-[#1769E0] text-white text-xs font-bold rounded-xl"
              >
                Chơi lại
              </button>
            </div>
          )}
        </div>
      )}

      {/* GAME 2: GHÉP TÁC GIẢ - TÁC PHẨM */}
      {activeGame === 'match' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm max-w-2xl mx-auto space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-[#102E56]">Ghép tác giả với tác phẩm tương ứng</h3>
            <span className="text-xs font-bold text-purple-600">
              Đã ghép: {matchPairs.filter((p) => p.matched).length} / {matchPairs.length}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Authors */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-500 mb-2 uppercase">Cột Tác giả</div>
              {matchPairs.map((pair) => (
                <button
                  key={pair.author}
                  disabled={pair.matched}
                  onClick={() => handleSelectAuthor(pair.author)}
                  className={`w-full p-3 rounded-xl border text-xs font-bold text-left transition-all ${
                    pair.matched
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-700 opacity-60'
                      : selectedAuthor === pair.author
                      ? 'bg-purple-100 border-purple-500 text-purple-900 shadow-xs'
                      : 'border-slate-200 hover:bg-slate-50 text-[#102E56]'
                  }`}
                >
                  {pair.author}
                </button>
              ))}
            </div>

            {/* Works */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-500 mb-2 uppercase">Cột Tác phẩm</div>
              {matchPairs.map((pair) => (
                <button
                  key={pair.work}
                  disabled={pair.matched}
                  onClick={() => handleSelectWork(pair.work)}
                  className={`w-full p-3 rounded-xl border text-xs font-bold text-left transition-all ${
                    pair.matched
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-700 opacity-60'
                      : selectedWork === pair.work
                      ? 'bg-purple-100 border-purple-500 text-purple-900 shadow-xs'
                      : 'border-slate-200 hover:bg-slate-50 text-[#102E56]'
                  }`}
                >
                  {pair.work}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* GAME 5: VÒNG QUAY CÂU HỎI */}
      {activeGame === 'wheel' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm max-w-md mx-auto text-center space-y-4">
          <h3 className="text-base font-bold text-[#102E56]">Vòng quay câu hỏi văn học</h3>
          <p className="text-xs text-slate-500">Nhấn nút bên dưới để quay câu hỏi ngẫu nhiên:</p>

          <div className="py-6">
            <div
              className={`w-40 h-40 rounded-full border-4 border-rose-500 mx-auto flex items-center justify-center p-4 bg-gradient-to-tr from-rose-50 to-amber-50 shadow-inner ${
                isSpinning ? 'animate-spin' : ''
              }`}
            >
              <Shuffle className="w-12 h-12 text-rose-500" />
            </div>
          </div>

          {wheelResult && !isSpinning && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs font-serif font-bold text-rose-900 leading-relaxed">
              ❓ Câu hỏi của em: <br />
              <span className="text-sm text-slate-900 mt-1 block font-normal">{wheelResult}</span>
            </div>
          )}

          <button
            disabled={isSpinning}
            onClick={() => {
              setIsSpinning(true);
              setWheelResult(null);
              setTimeout(() => {
                const randomQ = wheelQuestions[Math.floor(Math.random() * wheelQuestions.length)];
                setWheelResult(randomQ);
                setIsSpinning(false);
              }, 1200);
            }}
            className="px-6 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-500/20"
          >
            {isSpinning ? 'Đang quay...' : 'Quay câu hỏi'}
          </button>
        </div>
      )}

      {/* GAME 6: SẮP XẾP SỰ KIỆN TÁC PHẨM */}
      {activeGame === 'timeline' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm max-w-xl mx-auto space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-[#102E56]">
              Sắp xếp diễn biến cốt truyện: "Vợ nhặt" (Kim Lân)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Sử dụng các mũi tên để di chuyển sự kiện theo đúng trật tự mở đầu đến kết thúc:
            </p>
          </div>

          <div className="space-y-2.5">
            {timelineItems.map((item, idx) => (
              <div
                key={item.id}
                className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3 text-xs font-serif"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-[#102E56] text-white font-bold flex items-center justify-center font-sans text-xs">
                    {idx + 1}
                  </span>
                  <span className="text-slate-800 leading-relaxed">{item.text}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <button
                    disabled={idx === 0}
                    onClick={() => moveTimelineItem(idx, 'up')}
                    className="p-1 rounded bg-white border border-slate-200 disabled:opacity-30 hover:bg-slate-100"
                  >
                    ▲
                  </button>
                  <button
                    disabled={idx === timelineItems.length - 1}
                    onClick={() => moveTimelineItem(idx, 'down')}
                    className="p-1 rounded bg-white border border-slate-200 disabled:opacity-30 hover:bg-slate-100"
                  >
                    ▼
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <button
              onClick={checkTimelineOrder}
              className="px-5 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-bold shadow-md shadow-cyan-500/20"
            >
              Kiểm tra kết quả sắp xếp
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
