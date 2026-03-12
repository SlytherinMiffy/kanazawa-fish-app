import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';

interface ChatMessage {
    id: number;
    text: string;
    sender: 'user' | 'fisher';
}

export function Chat() {
    const navigate = useNavigate();
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([
        { id: 1, text: '金沢市内の鮮魚店・飲食店をご紹介します。', sender: 'fisher' }
    ]);

    const handleSend = async (textOrEvent?: string | React.MouseEvent | React.KeyboardEvent) => {
        const messageToProcess = typeof textOrEvent === 'string' ? textOrEvent : inputText;
        if (!messageToProcess.trim() || isLoading) return;

        // ユーザーのメッセージを追加
        const newUserMsg: ChatMessage = { id: Date.now(), text: messageToProcess, sender: 'user' };
        setMessages(prev => [...prev, newUserMsg]);
        if (typeof textOrEvent !== 'string') setInputText('');
        setIsLoading(true);

        try {
            // ローカルLLMのOpenAI互換APIエンドポイント
            const response = await fetch('http://localhost:1234/v1/chat/completions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [
                        { role: 'system', content: '' },
                        ...messages.map(m => ({
                            role: m.sender === 'user' ? 'user' : 'assistant',
                            content: m.text
                        })),
                        { role: 'user', content: messageToProcess }
                    ],
                    temperature: 0.7,
                    max_tokens: 500
                })
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            const data = await response.json();
            const replyText = data.choices[0].message.content;

            const fisherMsg: ChatMessage = {
                id: Date.now(),
                text: replyText || '（返答が空でした）',
                sender: 'fisher'
            };
            setMessages(prev => [...prev, fisherMsg]);
        } catch (error) {
            console.error('LLM Fetch Error:', error);
            const errorMsg: ChatMessage = {
                id: Date.now(),
                text: '（通信エラー: ローカルLLMに接続できませんでした。サーバーがポート1234等で起動しているか確認してくれ！）',
                sender: 'fisher'
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[100dvh] bg-slate-50 flex flex-col font-sans max-w-lg mx-auto relative shadow-2xl overflow-hidden">
            {/* Header (Premium Gradient & Glassmorphism) */}
            <header className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white p-4 flex items-center gap-4 sticky top-0 z-20 shadow-lg rounded-b-3xl">
                <button
                    onClick={() => navigate('/')}
                    className="hover:bg-white/20 p-2 rounded-full transition-all duration-300 backdrop-blur-sm group"
                >
                    <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
                </button>
                <div className="relative">
                    {/* Avatar larger */}
                    <div className="w-20 h-20 bg-[#D7E3E5] rounded-full flex items-center justify-center overflow-hidden border-4 border-white/90 shadow-[0_0_15px_rgba(0,0,0,0.2)] shrink-0 relative z-10">
                        <img src="/fish_picture/Concierge.png" alt="コンシェルジュ" className="w-[145%] h-[145%] max-w-none object-cover" />
                    </div>
                </div>
                <div className="flex flex-col justify-center">
                    <h1 className="text-xl font-extrabold tracking-wide drop-shadow-md">漁通コンシェルジュ</h1>
                </div>
            </header>

            {/* Chat Area */}
            <main className="flex-1 p-4 overflow-y-auto flex flex-col gap-5 pb-28 scroll-smooth overflow-x-hidden">
                {messages.map(msg => (
                    <div key={msg.id} className={`flex gap-3 max-w-[90%] ${msg.sender === 'user' ? 'self-end flex-row-reverse' : 'self-start'}`}>
                        {msg.sender === 'fisher' && (
                            <div className="w-14 h-14 rounded-full bg-[#D7E3E5] shrink-0 flex items-center justify-center border-2 border-white shadow-[0_2px_8px_rgba(0,0,0,0.1)] overflow-hidden self-end mb-1">
                                <img src="/fish_picture/Concierge.png" alt="コンシェルジュ" className="w-[145%] h-[145%] max-w-none object-cover" />
                            </div>
                        )}
                        <div className={`p-4 rounded-3xl shadow-sm relative ${msg.sender === 'user'
                            ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-br-sm'
                            : 'bg-white text-gray-800 rounded-bl-sm border border-gray-100/50 shadow-[0_4px_15px_rgba(0,0,0,0.03)]'
                            }`}>
                            <p className="text-[15px] leading-relaxed whitespace-pre-wrap font-medium">{msg.text}</p>
                        </div>
                    </div>
                ))}

                {/* ローディング表示 */}
                {isLoading && (
                    <div className="flex gap-3 max-w-[90%] self-start animate-fade-in">
                        <div className="w-14 h-14 rounded-full bg-[#D7E3E5] shrink-0 flex items-center justify-center border-2 border-white shadow-[0_2px_8px_rgba(0,0,0,0.1)] overflow-hidden self-end mb-1">
                            <img src="/fish_picture/Concierge.png" alt="コンシェルジュ" className="w-[145%] h-[145%] max-w-none object-cover" />
                        </div>
                        <div className="p-4 rounded-3xl shadow-sm bg-white text-gray-800 rounded-bl-sm border border-gray-100/50 shadow-[0_4px_15px_rgba(0,0,0,0.03)] flex items-center gap-1.5 h-[52px] my-auto">
                            <div className="w-2.5 h-2.5 bg-indigo-400 rounded-full animate-bounce"></div>
                            <div className="w-2.5 h-2.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                            <div className="w-2.5 h-2.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                        </div>
                    </div>
                )}
            </main>

            {/* Input Area (Floating Glassmorphism) */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-50 via-slate-50/90 to-transparent">

                {/* 質問提案チップ */}
                {messages.length === 1 && (
                    <div
                        className="flex overflow-x-auto gap-2 mb-3 pb-1 -mx-2 px-2 [&::-webkit-scrollbar]:hidden"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {['おすすめの鮮魚市場を教えて', '朝食が食べられる場所は？', '寿司レストランを探しています', '市場の営業時間は？'].map((suggestion, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleSend(suggestion)}
                                disabled={isLoading}
                                className="shrink-0 bg-white/95 backdrop-blur-md border border-gray-200/80 shadow-sm px-4 py-2 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50"
                            >
                                {suggestion}
                            </button>
                        ))}
                    </div>
                )}

                <div className="bg-white/80 backdrop-blur-xl border border-white/60 p-2 rounded-full flex items-center gap-2 shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
                    <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="メッセージを入力..."
                        className="flex-1 bg-transparent border-none px-4 py-3 text-[15px] text-gray-700 focus:outline-none placeholder-gray-400 font-medium"
                    />
                    <button
                        onClick={handleSend}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white w-12 h-12 rounded-full hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center justify-center shrink-0 disabled:opacity-50 disabled:hover:scale-100 disabled:shadow-none"
                        disabled={!inputText.trim() || isLoading}
                    >
                        <Send size={20} className="mr-0.5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
