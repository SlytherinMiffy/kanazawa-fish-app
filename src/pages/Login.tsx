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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
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
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-sm font-bold text-blue-500 hover:text-blue-700 hover:underline disabled:opacity-50 transition-colors mt-2"
                            disabled={isLoading}
                        >
                            {isLogin ? 'アカウントをお持ちでない方はこちら' : 'すでにアカウントをお持ちの方はこちら'}
                        </button>
                    </div>
                </form>
            </div>
            
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
