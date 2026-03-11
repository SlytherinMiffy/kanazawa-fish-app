import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './pages/Login';
import { Home } from './pages/Home';
import { Chat } from './pages/Chat';
import { Scanner } from './pages/Scanner';
import { Game } from './pages/Game';
import { GameSelect } from './pages/GameSelect';
import { QuizGame } from './pages/QuizGame';
import { StampCollection } from './pages/StampCollection';

function AppContent() {
    const { isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        return <Login />;
    }

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="/scanner" element={<Scanner />} />
                <Route path="/game" element={<Game />} />
                <Route path="/game-select" element={<GameSelect />} />
                <Route path="/quiz-game" element={<QuizGame />} />
                <Route path="/stamps" element={<StampCollection />} />
            </Routes>
        </BrowserRouter>
    );
}

function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}

export default App;
