import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera as CameraIcon, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import jsQR from 'jsqr';

// Python版から移植した店舗データマスター
const SHOP_NAMES: Record<string, string> = {
    "001": "魚菜屋 魚がし食堂 中央市場店", "002": "のどぐろ丼専門店 あえのこと",
    "003": "廻る寿し ぽん太", "004": "かいてん寿し 大倉",
    "005": "高崎屋寿し", "006": "麺屋 大河",
    "007": "麺屋吉宗", "008": "らーめん 一心屋",
    "009": "赤玉 本店", "010": "スペイン料理 アロス",
    "011": "ヤマト醤油味噌 糀", "012": "石丸食品",
    "013": "味の十字屋", "014": "佃の佃煮",
    "015": "芝寿し 保古店", "016": "金沢浅田屋 金沢百番街店",
    "017": "手押し棒鮨 舟楽 近江町本店", "018": "油与商店",
    "019": "味百珍かさい", "020": "近江町コロッケ"
};

export function Scanner() {
    const navigate = useNavigate();
    const { user, addPointsAndStamp } = useAuth();
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // カメラの許可状態やエラー
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [errorMessage, setErrorMessage] = useState<string>('');

    // シャッター後の画像保持やステータス
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    
    // QR読み取り結果
    const [scanStatus, setScanStatus] = useState<'success' | 'already_visited' | 'invalid' | 'error' | null>(null);
    const [shopName, setShopName] = useState<string>('');

    // カメラの起動処理
    useEffect(() => {
        let stream: MediaStream | null = null;

        const startCamera = async () => {
            try {
                // 背面カメラ(environment)を優先して起動
                stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'environment' }
                });

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
                setHasPermission(true);
            } catch (err: any) {
                console.error("Camera access error:", err);
                setHasPermission(false);
                setErrorMessage(err.name === 'NotAllowedError'
                    ? "カメラへのアクセスがブロックされています。ブラウザの設定からカメラの許可を行ってください。"
                    : "カメラが見つからないか、起動に失敗しました。");
            }
        };

        startCamera();

        // コンポーネント破棄時にカメラストリームを停止する
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    // 撮影ボタン処理
    const handleCapture = () => {
        if (!videoRef.current || !canvasRef.current || isProcessing) return;

        setIsProcessing(true);
        const video = videoRef.current;
        const canvas = canvasRef.current;

        // ビデオの解像度に合わせてCanvasサイズを設定
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // 現在のビデオフレームをCanvasに描画してDataURL（画像文字列）として取得
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageUrl = canvas.toDataURL('image/jpeg', 0.8);
            
            // 画像データを取得してjsQRで解析
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
                inversionAttempts: "dontInvert"
            });

            // 本物っぽさを出すための意図的なラグ（UX向上）
            setTimeout(async () => {
                setCapturedImage(imageUrl);
                setIsProcessing(false);

                if (code) {
                    try {
                        const data = JSON.parse(code.data);
                        
                        // 対象アプリのQRかチェック
                        if (data.app === "gyotuu" && data.shop_id) {
                            const shopId = data.shop_id;
                            const currentShopName = SHOP_NAMES[shopId] || "不明な店舗";
                            setShopName(currentShopName);
                            
                            // すでに訪問済みかチェック
                            const hasVisited = user?.stamps?.includes(currentShopName);
                            
                            if (hasVisited) {
                                setScanStatus('already_visited');
                            } else {
                                // 新規訪問！スタンプとポイント付与
                                setScanStatus('success');
                                // 仮で 一律100pt 付与とします
                                await addPointsAndStamp(100, currentShopName);
                            }
                        } else {
                            // 無効な形式
                            setScanStatus('invalid');
                        }
                    } catch (e) {
                        // JSONパースエラー
                        setScanStatus('error');
                    }
                } else {
                    // QRが見つからなかった
                    setScanStatus('error');
                }
            }, 800);
        } else {
            setIsProcessing(false);
        }
    };

    // 再撮影
    const handleRetry = () => {
        setCapturedImage(null);
        setScanStatus(null);
        setShopName('');
    };

    return (
        <div className="min-h-screen bg-gray-900 flex flex-col font-sans max-w-md mx-auto relative overflow-hidden">

            {/* ライブカメラ映像エリア */}
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="absolute inset-0 w-full h-full object-cover z-0"
            />
            {/* 非表示のCanvas (撮影切り出し用) */}
            <canvas ref={canvasRef} className="hidden" />

            {/* 視認性向上のための暗いオーバーレイ */}
            <div className="absolute inset-0 bg-gray-900/30 pointer-events-none z-0"></div>

            {/* メインコンテンツ */}
            <div className="flex-1 flex flex-col z-10 p-6">

                {/* ヘッダーテキスト */}
                <div className="text-center mt-8 mb-auto">
                    <h1 className="text-white text-xl font-bold tracking-wider drop-shadow-lg">
                        {capturedImage ? "スキャン完了！" : "スタンプをフレームに収めてください"}
                    </h1>
                    <p className="text-gray-200 text-sm mt-3 drop-shadow-md bg-black/40 inline-block px-4 py-1 rounded-full backdrop-blur-sm border border-white/20">
                        {capturedImage ? "スタンプの獲得に成功しました" : "カメラで対象を自動分析します"}
                    </p>
                </div>

                {/* エラー時の表示 */}
                {hasPermission === false && (
                    <div className="bg-red-500/80 backdrop-blur-sm text-white p-5 rounded-2xl m-4 text-center shadow-xl border border-red-400">
                        <AlertCircle className="mx-auto mb-3" size={36} />
                        <p className="font-bold text-lg mb-1">カメラエラー</p>
                        <p className="text-sm opacity-90">{errorMessage}</p>
                    </div>
                )}

                {/* スキャン照準 or 撮影結果 */}
                {!capturedImage ? (
                    <div className="relative w-80 h-80 max-w-[85vw] max-h-[85vw] aspect-square mx-auto mb-auto pointer-events-none transition-all duration-300 overflow-hidden rounded-3xl">
                        {/* 四角形の枠 (QR読み取り用) */}
                        <div className="absolute inset-0 border-4 border-white/80 rounded-3xl shadow-[inset_0_0_15px_rgba(255,255,255,0.4),0_0_15px_rgba(255,255,255,0.7)] z-10 box-border pointer-events-none">
                            {/* QRコード風のコーナー用の角飾り（オプションで追加すると本格的になります） */}
                            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-teal-400 rounded-tl-2xl"></div>
                            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-b-0 border-r-4 border-teal-400 rounded-tr-2xl"></div>
                            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-teal-400 rounded-bl-2xl"></div>
                            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-teal-400 rounded-br-2xl"></div>
                        </div>

                        {/* スキャンアニメーションライン */}
                        {hasPermission && !isProcessing && (
                            <div className="absolute top-0 left-0 right-0 h-1 bg-teal-400 shadow-[0_0_20px_rgba(45,212,191,1)] animate-[scan_2s_ease-in-out_infinite] w-full z-0"></div>
                        )}

                        {/* スキャン中（処理中）のローディング表示 */}
                        {isProcessing && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-3xl backdrop-blur-md">
                                <div className="text-teal-400 font-bold animate-pulse flex flex-col items-center">
                                    <CameraIcon className="animate-bounce mb-3" size={40} />
                                    <span className="tracking-widest">QR読取中...</span>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="mx-auto mb-auto bg-white/90 backdrop-blur-lg p-5 rounded-3xl shadow-2xl transform transition-all duration-500 scale-100 flex flex-col items-center border border-white">
                        {/* 撮影結果の画像 */}
                        <img
                            src={capturedImage}
                            alt="Captured"
                            className="w-72 h-72 max-w-[80vw] max-h-[80vw] aspect-square object-cover rounded-2xl border-4 border-teal-50 shadow-inner"
                        />
                        <div className="mt-6 flex flex-col items-center w-full text-center">
                            {scanStatus === 'success' && (
                                <>
                                    <div className="bg-gradient-to-tr from-emerald-400 to-teal-500 p-3 rounded-full shadow-lg mb-3 -mt-12 border-4 border-white">
                                        <CheckCircle size={44} className="text-white drop-shadow-sm" />
                                    </div>
                                    <h2 className="text-2xl font-black text-gray-800 tracking-tight">新規チェックイン！</h2>
                                    <p className="text-gray-700 font-bold mt-2 border-b-2 border-teal-300 pb-1">{shopName}</p>
                                    <p className="text-teal-600 font-bold text-lg bg-teal-50 px-4 py-1 rounded-full mt-3 border border-teal-100">100 ポイント獲得</p>
                                </>
                            )}
                            
                            {scanStatus === 'already_visited' && (
                                <>
                                    <div className="bg-gradient-to-tr from-amber-400 to-orange-500 p-3 rounded-full shadow-lg mb-3 -mt-12 border-4 border-white">
                                        <Info size={44} className="text-white drop-shadow-sm" />
                                    </div>
                                    <h2 className="text-2xl font-black text-gray-800 tracking-tight">訪問済みです</h2>
                                    <p className="text-gray-700 font-bold mt-2 border-b-2 border-amber-300 pb-1">{shopName}</p>
                                    <p className="text-amber-700 font-medium text-sm mt-3 bg-amber-50 px-3 py-1 rounded-md">こちらは既にスタンプを獲得した店舗です。</p>
                                </>
                            )}
                            
                            {(scanStatus === 'invalid' || scanStatus === 'error') && (
                                <>
                                    <div className="bg-gradient-to-tr from-red-400 to-rose-500 p-3 rounded-full shadow-lg mb-3 -mt-12 border-4 border-white">
                                        <AlertCircle size={44} className="text-white drop-shadow-sm" />
                                    </div>
                                    <h2 className="text-xl font-black text-gray-800 tracking-tight">QRを認識できませんでした</h2>
                                    <p className="text-rose-600 font-medium text-sm mt-3 bg-rose-50 px-3 py-1 rounded-md">
                                        {scanStatus === 'invalid' ? 'このQRコードはスタンプラリー用ではありません。' : 'QRコードが見つからないか、データが破損しています。'}
                                    </p>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* 下部コントローラー */}
                <div className="mt-auto flex flex-col items-center pb-8 gap-5 px-6">

                    {/* シャッターボタン or 再撮影ボタン */}
                    {!capturedImage ? (
                        <button
                            onClick={handleCapture}
                            disabled={!hasPermission || isProcessing}
                            className={`w-20 h-20 rounded-full border-[3px] border-white/80 flex flex-col justify-center items-center backdrop-blur-sm transition-all shadow-[0_0_30px_rgba(0,0,0,0.5)] ${!hasPermission || isProcessing ? 'opacity-40' : 'hover:scale-105 active:scale-95 bg-black/20'
                                }`}
                        >
                            <div className="w-[60px] h-[60px] bg-white rounded-full shadow-inner flex items-center justify-center pointer-events-none transition-transform group-active:scale-90">
                                <CameraIcon className="text-gray-800" size={30} />
                            </div>
                        </button>
                    ) : (
                        <button
                            onClick={handleRetry}
                            className="bg-white/95 backdrop-blur-sm text-teal-700 w-full py-4 rounded-full font-bold shadow-xl text-lg hover:bg-white active:scale-95 transition-all outline-none border border-white"
                        >
                            もう一度スキャンする
                        </button>
                    )}

                    <button
                        onClick={() => navigate('/')}
                        className="text-white font-bold opacity-80 hover:opacity-100 transition-opacity drop-shadow-md py-2 px-6"
                    >
                        ホームに戻る
                    </button>
                </div>
            </div>
        </div>
    );
}
