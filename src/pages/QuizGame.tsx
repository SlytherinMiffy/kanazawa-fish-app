import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export function QuizGame() {
    const navigate = useNavigate();

    return (
        <div className="h-[100dvh] w-screen flex flex-col bg-gray-900 overflow-hidden relative">
            {/* ヘッダー部分 */}
            <header className="bg-gradient-to-r from-blue-500 to-teal-500 shadow-md p-3 flex items-center justify-between shrink-0 z-20 w-full relative">
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-1 text-white font-bold hover:bg-white/20 px-3 py-1.5 rounded-full transition-colors text-sm"
                >
                    <ArrowLeft size={18} /> もどる
                </button>
                <div className="font-black text-white text-lg tracking-widest drop-shadow-md pr-4">
                    クイズマップ
                </div>
            </header>

            {/* 静的ファイルとして配信されているproject1のindex.htmlを表示 */}
            <div className="flex-1 w-full bg-black relative">
                <iframe
                    src="/project1/index.html?popup=1"
                    title="おさかなクイズマップ"
                    className="absolute inset-0 w-full h-full border-0"
                    allow="geolocation"
                />
            </div>
        </div>
    );
}