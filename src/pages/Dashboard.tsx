import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

export function Dashboard() {
    const { user } = useAuth();

    const handleLogout = () => {
        signOut(auth);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow p-4 flex justify-between items-center">
                <h1 className="text-xl font-bold text-blue-600">金沢おさかなアプリ</h1>
                <div className="flex items-center gap-4">
                    <span className="font-medium text-gray-700">
                        ようこそ, {user?.username || user?.displayName} さん
                    </span>
                    <Button variant="secondary" onClick={handleLogout} className="text-sm">
                        ログアウト
                    </Button>
                </div>
            </nav>

            <main className="p-6 max-w-4xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                </div>
            </main>
        </div>
    );
}
