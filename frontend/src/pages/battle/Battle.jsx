import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { UserData } from '../../context/UserContext';
import { server } from '../../main';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import './Battle.css';

const Battle = () => {
    // Calculate socket url here to prevent circular dependency initialization error
    const socketUrl = server.replace('/api', '');

    const { user, isAuth } = UserData();
    const navigate = useNavigate();
    
    const [socket, setSocket] = useState(null);
    const [view, setView] = useState('lobby'); // lobby, searching, active, result
    
    // Battle Data
    const [battleId, setBattleId] = useState(null);
    const [opponent, setOpponent] = useState(null);
    const [questions, setQuestions] = useState([]);
    
    // Active Battle State
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [answers, setAnswers] = useState([]); // [{ questionIndex: 0, answerGiven: 1 }]
    const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
    const timerRef = useRef(null);

    // Results State
    const [resultData, setResultData] = useState(null);

    useEffect(() => {
        if (!isAuth) {
            toast.error("Please login to access Battle Mode");
            navigate('/login');
            return;
        }

        const newSocket = io(socketUrl);
        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('Connected to battle server');
        });

        newSocket.on('matchFound', (data) => {
            setBattleId(data.battleId);
            setOpponent(data.opponent);
            setQuestions(data.questions);
            // Initialize answers array with -1 (not attempted)
            const initialAnswers = data.questions.map((_, i) => ({ questionIndex: i, answerGiven: -1 }));
            setAnswers(initialAnswers);
            setView('active');
            setTimeLeft(300);
            startTimer();
        });

        newSocket.on('battleEnded', (data) => {
            stopTimer();
            setResultData(data);
            setView('result');
        });

        return () => {
            stopTimer();
            newSocket.disconnect();
        };
    }, [isAuth, navigate]);

    const startTimer = () => {
        timerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    autoSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const stopTimer = () => {
        if (timerRef.current) clearInterval(timerRef.current);
    };

    const findMatch = () => {
        if (!socket) return;
        setView('searching');
        socket.emit('joinMatchmaking', { userId: user._id });
    };

    const selectOption = (optIndex) => {
        const newAnswers = [...answers];
        newAnswers[currentQIndex].answerGiven = optIndex;
        setAnswers(newAnswers);
    };

    const nextQuestion = () => {
        if (currentQIndex < questions.length - 1) {
            setCurrentQIndex(currentQIndex + 1);
        }
    };

    const prevQuestion = () => {
        if (currentQIndex > 0) {
            setCurrentQIndex(currentQIndex - 1);
        }
    };

    const submitBattle = () => {
        if (!socket || !battleId) return;
        stopTimer();
        // Send answers to server
        socket.emit('submitAnswers', {
            battleId,
            userId: user._id,
            answers
        });
        toast.success("Answers submitted! Waiting for opponent...");
    };

    const autoSubmit = () => {
        toast.error("Time is up!");
        submitBattle();
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    return (
        <div className="battle-page">
            <div className="battle-container">
                
                {/* === LOBBY VIEW === */}
                {view === 'lobby' && (
                    <div className="lobby-view">
                        <div className="lobby-hero">
                            <h1>⚔️ 1v1 Battle Mode</h1>
                            <p>Test your knowledge against other students in a fast-paced 10-question quiz battle. Fastest and most accurate wins!</p>
                        </div>
                        <div className="lobby-actions">
                            <button className="common-btn" onClick={findMatch}>🔍 Find Match</button>
                        </div>
                    </div>
                )}

                {/* === SEARCHING VIEW === */}
                {view === 'searching' && (
                    <div className="lobby-view">
                        <div className="lobby-hero">
                            <h1>Searching for Opponent...</h1>
                            <p>Please wait while we find a worthy challenger for you.</p>
                        </div>
                        <div className="matchmaking-status">
                            <div className="radar-spinner"></div>
                            <span>In Queue</span>
                        </div>
                    </div>
                )}

                {/* === ACTIVE BATTLE VIEW === */}
                {view === 'active' && questions.length > 0 && (
                    <div className="active-view">
                        <div className="battle-header">
                            <div className="player-info">
                                <h3>You</h3>
                            </div>
                            <div className="vs-badge">VS</div>
                            <div className="player-info">
                                <h3>{opponent?.name}</h3>
                            </div>
                        </div>

                        <div className="battle-timer">
                            ⏱ {formatTime(timeLeft)}
                        </div>

                        <div className="question-tracker">
                            {questions.map((_, i) => (
                                <div 
                                    key={i} 
                                    className={`qt-dot ${i === currentQIndex ? 'active' : ''} ${answers[i]?.answerGiven !== -1 ? 'answered' : ''}`}
                                    onClick={() => setCurrentQIndex(i)}
                                    style={{cursor: 'pointer'}}
                                ></div>
                            ))}
                        </div>

                        <div className="battle-question-card">
                            <h2>Q{currentQIndex + 1}: {questions[currentQIndex].questionText}</h2>
                            <div className="battle-options">
                                {questions[currentQIndex].options.map((opt, i) => (
                                    <button 
                                        key={i}
                                        className={`battle-option ${answers[currentQIndex]?.answerGiven === i ? 'selected' : ''}`}
                                        onClick={() => selectOption(i)}
                                    >
                                        {String.fromCharCode(65 + i)}. {opt}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="battle-nav">
                            <button 
                                className="common-btn outline-btn" 
                                onClick={prevQuestion}
                                disabled={currentQIndex === 0}
                            >
                                ← Previous
                            </button>
                            
                            {currentQIndex === questions.length - 1 ? (
                                <button className="common-btn" style={{background: '#22c55e'}} onClick={submitBattle}>
                                    Submit Battle ✓
                                </button>
                            ) : (
                                <button className="common-btn" onClick={nextQuestion}>
                                    Next →
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* === RESULT VIEW === */}
                {view === 'result' && resultData && (
                    <div className="result-view">
                        <div className={`result-header ${resultData.winnerId === user._id ? 'win' : resultData.winnerId ? 'loss' : 'tie'}`}>
                            <h1>
                                {resultData.winnerId === user._id ? '🏆 You Won!' : 
                                 resultData.winnerId ? '💀 You Lost!' : '🤝 It\'s a Tie!'}
                            </h1>
                            <p>Battle Completed</p>
                        </div>

                        <div className="scores-container">
                            <div className={`score-card ${resultData.winnerId === user._id ? 'is-winner' : ''}`}>
                                <span className="sc-name">You</span>
                                <span className="sc-score">{resultData.user1Id === user._id ? resultData.user1Score : resultData.user2Score}</span>
                                <span>pts</span>
                            </div>
                            
                            <div className="vs-badge" style={{background: 'var(--text-secondary)'}}>VS</div>

                            <div className={`score-card ${resultData.winnerId !== user._id && resultData.winnerId ? 'is-winner' : ''}`}>
                                <span className="sc-name">{opponent?.name}</span>
                                <span className="sc-score">{resultData.user1Id === user._id ? resultData.user2Score : resultData.user1Score}</span>
                                <span>pts</span>
                            </div>
                        </div>

                        {(resultData.user1Score === resultData.user2Score) && resultData.winnerId && (
                            <p className="tie-breaker-msg">
                                * Tie-breaker decided by completion time.
                            </p>
                        )}

                        <button className="common-btn" onClick={() => setView('lobby')}>
                            Play Again
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
};

export default Battle;
