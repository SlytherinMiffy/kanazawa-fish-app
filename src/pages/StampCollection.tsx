import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Award, Star, Image as ImageIcon, Camera } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function StampCollection() {
    const navigate = useNavigate();
    const { user } = useAuth();

    // ユーザーが獲得したスタンプ
    const acquiredStamps = user?.stamps || [];

    // 金沢周辺で集められるスタンプの実データ（20店舗）
    const allStampsData = Object.entries({
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
    }).map(([id, name]) => ({
        id,
        name,
        icon: name.includes('寿し') || name.includes('鮨') ? '🍣' : 
              name.includes('麺') || name.includes('らーめん') ? '🍜' : '🐟'
    }));

    return (
        <div className="min-h-[100dvh] bg-slate-50 font-sans max-w-lg mx-auto shadow-2xl overflow-hidden flex flex-col relative">
            {/* Header */}
            <header className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-4 flex items-center gap-4 sticky top-0 z-20 shadow-md">
                <button
                    onClick={() => navigate('/')}
                    className="hover:bg-white/20 p-2 rounded-full transition-all duration-300"
                >
                    <ArrowLeft size={24} />
                </button>
                <div className="flex items-center gap-2">
                    <Award size={26} className="text-emerald-100" />
                    <h1 className="text-xl font-bold tracking-wide">獲得スタンプ一覧</h1>
                </div>
            </header>

            {/* Status overview */}
            <div className="bg-white px-6 py-5 border-b border-gray-100 shadow-sm z-10">
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-xs text-gray-500 font-medium mb-1">現在のポイント</p>
                        <div className="flex items-end gap-1 text-amber-500">
                            <Star size={24} className="fill-amber-400 mb-0.5" />
                            <span className="text-2xl font-black leading-none">{user?.points || 0} <span className="text-base font-bold text-gray-400">pt</span></span>
                        </div>
                    </div>
                    <div className="w-px h-10 bg-gray-200"></div>
                    <div>
                        <p className="text-xs text-gray-500 font-medium mb-1">獲得スタンプ数</p>
                        <div className="flex items-end gap-1 text-emerald-500">
                            <Award size={24} className="mb-0.5" />
                            <span className="text-2xl font-black leading-none">{acquiredStamps.length} <span className="text-base font-bold text-gray-400">/ {allStampsData.length}</span></span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stamps Grid */}
            <main className="flex-1 p-5 overflow-y-auto pb-8">
                <div className="grid grid-cols-2 gap-4">
                    {allStampsData.map(stamp => {
                        const isAcquired = acquiredStamps.includes(stamp.name);
                        return (
                            <div
                                key={stamp.id}
                                className={`relative rounded-3xl p-4 flex flex-col items-center justify-center gap-3 text-center transition-all ${isAcquired
                                    ? 'bg-white shadow-[0_8px_20px_rgba(0,0,0,0.06)] border border-emerald-100'
                                    : 'bg-gray-100 border-2 border-dashed border-gray-300 opacity-60'
                                    }`}
                            >
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-inner ${isAcquired ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-200 grayscale opacity-50'
                                    }`}>
                                    {isAcquired ? stamp.icon : <ImageIcon size={24} className="text-gray-400" />}
                                </div>
                                <div>
                                    <h3 className={`font-bold text-sm ${isAcquired ? 'text-gray-800' : 'text-gray-500'}`}>{stamp.name}</h3>
                                    {isAcquired && (
                                        <div className="mt-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full inline-block">
                                            獲得済み
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-8 text-center">
                    <Link to="/scanner" className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-3 rounded-full font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                        <Camera size={20} />
                        カメラで新しいスタンプを探す
                    </Link>
                </div>
            </main>
        </div>
    );
}
