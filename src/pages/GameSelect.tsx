import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Gamepad2, Map as MapIcon, ArrowLeft } from 'lucide-react';

export function GameSelect() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-100 to-emerald-50 flex flex-col font-sans p-6 relative overflow-hidden">
            {/* 装飾 */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[120%] bg-white/30 blur-3xl rounded-full -z-10 pointer-events-none"></div>

            <header className="flex items-center mb-10 pt-4 z-10 w-full max-w-md mx-auto">
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-blue-700 font-bold hover:bg-white/50 px-4 py-2 rounded-full transition-colors backdrop-blur-sm"
                >
                    <ArrowLeft size={20} /> ホームに戻る
                </button>
            </header>

            <div className="max-w-md mx-auto w-full flex-1 flex flex-col justify-center gap-6 z-10 mb-20">
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-teal-700 drop-shadow-sm mb-2">ゲームであそぶ</h1>
                    <p className="text-gray-600 font-bold">好きなゲームを選んでポイントをゲットしよう！</p>
                </div>

                <button
                    onClick={() => navigate('/game')}
                    className="bg-white/90 backdrop-blur-md rounded-3xl p-6 shadow-lg border border-white hover:border-orange-300 hover:shadow-xl hover:shadow-orange-200/50 hover:-translate-y-1 transition-all duration-300 flex items-center gap-5 text-left group"
                >
                    <div className="bg-gradient-to-br from-orange-100 to-amber-100 p-5 rounded-2xl group-hover:scale-110 transition-transform shadow-inner ring-4 ring-white shrink-0">
                        <Gamepad2 size={40} className="text-orange-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-gray-800 tracking-tight">おさかな釣りゲーム</h2>
                        <p className="text-sm text-gray-500 mt-1 font-medium">浮きが沈んだタイミングで魚を釣り上げよう！</p>
                    </div>
                </button>

                <button
                    onClick={() => navigate('/quiz-game')}
                    className="bg-white/90 backdrop-blur-md rounded-3xl p-6 shadow-lg border border-white hover:border-blue-300 hover:shadow-xl hover:shadow-blue-200/50 hover:-translate-y-1 transition-all duration-300 flex items-center gap-5 text-left group"
                >
                    <div className="bg-gradient-to-br from-blue-100 to-cyan-100 p-5 rounded-2xl group-hover:scale-110 transition-transform shadow-inner ring-4 ring-white shrink-0">
                        <MapIcon size={40} className="text-blue-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-gray-800 tracking-tight">おさかなクイズマップ</h2>
                        <p className="text-sm text-gray-500 mt-1 font-medium">金沢の人気スポットを巡ってクイズに挑戦！</p>
                    </div>
                </button>
            </div>
        </div>
    );
}
