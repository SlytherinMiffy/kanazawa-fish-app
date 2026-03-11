import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Camera, Gamepad2, UserCircle, Star, Award, Map as MapIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
//test
// --- Background Effects ---
interface Bubble {
    id: number;
    x: number;
    y: number;
    size: number;
    speed: number;
    opacity: number;
}

interface ClickEffect {
    id: number;
    x: number;
    y: number;
}

interface SwimmingFish {
    id: number;
    type: string;
    x: number;
    y: number;
    size: number;
    speed: number;
    direction: number; // 1 for right, -1 for left
    wobbleSpeed: number;
    wobbleAmount: number;
    createdAt: number;
}

const fishTypes = [
    'ankou.png', 'dori.png', 'harisenbon.png', 'hugu.png',
    'ishidai.png', 'katuo.png', 'kurage.png', 'maguro.png',
    'manbou.png', 'nimo.png', 'sake.png', 'tatu.png'
];
//test
const Seaweed = ({ height, delay, left, src }: { height: number, delay: string, left: string, src: string }) => (
    <div
        className="absolute bottom-0 origin-bottom pointer-events-none z-0"
        style={{
            left,
            height: `${height}px`,
            width: `${height * 0.4}px`,
            animation: `sway 4s ease-in-out infinite alternate ${delay}`
        }}
    >
        <img
            src={`/fish_picture/${src}`}
            alt="seaweed"
            className="w-full h-full object-contain drop-shadow-md"
        />
    </div>
);
//test
// --- Seabed Scenery Components ---
const Sand = () => (
    <div className="absolute bottom-0 left-0 w-full h-[15vh] pointer-events-none z-0 overflow-hidden">
        <svg viewBox="0 0 1000 100" preserveAspectRatio="none" className="w-full h-full text-yellow-100 opacity-90">
            <path d="M0,50 Q250,20 500,50 T1000,50 L1000,100 L0,100 Z" fill="currentColor" />
            {/* 砂の質感を出すための細かなドット（省略可だが雰囲気が出る） */}
            <circle cx="150" cy="70" r="2" fill="#d4c08e" opacity="0.5" />
            <circle cx="280" cy="60" r="1.5" fill="#d4c08e" opacity="0.6" />
            <circle cx="450" cy="80" r="2.5" fill="#d4c08e" opacity="0.4" />
            <circle cx="650" cy="55" r="1" fill="#d4c08e" opacity="0.7" />
            <circle cx="850" cy="75" r="2" fill="#d4c08e" opacity="0.5" />
        </svg>
    </div>
);

const Rock = ({ width, height, left, color = "text-stone-400" }: { width: number, height: number, left: string, color?: string }) => (
    <div
        className="absolute bottom-0 origin-bottom pointer-events-none z-0"
        style={{ left, width: `${width}px`, height: `${height}px` }}
    >
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className={`w-full h-full ${color} drop-shadow-md`}>
            <path d="M10,100 L30,40 L60,20 L80,50 L90,100 Z" fill="currentColor" />
            {/* 岩のハイライト */}
            <path d="M30,40 L60,20 L70,45 L45,60 Z" fill="rgba(255,255,255,0.15)" />
        </svg>
    </div>
);

const Coral = ({ width, height, left, src }: { width: number, height: number, left: string, src: string }) => (
    <div
        className="absolute bottom-0 origin-bottom pointer-events-none z-0"
        style={{ left, width: `${width}px`, height: `${height}px` }}
    >
        <img
            src={`/fish_picture/${src}`}
            alt="coral"
            className="w-full h-full object-contain drop-shadow-md opacity-90"
        />
    </div>
);

export function Home() {
    const { user } = useAuth();
    const [bubbles, setBubbles] = useState<Bubble[]>([]);
    const [clickEffects, setClickEffects] = useState<ClickEffect[]>([]);
    const [fishes, setFishes] = useState<SwimmingFish[]>([]);
    const [showStampMenu, setShowStampMenu] = useState(false);
    const [showGameMenu, setShowGameMenu] = useState(false);

    // Initialize random background bubbles and fishes
    useEffect(() => {
        // Generate bubbles distributed across the screen and below it
        const initialBubbles: Bubble[] = Array.from({ length: 60 }).map((_, i) => ({
            id: i,
            x: Math.random() * 100, // percentage string
            y: Math.random() * 120, // distribute from top to slightly below bottom
            size: Math.random() * 35 + 10,
            speed: Math.random() * 0.4 + 0.1, // ゆっくり一定速度
            opacity: Math.random() * 0.5 + 0.3,
        }));
        setBubbles(initialBubbles);

        const initialFishes: SwimmingFish[] = Array.from({ length: 8 }).map((_, i) => {
            const direction = Math.random() > 0.5 ? 1 : -1;
            const isJinbe = Math.random() < 0.05; // 5% chance
            return {
                id: i,
                type: isJinbe ? 'jinbezame.png' : fishTypes[Math.floor(Math.random() * fishTypes.length)],
                x: Math.random() * 100,
                y: isJinbe ? Math.random() * 10 + 15 : Math.random() * 70 + 10, // ジンベエザメは中央付近(15%~25%)に固定
                size: isJinbe ? Math.random() * 200 + 600 : Math.random() * 100 + 150, // ジンベエは600~800px、通常は150~250px
                speed: (Math.random() * 0.08 + 0.04) * direction,
                direction,
                wobbleSpeed: Math.random() * 0.003 + 0.001,
                wobbleAmount: Math.random() * 0.4 + 0.2,
                createdAt: performance.now(),
            };
        });
        setFishes(initialFishes);
    }, []);

    // Animation loop for continuously rising bubbles and swimming fishes
    useEffect(() => {
        let animationFrameId: number;
        let lastTime = performance.now();

        const animate = (time: number) => {
            const deltaTime = time - lastTime;
            lastTime = time;

            // Animate bubbles upwards
            setBubbles((prevBubbles) =>
                prevBubbles.map((bubble) => {
                    let newY = bubble.y - bubble.speed * (deltaTime / 16);
                    // If a bubble goes past the top of the screen (-10%), reset it to the bottom
                    if (newY < -10) {
                        newY = 110 + Math.random() * 20;
                        bubble.x = Math.random() * 100;
                        bubble.id = Math.random();
                    }
                    return { ...bubble, y: newY };
                })
            );

            // Animate swimming fishes
            setFishes((prevFishes) =>
                prevFishes.map((fish) => {
                    let newX = fish.x + fish.speed * (deltaTime / 16);
                    // If a fish goes off screen horizontally, reset on the opposite side
                    // ジンベエザメに見切れないよう左右の判定を広く（150と-50）取る
                    if (fish.direction === 1 && newX > 150) {
                        newX = -50;
                        const isJinbe = Math.random() < 0.05;
                        fish.y = isJinbe ? Math.random() * 10 + 15 : Math.random() * 70 + 10;
                        fish.type = isJinbe ? 'jinbezame.png' : fishTypes[Math.floor(Math.random() * fishTypes.length)];
                        fish.size = isJinbe ? Math.random() * 200 + 600 : Math.random() * 100 + 150;
                    } else if (fish.direction === -1 && newX < -50) {
                        newX = 150;
                        const isJinbe = Math.random() < 0.05;
                        fish.y = isJinbe ? Math.random() * 10 + 15 : Math.random() * 70 + 10;
                        fish.type = isJinbe ? 'jinbezame.png' : fishTypes[Math.floor(Math.random() * fishTypes.length)];
                        fish.size = isJinbe ? Math.random() * 200 + 600 : Math.random() * 100 + 150;
                    }
                    return { ...fish, x: newX };
                })
            );

            animationFrameId = requestAnimationFrame(animate);
        };

        animationFrameId = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationFrameId);
    }, []);

    // Handle clicks to spawn ripple and burst of bubbles
    const handleBackgroundClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if ((e.target as HTMLElement).closest('a') || (e.target as HTMLElement).closest('header')) {
            return;
        }

        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const percentX = (x / rect.width) * 100;
        const percentY = (y / rect.height) * 100;

        const newEffect: ClickEffect = { id: Date.now(), x, y };
        setClickEffects((prev) => [...prev, newEffect]);

        const tempBubbles: Bubble[] = Array.from({ length: 5 }).map((_, i) => ({
            id: Date.now() + i + 1000,
            x: percentX + (Math.random() * 4 - 2),
            y: percentY,
            size: Math.random() * 20 + 5,
            speed: Math.random() * 1 + 1,
            opacity: 0.6,
        }));

        setBubbles((prev) => [...prev, ...tempBubbles]);

        setTimeout(() => {
            setClickEffects((prev) => prev.filter((effect) => effect.id !== newEffect.id));
        }, 1000);
    }, []);

    const handleLogout = () => {
        signOut(auth);
    };

    return (
        <div
            className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-100 to-emerald-50 flex flex-col font-sans relative overflow-hidden"
            onClick={handleBackgroundClick}
        >
            <style>{`
                @keyframes sway {
                    0% { transform: rotate(-5deg); }
                    100% { transform: rotate(5deg); }
                }
            `}</style>

            {/* Background Seabed Scenery */}
            <Sand />

            {/* Rocks */}
            <Rock width={120} height={60} left="-2%" color="text-stone-500" />
            <Rock width={180} height={80} left="30%" color="text-stone-400" />
            <Rock width={140} height={70} left="70%" color="text-stone-600" />
            <Rock width={200} height={90} left="85%" color="text-stone-500" />

            {/* Corals */}
            <Coral width={150} height={80} left="8%" src="sango03_puple.png" />
            <Coral width={150} height={80} left="15%" src="sango_red.png" />
            <Coral width={50} height={60} left="40%" src="sango08_pink.png" />
            <Coral width={90} height={120} left="60%" src="sango05_bluegreen.png" />
            <Coral width={40} height={50} left="80%" src="sango07_yellow.png" />
            <Coral width={100} height={130} left="82%" src="sango09_brown.png" />
            <Coral width={100} height={70} left="25%" src="sango04_khaki.png" />
            <Coral width={80} height={80} left="52%" src="sango10_orange.png" />

            {/* Seaweeds (placed among rocks/corals) */}
            <Seaweed height={150} src="kaisou_wakame.png" delay="0s" left="5%" />
            <Seaweed height={150} src="kaisou_konbu.png" delay="-2s" left="95%" />
            <Seaweed height={120} src="kaisou_wakame.png" delay="-3s" left="43%" />
            <Seaweed height={120} src="kaisou_konbu.png" delay="-1.5s" left="68%" />

            {/* Animated Background Bubbles */}
            {bubbles.map((bubble) => (
                <div
                    key={bubble.id}
                    // 濃いめの青い泡スタイル
                    className="absolute rounded-full border-[1.5px] border-blue-600/50 bg-gradient-to-tr from-blue-700/20 to-blue-500/40 shadow-[inset_0_0_10px_rgba(29,78,216,0.4)] pointer-events-none"
                    style={{
                        left: `${bubble.x}%`,
                        top: `${bubble.y}%`,
                        width: `${bubble.size}px`,
                        height: `${bubble.size}px`,
                        opacity: bubble.opacity,
                        // transitionは外す（横移動の滑りをなくすため）
                    }}
                />
            ))}

            {/* Animated Swimming Fishes */}
            {fishes.map((fish) => {
                // Calculate a simple wobble offset
                const elapsed = performance.now() - fish.createdAt;
                let wobbleMultiplier = 5;
                let directionFlip = fish.direction === 1 ? -1 : 1;

                // クラゲとタツノオトシゴは大きく上下に揺れる
                if (fish.type === 'kurage.png' || fish.type === 'tatu.png') {
                    // wobble calculation (0 to 1 sin wave * amount) and make it larger
                    wobbleMultiplier = 20;
                    // タツノオトシゴやクラゲは基本左右反転させず正面向きなど自然に見せる場合はここを調整できる（一旦反転ロジックは他と同じ）
                }

                const wobble = Math.sin(elapsed * fish.wobbleSpeed) * fish.wobbleAmount * wobbleMultiplier; // 縦揺れの幅(%)

                return (
                    <img
                        key={fish.id}
                        src={`/fish_picture/${fish.type}`}
                        alt="fish"
                        className="absolute pointer-events-none drop-shadow-lg z-0 transition-opacity duration-1000"
                        style={{
                            left: `${fish.x}%`,
                            top: `calc(${fish.y}% + ${wobble}%)`,
                            width: `${fish.size}px`,
                            // Flip the image if direction is 1 (swimming right)
                            transform: `scaleX(${directionFlip})`,
                        }}
                    />
                );
            })}

            {/* Click Ripple Effects */}
            {clickEffects.map((effect) => (
                <div
                    key={effect.id}
                    className="absolute rounded-full pointer-events-none border-2 border-cyan-400 pointer-events-none animate-ping opacity-60 z-0"
                    style={{
                        left: effect.x - 25,
                        top: effect.y - 25,
                        width: 50,
                        height: 50,
                        animationDuration: '1s'
                    }}
                />
            ))}

            {/* Header */}
            <header className="bg-white/80 backdrop-blur-lg shadow-[0_4px_20px_-10px_rgba(0,0,0,0.1)] border-b border-white p-3 sm:p-4 flex justify-between items-center sticky top-0 z-20">
                <div className="flex items-center gap-2 sm:gap-4 shrink-1 min-w-0 mr-2">
                    <div className="relative shrink-0 flex items-center justify-center -ml-1">
                        <div className="absolute inset-0 bg-cyan-400 blur-[16px] opacity-30 rounded-full scale-[1.3] pointer-events-none"></div>
                        <img
                            src="/fish_picture/rogo.png"
                            alt="ロゴ"
                            className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-lg relative z-10 transition-transform hover:scale-105 duration-300"
                        />
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="text-[9px] sm:text-[10px] font-extrabold text-cyan-500 tracking-widest hidden sm:block leading-none mb-1 opacity-80">KANAZAWA FISH GUIDE</span>
                        <h1 className="text-xl sm:text-2xl font-black bg-clip-text text-transparent bg-gradient-to-br from-blue-800 via-blue-600 to-cyan-500 tracking-tighter truncate drop-shadow-sm leading-tight">
                            石川魚通ガイド
                        </h1>
                    </div>
                </div>

                <div className="flex items-center gap-3 md:gap-4">
                    {/* Points & Stamps Display (Clickable) */}
                    <Link to="/stamps" className="flex items-center gap-2 md:gap-3 bg-white/60 backdrop-blur-sm px-3 md:px-4 py-2 rounded-full border border-white/50 shadow-sm hover:bg-white/90 hover:shadow-md transition-all cursor-pointer">
                        <div className="flex items-center gap-1.5 text-amber-600" title="獲得ポイント">
                            <Star size={18} className="fill-amber-400 text-amber-500" />
                            <span className="font-bold text-sm md:text-base">{user?.points || 0} <span className="text-xs font-medium">pt</span></span>
                        </div>
                        <div className="w-px h-4 bg-gray-300"></div>
                        <div className="flex items-center gap-1.5 text-emerald-600" title="獲得スタンプ種類">
                            <Award size={18} className="text-emerald-500" />
                            <span className="font-bold text-sm md:text-base">{user?.stamps?.length || 0} <span className="text-xs font-medium">種</span></span>
                        </div>
                    </Link>

                    <div className="flex items-center gap-2 md:gap-4 border border-white/60 shadow-inner rounded-full pl-3 pr-4 md:pl-5 md:pr-6 py-2.5 bg-white/50 backdrop-blur-sm">
                        <UserCircle size={28} className="text-blue-500 hidden sm:block" />
                        <span className="text-sm font-bold text-gray-700 truncate max-w-[80px] md:max-w-[120px]">
                            {user?.username || user?.displayName || 'ゲスト'}
                        </span>
                        <button onClick={handleLogout} className="text-xs md:text-sm text-blue-600 font-bold hover:text-blue-800 transition-colors ml-1 md:ml-2 pointer-events-auto shrink-0">
                            ログアウト
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 p-6 flex flex-col gap-6 max-w-md mx-auto w-full z-10 relative mt-4 pb-12 pointer-events-none">

                {/* Decorative background element behind cards */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[120%] bg-white/30 blur-3xl rounded-full -z-10 pointer-events-none"></div>

                {/* Hub Buttons with rich design */}
                <Link to="/chat" className="pointer-events-auto bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white hover:border-blue-300 hover:shadow-xl hover:shadow-blue-200/50 hover:-translate-y-1 transition-all duration-300 flex flex-col items-center gap-4 group">
                    <div className="bg-gradient-to-br from-blue-100 to-cyan-100 p-5 rounded-2xl group-hover:from-blue-200 group-hover:to-cyan-200 group-hover:scale-110 transition-all duration-300 shadow-inner ring-4 ring-white">
                        <MessageCircle size={44} className="text-blue-600 drop-shadow-sm" />
                    </div>
                    <div className="text-center">
                        <h2 className="text-xl font-bold text-gray-800 tracking-tight">コンシェルジュに相談する</h2>
                        <p className="text-sm text-gray-500 mt-2 font-medium">おすすめの鮮魚店・飲食店をチャットで質問</p>
                    </div>
                </Link>

                <button onClick={() => setShowStampMenu(true)} className="pointer-events-auto w-full bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white hover:border-teal-300 hover:shadow-xl hover:shadow-teal-200/50 hover:-translate-y-1 transition-all duration-300 flex flex-col items-center gap-4 group">
                    <div className="bg-gradient-to-br from-emerald-100 to-teal-100 p-5 rounded-2xl group-hover:from-emerald-200 group-hover:to-teal-200 group-hover:scale-110 transition-all duration-300 shadow-inner ring-4 ring-white">
                        <Camera size={44} className="text-teal-600 drop-shadow-sm" />
                    </div>
                    <div className="text-center">
                        <h2 className="text-xl font-bold text-gray-800 tracking-tight">デジタルスタンプでポイントを獲得</h2>
                        <p className="text-sm text-gray-500 mt-2 font-medium">カメラ起動・獲得履歴の確認はこちら</p>
                    </div>
                </button>

                <button onClick={() => setShowGameMenu(true)} className="pointer-events-auto w-full bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white hover:border-orange-300 hover:shadow-xl hover:shadow-orange-200/50 hover:-translate-y-1 transition-all duration-300 flex flex-col items-center gap-4 group">
                    <div className="bg-gradient-to-br from-orange-100 to-amber-100 p-5 rounded-2xl group-hover:from-orange-200 group-hover:to-amber-200 group-hover:scale-110 transition-all duration-300 shadow-inner ring-4 ring-white">
                        <Gamepad2 size={44} className="text-orange-600 drop-shadow-sm" />
                    </div>
                    <div className="text-center">
                        <h2 className="text-xl font-bold text-gray-800 tracking-tight">お魚ゲーム</h2>
                        <p className="text-sm text-gray-500 mt-2 font-medium">釣りゲームやクイズで遊ぼう！</p>
                    </div>
                </button>
            </main>

            {/* Stamp Menu Modal */}
            {showStampMenu && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 pointer-events-auto">
                    {/* Backdrop */}
                    <div 
                        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity"
                        onClick={() => setShowStampMenu(false)}
                    ></div>
                    
                    {/* Modal Content */}
                    <div className="relative bg-white/95 backdrop-blur-xl rounded-[32px] p-6 w-full max-w-sm shadow-2xl border border-white/50 flex flex-col gap-4 animate-fade-in-up">
                        <div className="text-center mb-2">
                            <h3 className="text-xl font-black text-teal-700 tracking-tight">スタンプメニュー</h3>
                            <p className="text-sm text-teal-600/70 font-bold mt-1">どちらを行いますか？</p>
                        </div>
                        
                        <Link 
                            to="/scanner" 
                            className="bg-gradient-to-r from-teal-500 to-emerald-400 p-4 rounded-2xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all text-white flex items-center gap-4 group"
                        >
                            <div className="bg-white/20 p-3 rounded-xl group-hover:scale-110 transition-transform">
                                <Camera size={28} />
                            </div>
                            <div className="flex-1 text-left">
                                <h4 className="font-bold text-lg">カメラを起動する</h4>
                                <p className="text-xs text-white/90 font-medium">QRを読み込んでポイントGET</p>
                            </div>
                        </Link>

                        <Link 
                            to="/stamps" 
                            className="bg-gradient-to-r from-amber-500 to-orange-400 p-4 rounded-2xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all text-white flex items-center gap-4 group"
                        >
                            <div className="bg-white/20 p-3 rounded-xl group-hover:scale-110 transition-transform">
                                <Award size={28} />
                            </div>
                            <div className="flex-1 text-left">
                                <h4 className="font-bold text-lg">獲得履歴を見る</h4>
                                <p className="text-xs text-white/90 font-medium">集めたスタンプの種類を確認</p>
                            </div>
                        </Link>
                        
                        <button 
                            onClick={() => setShowStampMenu(false)}
                            className="mt-2 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors w-full"
                        >
                            閉じる
                        </button>
                    </div>
                </div>
            )}

            {/* Game Menu Modal */}
            {showGameMenu && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 pointer-events-auto">
                    {/* Backdrop */}
                    <div 
                        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity"
                        onClick={() => setShowGameMenu(false)}
                    ></div>
                    
                    {/* Modal Content */}
                    <div className="relative bg-white/95 backdrop-blur-xl rounded-[32px] p-6 w-full max-w-sm shadow-2xl border border-white/50 flex flex-col gap-4 animate-fade-in-up">
                        <div className="text-center mb-2">
                            <h3 className="text-xl font-black text-orange-600 tracking-tight">ゲームメニュー</h3>
                            <p className="text-sm text-orange-600/70 font-bold mt-1">どちらで遊びますか？</p>
                        </div>
                        
                        <Link 
                            to="/game" 
                            className="bg-gradient-to-r from-orange-500 to-amber-400 p-4 rounded-2xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all text-white flex items-center gap-4 group"
                        >
                            <div className="bg-white/20 p-3 rounded-xl group-hover:scale-110 transition-transform flex-shrink-0 w-14 h-14 flex items-center justify-center">
                                <Gamepad2 size={28} />
                            </div>
                            <div className="flex-1 text-left min-w-0">
                                <h4 className="font-bold text-lg truncate">おさかな釣りゲーム</h4>
                                <p className="text-xs text-white/90 font-medium whitespace-nowrap overflow-hidden text-ellipsis">浮きが沈んだら釣り上げよう！</p>
                            </div>
                        </Link>

                        <Link 
                            to="/quiz-game" 
                            className="bg-gradient-to-r from-blue-500 to-cyan-400 p-4 rounded-2xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all text-white flex items-center gap-4 group"
                        >
                            <div className="bg-white/20 p-3 rounded-xl group-hover:scale-110 transition-transform flex-shrink-0 w-14 h-14 flex items-center justify-center">
                                <MapIcon size={28} />
                            </div>
                            <div className="flex-1 text-left min-w-0">
                                <h4 className="font-bold text-lg truncate">おさかなクイズマップ</h4>
                                <p className="text-xs text-white/90 font-medium whitespace-nowrap overflow-hidden text-ellipsis">金沢名所でクイズに挑戦！</p>
                            </div>
                        </Link>
                        
                        <button 
                            onClick={() => setShowGameMenu(false)}
                            className="mt-2 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors w-full"
                        >
                            閉じる
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
