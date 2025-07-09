import { Battle } from "../models/Battle.js";
import { TestSeries } from "../models/TestSeries.js";
import { User } from "../models/User.js";

const matchmakingQueue = [];

export default function setupBattleSockets(io) {
    io.on("connection", (socket) => {
        console.log("User connected to socket:", socket.id);

        socket.on("joinMatchmaking", async ({ userId }) => {
            // Prevent duplicate entries
            if (matchmakingQueue.find(u => u.userId === userId)) return;
            
            // Add to queue
            matchmakingQueue.push({ userId, socket });
            console.log("User joined matchmaking:", userId);

            // If 2 or more users in queue, start a match
            if (matchmakingQueue.length >= 2) {
                const player1 = matchmakingQueue.shift();
                const player2 = matchmakingQueue.shift();

                // Fetch 10 questions (fetch a random TestSeries)
                const tests = await TestSeries.aggregate([{ $sample: { size: 1 } }]);
                let questions = [];
                if (tests.length > 0) {
                    questions = tests[0].questions.map(q => ({
                        questionText: q.questionText,
                        options: q.options,
                        correctOption: q.correctOption
                    }));
                } else {
                    // Fallback questions if no tests exist
                    for(let i=1; i<=10; i++) {
                        questions.push({
                            questionText: `Fallback Question ${i}?`,
                            options: ["A", "B", "C", "D"],
                            correctOption: 0
                        });
                    }
                }

                // Fetch User info for opponent display
                const p1User = await User.findById(player1.userId).select('name');
                const p2User = await User.findById(player2.userId).select('name');

                // Save Battle in DB
                const newBattle = await Battle.create({
                    user1Id: player1.userId,
                    user2Id: player2.userId,
                    questions: questions,
                    status: "active",
                });

                const roomId = `battle_${newBattle._id}`;
                player1.socket.join(roomId);
                player2.socket.join(roomId);

                // Map questions to hide correctOption
                const hiddenQuestions = questions.map(q => ({ questionText: q.questionText, options: q.options }));

                // Emit start event to Player 1
                io.to(player1.socket.id).emit("matchFound", {
                    battleId: newBattle._id,
                    opponent: { id: player2.userId, name: p2User?.name || "Opponent" },
                    questions: hiddenQuestions
                });

                // Emit start event to Player 2
                io.to(player2.socket.id).emit("matchFound", {
                    battleId: newBattle._id,
                    opponent: { id: player1.userId, name: p1User?.name || "Opponent" },
                    questions: hiddenQuestions
                });
            }
        });

        socket.on("submitAnswers", async ({ battleId, userId, answers }) => {
            // answers is array of objects: { questionIndex: 0, answerGiven: 2 }
            const battle = await Battle.findById(battleId);
            if (!battle) return;

            let score = 0;
            const formattedAnswers = [];

            // Calculate score (+4, -1, 0)
            for (let i = 0; i < battle.questions.length; i++) {
                const ans = answers.find(a => a.questionIndex === i);
                const answerGiven = ans ? ans.answerGiven : -1;
                
                if (answerGiven === -1) {
                    score += 0; // Not attempted
                } else if (answerGiven === battle.questions[i].correctOption) {
                    score += 4; // Correct
                } else {
                    score -= 1; // Wrong
                }

                formattedAnswers.push({
                    questionIndex: i,
                    answerGiven: answerGiven
                });
            }

            // Update battle
            const isUser1 = battle.user1Id.toString() === userId;
            if (isUser1) {
                battle.user1Answers = formattedAnswers;
                battle.user1Score = score;
                battle.user1FinishTime = new Date();
            } else {
                battle.user2Answers = formattedAnswers;
                battle.user2Score = score;
                battle.user2FinishTime = new Date();
            }

            await battle.save();

            // Check if both finished
            if (battle.user1FinishTime && battle.user2FinishTime) {
                battle.status = "completed";
                
                // Tie breaker
                if (battle.user1Score > battle.user2Score) {
                    battle.winnerId = battle.user1Id;
                } else if (battle.user2Score > battle.user1Score) {
                    battle.winnerId = battle.user2Id;
                } else {
                    // Tie-breaker: who finished first
                    if (battle.user1FinishTime < battle.user2FinishTime) {
                        battle.winnerId = battle.user1Id;
                    } else if (battle.user2FinishTime < battle.user1FinishTime) {
                        battle.winnerId = battle.user2Id;
                    } else {
                        // absolute tie, give it to user 1 for determinism
                        battle.winnerId = battle.user1Id;
                    }
                }
                await battle.save();

                // Notify both
                io.to(`battle_${battle._id}`).emit("battleEnded", {
                    battleId: battle._id,
                    user1Id: battle.user1Id,
                    user2Id: battle.user2Id,
                    user1Score: battle.user1Score,
                    user2Score: battle.user2Score,
                    user1FinishTime: battle.user1FinishTime,
                    user2FinishTime: battle.user2FinishTime,
                    winnerId: battle.winnerId
                });
            }
        });

        // Reconnect functionality
        socket.on("reconnectBattle", async ({ battleId, userId }) => {
            const battle = await Battle.findById(battleId);
            if (battle && battle.status === "active") {
                socket.join(`battle_${battleId}`);
            }
        });

        socket.on("disconnect", () => {
            console.log("User disconnected:", socket.id);
            // Remove from queue
            const index = matchmakingQueue.findIndex(u => u.socket.id === socket.id);
            if (index !== -1) matchmakingQueue.splice(index, 1);
        });
    });
}
