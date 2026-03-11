import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface UserData {
    username?: string;
    points?: number;
    stamps?: string[];
}

// Combine Firebase User with our custom data
export type User = FirebaseUser & UserData;

interface AuthContextType {
    user: User | null;
    loading: boolean;
    isAuthenticated: boolean;
    addPointsAndStamp: (points: number, stamp: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                // 1. まずFirebase Authの基本情報だけでユーザーをセットし、即座にローディングを解除（体感速度UP）
                setUser(currentUser as User);
                setLoading(false);

                // 2. その後、Firestoreからの追加データ（ポイントやスタンプ）を非同期で取得してマージする
                const fetchUserData = async () => {
                    try {
                        const userDocRef = doc(db, "users", currentUser.uid);
                        const userSnapshot = await getDoc(userDocRef);

                        if (userSnapshot.exists()) {
                            const data = userSnapshot.data() as UserData;
                            setUser(prev => prev ? { ...prev, ...data } : null);
                        }
                    } catch (error) {
                        console.error("Error fetching user data:", error);
                    }
                };
                
                fetchUserData();
            } else {
                setUser(null);
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    const addPointsAndStamp = async (pointsToAdd: number, stamp: string) => {
        if (!user) return;

        const currentStamps = user.stamps || [];
        const isNewStamp = !currentStamps.includes(stamp);
        const newStamps = isNewStamp ? [...currentStamps, stamp] : currentStamps;
        const newPoints = (user.points || 0) + pointsToAdd;

        // ローカルステートを即座に更新
        setUser({ ...user, points: newPoints, stamps: newStamps });

        // Firestoreを更新
        try {
            const userDocRef = doc(db, "users", user.uid);
            await setDoc(userDocRef, { points: newPoints, stamps: newStamps }, { merge: true });
        } catch (error) {
            console.error("Error updating points and stamps:", error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, isAuthenticated: !!user, addPointsAndStamp }}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
