import Trycatch from "../middlewares/TryCatch.js";
import { StudentProgress } from "../models/StudentProgress.js";
import { User } from "../models/User.js";

// ===== POINTS CONFIG =====
const POINTS = {
    LECTURE_COMPLETE: 10,
    TEST_SUBMIT: 15,
    HIGH_SCORE_7: 10, // bonus for 7+/10
    HIGH_SCORE_9: 25, // bonus for 9+/10
    PERFECT_SCORE: 50, // bonus for 10/10
    STREAK_BONUS_3: 15, // 3-day streak
    STREAK_BONUS_7: 30, // 7-day streak
    STREAK_BONUS_14: 50,
    STREAK_BONUS_30: 100,
    COURSE_ENROLL: 5,
};

// ===== BADGE DEFINITIONS =====
const BADGE_RULES = [
    { id: "fast_starter", name: "Fast Starter", icon: "🚀", condition: (p) => p.testsCompleted >= 1 || p.lecturesCompleted >= 1 },
    { id: "test_master", name: "Test Master", icon: "📝", condition: (p) => p.testsCompleted >= 5 },
    { id: "lecture_streak", name: "Lecture Streak", icon: "🎬", condition: (p) => p.lecturesCompleted >= 10 },
    { id: "high_scorer", name: "High Scorer", icon: "🎯", condition: (p, ctx) => ctx?.highScore >= 9 },
    { id: "consistent_3", name: "3-Day Streak", icon: "🔥", condition: (p) => p.longestStreak >= 3 },
    { id: "consistent_7", name: "Weekly Warrior", icon: "⚡", condition: (p) => p.longestStreak >= 7 },
    { id: "consistent_14", name: "Fortnight Fighter", icon: "💪", condition: (p) => p.longestStreak >= 14 },
    { id: "consistent_30", name: "Monthly Master", icon: "👑", condition: (p) => p.longestStreak >= 30 },
    { id: "centurion", name: "Centurion", icon: "💯", condition: (p) => p.totalPoints >= 100 },
    { id: "points_500", name: "Study Champion", icon: "🏆", condition: (p) => p.totalPoints >= 500 },
    { id: "top_performer", name: "Top Performer", icon: "⭐", condition: (p) => p.totalPoints >= 1000 },
    { id: "test_legend", name: "Test Legend", icon: "🏅", condition: (p) => p.testsCompleted >= 20 },
];

// ===== HELPER: Get or create progress =====
async function getOrCreateProgress(userId) {
    let progress = await StudentProgress.findOne({ userId });
    if (!progress) {
        progress = await StudentProgress.create({ userId });
    }
    return progress;
}

// ===== HELPER: Update streak =====
function updateStreak(progress) {
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

    if (progress.lastActiveDate === today) {
        // Already active today, no change
        return 0;
    }

    let streakBonus = 0;

    if (progress.lastActiveDate === yesterday) {
        // Consecutive day
        progress.currentStreak += 1;
    } else {
        // Streak broken or first activity
        progress.currentStreak = 1;
    }

    if (progress.currentStreak > progress.longestStreak) {
        progress.longestStreak = progress.currentStreak;
    }

    progress.lastActiveDate = today;

    // Streak bonuses
    if (progress.currentStreak === 3) streakBonus = POINTS.STREAK_BONUS_3;
    else if (progress.currentStreak === 7) streakBonus = POINTS.STREAK_BONUS_7;
    else if (progress.currentStreak === 14) streakBonus = POINTS.STREAK_BONUS_14;
    else if (progress.currentStreak === 30) streakBonus = POINTS.STREAK_BONUS_30;

    return streakBonus;
}

// ===== HELPER: Check and award badges =====
function checkBadges(progress, ctx = {}) {
    const newBadges = [];
    for (const rule of BADGE_RULES) {
        if (!progress.badges.includes(rule.id) && rule.condition(progress, ctx)) {
            progress.badges.push(rule.id);
            newBadges.push(rule);
        }
    }
    return newBadges;
}

// ===== API: Record lecture completion =====
export const recordLectureComplete = Trycatch(async (req, res) => {
    const userId = req.user._id;
    const progress = await getOrCreateProgress(userId);

    // Add points
    progress.lecturesCompleted += 1;
    progress.totalPoints += POINTS.LECTURE_COMPLETE;
    progress.pointsHistory.push({
        action: "lecture_complete",
        points: POINTS.LECTURE_COMPLETE,
        description: "Completed a lecture",
    });

    // Update streak
    const streakBonus = updateStreak(progress);
    if (streakBonus > 0) {
        progress.totalPoints += streakBonus;
        progress.pointsHistory.push({
            action: "streak_bonus",
            points: streakBonus,
            description: `${progress.currentStreak}-day streak bonus!`,
        });
    }

    // Check badges
    const newBadges = checkBadges(progress);
    await progress.save();

    res.json({
        message: "Lecture recorded!",
        pointsEarned: POINTS.LECTURE_COMPLETE + streakBonus,
        newBadges,
        streak: progress.currentStreak,
    });
});

// ===== API: Record test completion (called from test submission) =====
export const recordTestComplete = Trycatch(async (req, res) => {
    const userId = req.user._id;
    const { score } = req.body;
    const progress = await getOrCreateProgress(userId);

    let totalEarned = POINTS.TEST_SUBMIT;
    progress.testsCompleted += 1;
    progress.totalPoints += POINTS.TEST_SUBMIT;
    progress.pointsHistory.push({
        action: "test_submit",
        points: POINTS.TEST_SUBMIT,
        description: `Completed a test (Score: ${score}/10)`,
    });

    // Score bonuses
    let bonus = 0;
    if (score === 10) bonus = POINTS.PERFECT_SCORE;
    else if (score >= 9) bonus = POINTS.HIGH_SCORE_9;
    else if (score >= 7) bonus = POINTS.HIGH_SCORE_7;

    if (bonus > 0) {
        progress.totalPoints += bonus;
        totalEarned += bonus;
        progress.pointsHistory.push({
            action: "high_score",
            points: bonus,
            description: `High score bonus (${score}/10)`,
        });
    }

    // Update streak
    const streakBonus = updateStreak(progress);
    if (streakBonus > 0) {
        progress.totalPoints += streakBonus;
        totalEarned += streakBonus;
        progress.pointsHistory.push({
            action: "streak_bonus",
            points: streakBonus,
            description: `${progress.currentStreak}-day streak bonus!`,
        });
    }

    // Check badges
    const newBadges = checkBadges(progress, { highScore: score });
    await progress.save();

    res.json({
        message: "Test recorded!",
        pointsEarned: totalEarned,
        newBadges,
        streak: progress.currentStreak,
    });
});

// ===== API: Get my gamification stats =====
export const getMyGamification = Trycatch(async (req, res) => {
    const userId = req.user._id;
    const progress = await getOrCreateProgress(userId);
    const user = await User.findById(userId).select("name");

    // Get my rank
    const allProgress = await StudentProgress.find().sort({ totalPoints: -1 });
    const myRank = allProgress.findIndex(p => p.userId.toString() === userId.toString()) + 1;

    // Resolve badges
    const earnedBadges = progress.badges.map(badgeId => {
        const rule = BADGE_RULES.find(r => r.id === badgeId);
        return rule ? { id: rule.id, name: rule.name, icon: rule.icon } : null;
    }).filter(Boolean);

    // All available badges with lock status
    const allBadges = BADGE_RULES.map(rule => ({
        id: rule.id,
        name: rule.name,
        icon: rule.icon,
        earned: progress.badges.includes(rule.id),
    }));

    res.json({
        stats: {
            name: user.name,
            totalPoints: progress.totalPoints,
            lecturesCompleted: progress.lecturesCompleted,
            testsCompleted: progress.testsCompleted,
            currentStreak: progress.currentStreak,
            longestStreak: progress.longestStreak,
            lastActiveDate: progress.lastActiveDate,
            rank: myRank,
            totalStudents: allProgress.length,
            badges: earnedBadges,
            allBadges,
            recentPoints: progress.pointsHistory.slice(-10).reverse(),
        },
    });
});

// ===== API: Global Leaderboard =====
export const getGlobalLeaderboard = Trycatch(async (req, res) => {
    const { period } = req.query; // 'daily', 'weekly', or 'all'
    const userId = req.user._id;

    let allProgress;

    if (period === "daily") {
        const today = new Date().toISOString().split("T")[0];
        // Students who were active today
        allProgress = await StudentProgress.find({ lastActiveDate: today })
            .sort({ totalPoints: -1 })
            .populate("userId", "name");
    } else if (period === "weekly") {
        // Students active in last 7 days
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const weekDates = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            weekDates.push(d.toISOString().split("T")[0]);
        }
        allProgress = await StudentProgress.find({ lastActiveDate: { $in: weekDates } })
            .sort({ totalPoints: -1 })
            .populate("userId", "name");
    } else {
        allProgress = await StudentProgress.find()
            .sort({ totalPoints: -1 })
            .populate("userId", "name");
    }

    const leaderboard = allProgress.map((p, i) => ({
        rank: i + 1,
        userId: p.userId?._id,
        name: p.userId?.name || "Unknown",
        totalPoints: p.totalPoints,
        lecturesCompleted: p.lecturesCompleted,
        testsCompleted: p.testsCompleted,
        currentStreak: p.currentStreak,
        badges: p.badges.length,
        isMe: p.userId?._id?.toString() === userId.toString(),
    }));

    // Find current user's rank even if not in filtered list
    let myEntry = leaderboard.find(l => l.isMe);
    if (!myEntry) {
        const myProgress = await StudentProgress.findOne({ userId }).populate("userId", "name");
        if (myProgress) {
            const allForRank = await StudentProgress.find().sort({ totalPoints: -1 });
            const myRank = allForRank.findIndex(p => p.userId.toString() === userId.toString()) + 1;
            myEntry = {
                rank: myRank,
                name: myProgress.userId?.name || "You",
                totalPoints: myProgress.totalPoints,
                lecturesCompleted: myProgress.lecturesCompleted,
                testsCompleted: myProgress.testsCompleted,
                currentStreak: myProgress.currentStreak,
                badges: myProgress.badges.length,
                isMe: true,
            };
        }
    }

    res.json({ leaderboard: leaderboard.slice(0, 50), myEntry });
});
