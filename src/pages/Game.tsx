import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// --- Types ---
interface FishData {
    name: string;
    grade: number;
    difficulty: number;
    speed: number;
    image: string;
}

// --- Data ---
const FISH_DATA: FishData[] = [
    { name: "アジ", grade: 1, difficulty: 0.3, speed: 2.0, image: "/fish_picture/aji.png" },
    { name: "カレイ", grade: 2, difficulty: 0.5, speed: 2.5, image: "/fish_picture/karei.png" },
    { name: "甘エビ", grade: 2, difficulty: 0.6, speed: 3.0, image: "/fish_picture/amaebi.png" },
    { name: "アオリイカ", grade: 3, difficulty: 0.8, speed: 2.5, image: "/fish_picture/aoriika.png" },
    { name: "ブリ", grade: 4, difficulty: 1.2, speed: 4.5, image: "/fish_picture/buri.png" },
    { name: "のどぐろ", grade: 5, difficulty: 1.5, speed: 6.0, image: "/fish_picture/nodoguro.png" }
];

const ESCAPE_IMAGE = "/fish_picture/mizusibuki.png";
const TIME_LIMIT = 30; // 制限時間を30秒に変更

export function Game() {
    const navigate = useNavigate();
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<L.Map | null>(null);

    // --- State ---
    const [gameActive, setGameActive] = useState(false);
    const [resultActive, setResultActive] = useState(false);
    const [currentFish, setCurrentFish] = useState<FishData | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);

    // --- Refs (高頻度で更新されるゲーム内ステート) ---
    const gameState = useRef({
        fishY: 200,
        fishX: 125,
        fishTargetY: 200,
        fishTargetX: 125,
        barY: 0,
        barX: 100,
        targetBarX: 100,
        barVelocity: 0,
        progress: 0,
        isReeling: false,
        startTime: 0,
        nextEscapeCheck: 0,
        currentMarker: null as L.Marker | null,
        active: false,
        fish: null as FishData | null,
    });

    const requestRef = useRef<number>();

    // --- DOM Elements Refs ---
    const fishIconRef = useRef<HTMLDivElement>(null);
    const captureBarRef = useRef<HTMLDivElement>(null);
    const progressBarRef = useRef<HTMLDivElement>(null);
    const warningTextRef = useRef<HTMLParagraphElement>(null);
    const fishingBoxRef = useRef<HTMLDivElement>(null);
    const timerTextRef = useRef<HTMLDivElement>(null);

    // --- Map Initialization ---
    useEffect(() => {
        if (!mapRef.current || mapInstance.current) return;

        // Leaflet初期化
        const map = L.map(mapRef.current).setView([36.578044, 136.648185], 14);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        mapInstance.current = map;

        // カスタムアイコン（浮き）
        const floatIcon = L.divIcon({
            className: 'custom-float-icon',
            html: `<div class="float-body" style="width: 30px; height: 30px; border-radius: 50%; border: 2px solid #333; box-shadow: 2px 2px 5px rgba(0,0,0,0.5); position: relative; overflow: hidden; cursor: pointer; transition: transform 0.2s;">
                    <div class="float-top" style="width: 100%; height: 50%; background-color: #ff3333;"></div>
                    <div class="float-bottom" style="width: 100%; height: 50%; background-color: #ffeb3b;"></div>
                    <div class="float-line" style="position: absolute; top: 50%; left: 0; width: 100%; height: 4px; background-color: #333; transform: translateY(-50%);"></div>
                   </div>`,
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        });

        // 浮きの生成処理
        const spawnOneFloat = () => {
            if (!mapInstance.current) return;
            const lat = 36.578044 + (Math.random() - 0.5) * 0.04;
            const lng = 136.648185 + (Math.random() - 0.5) * 0.04;
            const fish = FISH_DATA[Math.floor(Math.random() * FISH_DATA.length)];

            const marker = L.marker([lat, lng], { icon: floatIcon }).addTo(mapInstance.current);

            marker.on('click', () => {
                startMiniGame(fish, marker);
            });

            // 浮きの自動消滅
            setTimeout(() => {
                const decayTimer = setInterval(() => {
                    if (!mapInstance.current || !mapInstance.current.hasLayer(marker)) {
                        clearInterval(decayTimer);
                        return;
                    }
                    if (Math.random() < 0.2) {
                        mapInstance.current.removeLayer(marker);
                        clearInterval(decayTimer);
                    }
                }, 1000);
            }, 30000);
        };

        const spawnBatch = () => {
            const count = Math.floor(Math.random() * 2) + 1;
            for (let i = 0; i < count; i++) {
                spawnOneFloat();
            }
        };

        // 一定時間ごとに浮きを出現させるサイクル
        spawnBatch();
        const spawnInterval = setInterval(spawnBatch, 15000);

        return () => {
            clearInterval(spawnInterval);
            map.remove();
            mapInstance.current = null;
        };
    }, []);

    // --- Game Control ---
    const resetGameState = useCallback(() => {
        const state = gameState.current;
        state.isReeling = false;
        state.barVelocity = 0;
        state.barY = 0;
        state.barX = 100;
        state.targetBarX = 100;
        state.progress = 0;
        state.fishY = 200;
        state.fishX = 125;
        state.fishTargetY = 200;
        state.fishTargetX = 125;

        if (warningTextRef.current) warningTextRef.current.style.opacity = '0';
        if (fishingBoxRef.current) fishingBoxRef.current.classList.remove('danger-border');
        if (timerTextRef.current) timerTextRef.current.innerText = `残り ${TIME_LIMIT} 秒`;
    }, []);

    const stopGame = useCallback((success: boolean, marker: L.Marker | null) => {
        gameState.current.active = false;
        setGameActive(false);
        setIsSuccess(success);
        setResultActive(true);

        // 成功時にはマップから浮きを削除
        if (success && marker && mapInstance.current && mapInstance.current.hasLayer(marker)) {
            mapInstance.current.removeLayer(marker);
        }
        resetGameState();
    }, [resetGameState]);

    const gameLoop = useCallback(() => {
        const state = gameState.current;
        if (!state.active || !state.fish) return;

        const CONTAINER_WIDTH = 300;
        const CONTAINER_HEIGHT = 400;
        const FISH_SIZE = 50;
        const BAR_WIDTH = 70;
        const BAR_HEIGHT = 90;

        const elapsedSeconds = (Date.now() - state.startTime) / 1000;
        const remainingSeconds = Math.max(0, Math.ceil(TIME_LIMIT - elapsedSeconds));

        // 残り時間の表示更新
        if (timerTextRef.current) {
            timerTextRef.current.innerText = `残り ${remainingSeconds} 秒`;
            if (remainingSeconds <= 10) {
                timerTextRef.current.classList.add('text-red-500', 'animate-pulse');
            } else {
                timerTextRef.current.classList.remove('text-red-500', 'animate-pulse');
            }
        }

        // 時間切れなら無条件で逃がす
        if (remainingSeconds <= 0) {
            stopGame(false, state.currentMarker);
            return;
        }

        // 残り10秒を切ったら警戒ペナルティ演出
        if (remainingSeconds <= 10) {
            if (warningTextRef.current) warningTextRef.current.style.opacity = '1';
            if (fishingBoxRef.current) fishingBoxRef.current.classList.add('danger-border');
        }

        // 魚の自律移動ロジック
        if (Math.random() < 0.02 * state.fish.difficulty) {
            state.fishTargetY = Math.random() * (CONTAINER_HEIGHT - FISH_SIZE);
            state.fishTargetX = Math.random() * (CONTAINER_WIDTH - FISH_SIZE);
        }
        const speed = state.fish.speed;

        // 縦移動
        if (state.fishY < state.fishTargetY) state.fishY += Math.random() * speed;
        if (state.fishY > state.fishTargetY) state.fishY -= Math.random() * speed;
        state.fishY = Math.max(0, Math.min(CONTAINER_HEIGHT - FISH_SIZE, state.fishY));

        // 横移動
        if (state.fishX < state.fishTargetX) state.fishX += Math.random() * (speed * 0.8);
        if (state.fishX > state.fishTargetX) state.fishX -= Math.random() * (speed * 0.8);
        state.fishX = Math.max(0, Math.min(CONTAINER_WIDTH - FISH_SIZE, state.fishX));

        // キャプチャーバー（浮きゲージ）の挙動 (Y軸)
        if (state.isReeling) state.barVelocity += 0.5;
        else state.barVelocity -= 0.4;

        state.barVelocity *= 0.9;
        state.barY += state.barVelocity;

        if (state.barY < 0) { state.barY = 0; state.barVelocity = 0; }
        if (state.barY > CONTAINER_HEIGHT - BAR_HEIGHT) {
            state.barY = CONTAINER_HEIGHT - BAR_HEIGHT;
            state.barVelocity = 0;
        }

        // キャプチャーバー（横軸追従）
        state.barX += (state.targetBarX - state.barX) * 0.3;
        state.barX = Math.max(0, Math.min(CONTAINER_WIDTH - BAR_WIDTH, state.barX));

        // 2D 判定
        const barBottom = state.barY;
        const barTop = state.barY + BAR_HEIGHT;
        const barLeft = state.barX;
        const barRight = state.barX + BAR_WIDTH;

        const fishCenterY = (CONTAINER_HEIGHT - state.fishY) - (FISH_SIZE / 2);
        const fishCenterX = state.fishX + (FISH_SIZE / 2);

        const isCatching = 
            (fishCenterY < barTop && fishCenterY > barBottom) &&
            (fishCenterX > barLeft && fishCenterX < barRight);

        // 捕獲プログレスの増減
        if (isCatching) {
            state.progress += 0.5;
            if (captureBarRef.current) captureBarRef.current.style.backgroundColor = "rgba(100, 255, 100, 0.4)";
        } else {
            state.progress -= 0.15;
            if (captureBarRef.current) captureBarRef.current.style.backgroundColor = "rgba(255, 100, 100, 0.4)";
        }

        if (state.progress < 0) state.progress = 0;
        if (state.progress >= 100) {
            stopGame(true, state.currentMarker);
            return;
        }

        // DOMの直接アップデート (React再描画による遅延を防ぐため)
        if (fishIconRef.current) {
            fishIconRef.current.style.top = `${state.fishY}px`;
            fishIconRef.current.style.left = `${state.fishX}px`;
        }
        if (captureBarRef.current) {
            captureBarRef.current.style.bottom = `${state.barY}px`;
            captureBarRef.current.style.left = `${state.barX}px`;
        }
        if (progressBarRef.current) {
            progressBarRef.current.style.height = `${state.progress}%`;
            if (state.progress > 80) progressBarRef.current.style.background = 'lime';
            else if (state.progress > 40) progressBarRef.current.style.background = 'yellow';
            else progressBarRef.current.style.background = 'red';
        }

        requestRef.current = requestAnimationFrame(gameLoop);
    }, [stopGame]);

    const startMiniGame = (fish: FishData, marker: L.Marker) => {
        gameState.current.fish = fish;
        gameState.current.currentMarker = marker;
        gameState.current.active = true;
        setCurrentFish(fish);

        resetGameState();

        gameState.current.startTime = Date.now();
        gameState.current.nextEscapeCheck = TIME_LIMIT + 3;

        setGameActive(true);

        requestRef.current = requestAnimationFrame(gameLoop);
    };

    // --- Effects ---
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'Space') gameState.current.isReeling = true;
        };
        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.code === 'Space') gameState.current.isReeling = false;
        };

        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('keyup', handleKeyUp);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    useEffect(() => {
        // コンポーネント破棄時にアニメーションフレームをキャンセル
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, []);

    return (
        <div className="relative w-full h-screen overflow-hidden">
            <style>{`
                /* カスタムCSSアニメーション（Tailwindでは書きづらいもの） */
                .danger-border { animation: blink-border 1s infinite; }
                @keyframes blink-border {
                    0% { border-color: #8b4513; }
                    50% { border-color: red; }
                    100% { border-color: #8b4513; }
                }
                .water-bg {
                    background: linear-gradient(to bottom, #4facfe 0%, #00f2fe 100%);
                }
            `}</style>

            {/* ゲーム選択画面へ戻るボタン (Mapの左上に固定) */}
            <div className="absolute top-4 left-4 z-[400]">
                <button
                    onClick={() => navigate('/')}
                    className="bg-white/90 px-4 py-2 rounded-full shadow-lg text-orange-600 font-bold hover:bg-orange-50 transition-colors"
                >
                    ◀ 戻る
                </button>
            </div>

            {/* Map コンテナ */}
            <div id="map" ref={mapRef} className="w-full h-full z-0"></div>

            {/* ゲーム中のオーバーレイ画面 */}
            {gameActive && (
                <div 
                    className="fixed inset-0 bg-black/85 z-[1000] flex flex-col items-center justify-center select-none touch-none"
                    onPointerDown={(e) => {
                        if ((e.target as HTMLElement).tagName === 'BUTTON') return;
                        gameState.current.isReeling = true;
                        if (fishingBoxRef.current) {
                            const rect = fishingBoxRef.current.getBoundingClientRect();
                            gameState.current.targetBarX = e.clientX - rect.left - (70 / 2);
                        }
                    }}
                    onPointerMove={(e) => {
                        if (!gameState.current.isReeling) return;
                        if (fishingBoxRef.current) {
                            const rect = fishingBoxRef.current.getBoundingClientRect();
                            gameState.current.targetBarX = e.clientX - rect.left - (70 / 2);
                        }
                    }}
                    onPointerUp={() => { gameState.current.isReeling = false; }}
                    onPointerCancel={() => { gameState.current.isReeling = false; }}
                >
                    {/* 閉じる（逃がす）ボタン */}
                    <button
                        onClick={() => {
                            gameState.current.active = false;
                            setGameActive(false);
                            resetGameState();
                        }}
                        className="absolute top-6 right-6 w-12 h-12 bg-white text-gray-800 rounded-full text-3xl font-bold flex items-center justify-center cursor-pointer shadow-lg hover:bg-gray-200 active:scale-90 select-none z-50"
                    >
                        ×
                    </button>

                    {/* 制限時間と警告文 */}
                    <div className="text-white mb-2 text-center pointer-events-none">
                        <div
                            ref={timerTextRef}
                            className="text-3xl font-bold mb-1 text-white drop-shadow-md"
                        >
                            残り {TIME_LIMIT} 秒
                        </div>
                        <p ref={warningTextRef} className="text-red-500 text-lg font-bold h-6 opacity-0 transition-opacity duration-500">
                            ⚠ 魚が警戒しています！
                        </p>
                    </div>

                    <div className="flex items-end pointer-events-none">
                        {/* 釣りゲージ全体像 */}
                        <div
                            ref={fishingBoxRef}
                            className="relative w-[300px] h-[400px] bg-[#2a2a2a] border-4 border-[#8b4513] rounded-lg overflow-hidden mr-5 transition-colors duration-500 pointer-events-auto"
                        >
                            <div className="water-bg absolute inset-0 opacity-30 pointer-events-none"></div>
                            <h2 className="absolute top-2 w-full text-center text-white/50 text-sm font-bold m-0 pointer-events-none">？？？</h2>
                            {/* 魚のアイコン */}
                            <div ref={fishIconRef} className="absolute w-[50px] h-[50px] pointer-events-none drop-shadow-lg flex justify-center items-center">
                                <img src="/fish_picture/fish_silhouette.png" alt="魚のシルエット" className="w-[120%] h-[120%] max-w-none object-contain drop-shadow" />
                            </div>
                            {/* キャプチャーバー（自機） */}
                            <div ref={captureBarRef} className="absolute w-[70px] h-[90px] bg-green-400/60 border-2 border-green-500 rounded-xl pointer-events-none box-border"></div>
                        </div>

                        {/* 進捗ゲージ */}
                        <div className="flex flex-col items-center h-[400px] justify-end pointer-events-none">
                            <div className="relative w-[30px] h-[400px] bg-gray-800 border-2 border-white rounded overflow-hidden">
                                <div ref={progressBarRef} className="absolute bottom-0 w-full h-0 bg-gradient-to-t from-red-500 via-yellow-400 to-green-500 transition-[height] duration-100 ease-linear tracking-[0]"></div>
                            </div>
                        </div>
                    </div>

                    {/* 操作ガイド */}
                    <p className="text-gray-300 mt-6 text-center text-sm md:text-base pointer-events-none font-medium leading-relaxed">
                        👆 画面を<span className="font-bold text-white">長押し</span>すると上に引き上げます<br />
                        👈 指を左右に<span className="font-bold text-white">スワイプ</span>すると枠が横に動きます 👉
                    </p>
                </div>
            )}

            {/* 結果画面のオーバーレイ */}
            {resultActive && (
                <div className="fixed inset-0 bg-black/85 z-[2000] flex items-center justify-center">
                    <div className="bg-white p-8 rounded-2xl text-center max-w-[80%] w-[320px] shadow-2xl">
                        <img
                            src={isSuccess && currentFish ? currentFish.image : ESCAPE_IMAGE}
                            alt="結果画像"
                            className="w-full h-[200px] object-contain mb-4 rounded-lg bg-gray-100"
                        />
                        <div className="text-gray-800 text-2xl font-bold mb-6">
                            {isSuccess && currentFish ? `${currentFish.name}を釣り上げた！` : "魚を逃がしてしまった..."}
                        </div>
                        <button
                            onClick={() => setResultActive(false)}
                            className="px-10 py-3 text-lg bg-green-500 text-white rounded-full font-bold shadow hover:bg-green-600 active:bg-green-700 active:translate-y-1"
                        >
                            閉じる
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
