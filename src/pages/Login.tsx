import React, { useState } from 'react';
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Loader2 } from 'lucide-react'; // Added loading icon

export function Login() {
    const [isLogin, setIsLogin] = useState(true);
    const [isLoading, setIsLoading] = useState(false); // Added loading state
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [showTermsModal, setShowTermsModal] = useState(false);
    const [showPrivacyModal, setShowPrivacyModal] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!isLogin && !agreedToTerms) {
            setError('利用規約および個人情報の取り扱いに同意してください。');
            return;
        }

        setIsLoading(true); // Start loading

        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;

                // Update Profile
                await updateProfile(user, { displayName: username });

                // Create User Document in Firestore
                await setDoc(doc(db, "users", user.uid), {
                    username: username,
                    email: email,
                    createdAt: new Date().toISOString()
                });
            }

            // NOTE: Do not set isLoading(false) on success.
            // Let the AuthContext take over and unmount this Login component.
        } catch (err: any) {
            console.error(err);
            if (err.code === 'auth/invalid-credential') {
                setError('メールアドレスまたはパスワードが間違っています。');
            } else if (err.code === 'auth/email-already-in-use') {
                setError('このメールアドレスは既に登録されています。');
            } else if (err.code === 'auth/weak-password') {
                setError('パスワードは6文字以上で設定してください。');
            } else {
                setError('エラーが発生しました: ' + err.message);
            }
            setIsLoading(false); // Only end loading on error
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-200 via-cyan-100 to-blue-50 relative overflow-hidden p-4 font-sans">
            {/* Background Decorative Circles */}
            <div className="absolute top-[-5%] left-[-5%] w-96 h-96 bg-cyan-400 opacity-40 rounded-full blur-[80px] pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-400 opacity-30 rounded-full blur-[100px] pointer-events-none"></div>

            {/* Main Glass Card */}
            <div className="bg-white/85 backdrop-blur-xl p-8 sm:p-10 rounded-[32px] shadow-[0_8px_32px_rgba(0,0,0,0.2)] border border-white/50 w-full max-w-md relative z-10 flex flex-col items-center animate-fade-in-up">

                {/* Logo */}
                <div className="relative mb-6 flex justify-center w-full">
                    <div className="absolute inset-0 bg-cyan-400 blur-[50px] opacity-20 rounded-full scale-110 pointer-events-none"></div>
                    <img
                        src="/fish_picture/rogo.png"
                        alt="石川魚通ガイド アイコン"
                        className="w-40 h-40 sm:w-56 sm:h-56 object-contain drop-shadow-xl relative z-10 transition-transform hover:scale-105 duration-500"
                    />
                </div>

                {/* App Title & Greeting */}
                <div className="text-center mb-8 w-full">
                    <span className="text-[12px] font-extrabold text-cyan-600 tracking-[0.2em] leading-none mb-2 block opacity-90">KANAZAWA FISH GUIDE</span>
                    <h1 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-br from-blue-900 via-blue-600 to-cyan-500 tracking-tighter drop-shadow-sm leading-tight mb-3">
                        石川魚通ガイド
                    </h1>
                    <div className="h-px w-16 bg-gradient-to-r from-transparent via-blue-300 to-transparent mx-auto mb-3"></div>
                    <p className="text-gray-600 text-sm font-bold tracking-wide">
                        {isLogin ? 'おかえりなさい！' : 'アカウントを作成して始めよう'}
                    </p>
                </div>

                {error && (
                    <div className="w-full bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm break-words shadow-sm flex items-center gap-2">
                        <span className="font-bold flex-shrink-0">⚠</span>
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="w-full">
                    {!isLogin && (
                        <Input
                            label="ユーザー名"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            placeholder="例: kanazawa_taro"
                            disabled={isLoading}
                        />
                    )}
                    <Input
                        label="メールアドレス"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="example@email.com"
                        disabled={isLoading}
                    />
                    <Input
                        label="パスワード"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="********"
                        disabled={isLoading}
                    />

                    {!isLogin && (
                        <div className="flex items-center gap-2 mt-4 ml-1">
                            <input
                                type="checkbox"
                                id="terms"
                                checked={agreedToTerms}
                                onChange={(e) => setAgreedToTerms(e.target.checked)}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer shrink-0"
                                disabled={isLoading}
                            />
                            <label htmlFor="terms" className="text-sm text-gray-700 font-bold cursor-pointer select-none leading-relaxed">
                                <button type="button" className="text-blue-600 hover:text-blue-800 hover:underline" onClick={(e) => { e.stopPropagation(); setShowTermsModal(true); }}>利用規約</button>
                                および
                                <button type="button" className="text-blue-600 hover:text-blue-800 hover:underline" onClick={(e) => { e.stopPropagation(); setShowPrivacyModal(true); }}>個人情報の取り扱い</button>
                                に同意する
                            </label>
                        </div>
                    )}

                    <div className="flex flex-col gap-4 mt-8">
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white border-none rounded-full py-3.5 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all duration-300 text-lg tracking-wider font-extrabold"
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <Loader2 className="animate-spin" size={20} />
                                    {isLogin ? 'ログイン中...' : 'アカウント作成中...'}
                                </span>
                            ) : (
                                isLogin ? 'ログイン' : '登録する'
                            )}
                        </Button>

                        <button
                            type="button"
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setError('');
                            }}
                            className="text-sm font-bold text-blue-500 hover:text-blue-700 hover:underline disabled:opacity-50 transition-colors mt-2"
                            disabled={isLoading}
                        >
                            {isLogin ? 'アカウントをお持ちでない方はこちら' : 'すでにアカウントをお持ちの方はこちら'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Terms of Service Modal */}
            {showTermsModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm transition-opacity">
                    <div className="bg-white rounded-2xl p-6 md:p-8 max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl animate-fade-in-up">
                        <div className="flex justify-between items-center mb-6 border-b pb-4">
                            <h2 className="text-xl md:text-2xl font-black text-gray-800 tracking-tight">利用規約</h2>
                            <button onClick={() => setShowTermsModal(false)} className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors">
                                ✕
                            </button>
                        </div>
                        <div className="space-y-6 text-gray-700 text-sm md:text-base leading-relaxed">
                            <div>
                                <h3 className="font-bold text-lg mb-2 text-blue-800">第1条（適用）</h3>
                                <p>本規約は、ユーザーと 運営者（以下、「運営者」）との間の、金沢魚通ガイド（以下、「本サービス」）の利用に関わる一切の関係に適用されるものとします。</p>
                            </div>
                            <div>
                                <h3 className="font-bold text-lg mb-2 text-blue-800">第2条（利用登録とアカウント管理）</h3>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li>ユーザーは、本規約に同意の上、運営者が定める方法によって利用登録を行うものとします。</li>
                                    <li>ユーザーは、登録したメールアドレスおよびパスワードの管理責任を負うものとします。</li>
                                    <li>ユーザーは、いかなる場合にも、アカウントを第三者に譲渡または貸与することはできません。</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-bold text-lg mb-2 text-blue-800">第3条（禁止事項）</h3>
                                <p className="mb-2">ユーザーは、本サービスの利用にあたり、以下の行為をしてはなりません。</p>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li>法令または公序良俗に違反する行為</li>
                                    <li>本サービスのサーバーやネットワークの機能を破壊したり、妨害したりする行為</li>
                                    <li>他のユーザーに関する個人情報等を収集または蓄積する行為</li>
                                    <li>不正アクセスをし、またはこれを試みる行為</li>
                                    <li>その他、運営者が不適切と判断する行為</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-bold text-lg mb-2 text-blue-800">第4条（免責事項）</h3>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li>運営者は、本サービスに事実上または法律上の瑕疵（安全性、信頼性、正確性、有効性、セキュリティなどに関する欠陥、エラーやバグなどを含みます）がないことを明示的にも黙示的にも保証しておりません。</li>
                                    <li>運営者は、本サービスに起因してユーザーに生じたあらゆる損害について一切の責任を負いません。</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-bold text-lg mb-2 text-blue-800">第5条（サービス内容の変更等）</h3>
                                <p>運営者は、ユーザーに通知することなく、本サービスの内容を変更しまたは本サービスの提供を中止することができるものとし、これによってユーザーに生じた損害について一切の責任を負いません。</p>
                            </div>
                        </div>
                        <div className="mt-8 pt-4 border-t flex justify-end">
                            <Button onClick={() => setShowTermsModal(false)} className="px-6 py-2 bg-gray-200 text-gray-800 hover:bg-gray-300 font-bold rounded-xl border-none">閉じる</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Privacy Policy Modal */}
            {showPrivacyModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm transition-opacity">
                    <div className="bg-white rounded-2xl p-6 md:p-8 max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl animate-fade-in-up">
                        <div className="flex justify-between items-center mb-6 border-b pb-4">
                            <h2 className="text-xl md:text-2xl font-black text-gray-800 tracking-tight">プライバシーポリシー（個人情報の取り扱い）</h2>
                            <button onClick={() => setShowPrivacyModal(false)} className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors">
                                ✕
                            </button>
                        </div>
                        <div className="space-y-6 text-gray-700 text-sm md:text-base leading-relaxed">
                            <div>
                                <h3 className="font-bold text-lg mb-2 text-teal-700">1. 取得する個人情報</h3>
                                <p className="mb-2">本サービスでは、アカウント登録および本人確認のため、以下の情報を取得します。</p>
                                <ul className="list-disc pl-5 space-y-1">
                                    <li>メールアドレス</li>
                                    <li>パスワード（暗号化して保存されます）</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-bold text-lg mb-2 text-teal-700">2. 利用目的</h3>
                                <p className="mb-2">取得した個人情報は、以下の目的でのみ利用いたします。</p>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li>本サービスの提供・運営のため</li>
                                    <li>ユーザーからのお問い合わせに回答するため</li>
                                    <li>規約違反や不正・不当な目的でサービスを利用しようとするユーザーの特定をし、ご利用をお断りするため</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-bold text-lg mb-2 text-teal-700">3. 個人情報の第三者提供</h3>
                                <p className="mb-2">運営者は、次に掲げる場合を除いて、あらかじめユーザーの同意を得ることなく、第三者に個人情報を提供することはありません。</p>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li>法令に基づく場合</li>
                                    <li>人の生命、身体または財産の保護のために必要がある場合であって、本人の同意を得ることが困難であるとき</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-bold text-lg mb-2 text-teal-700">4. セキュリティについて</h3>
                                <p>ユーザーのパスワードは安全なハッシュ関数を用いて暗号化された上でサーバーに保存され、運営者であっても元のパスワードを閲覧することはできません。</p>
                            </div>
                            <div>
                                <h3 className="font-bold text-lg mb-2 text-teal-700">5. お問い合わせ窓口</h3>
                                <p className="mb-2">本ポリシーに関するお問い合わせは、下記の窓口までお願いいたします。</p>
                                <p className="bg-gray-50 p-3 rounded-lg border">連絡先：c1504491@st.kanazawa-it.ac.jp</p>
                            </div>
                        </div>
                        <div className="mt-8 pt-4 border-t flex justify-end">
                            <Button onClick={() => setShowPrivacyModal(false)} className="px-6 py-2 bg-gray-200 text-gray-800 hover:bg-gray-300 font-bold rounded-xl border-none">閉じる</Button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .animate-fade-in-up {
                    animation: fadeInUp 0.6s ease-out forwards;
                }
                @keyframes fadeInUp {
                    0% {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    100% {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div>
    );
}
