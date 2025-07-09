import Trycatch from "../middlewares/TryCatch.js";
import { User } from "../models/User.js";
import { Courses } from "../models/Courses.js";
import { Lecture } from "../models/Lectures.js";
import { TestSeries } from "../models/TestSeries.js";
import { TestSubmission } from "../models/TestSubmission.js";
import { StudentProgress } from "../models/StudentProgress.js";

export const getStudentDashboard = Trycatch(async (req, res) => {
    const userId = req.user._id;
    const user = await User.findById(userId);

    // ===== COURSE DATA =====
    const enrolledCourses = await Courses.find({ _id: { $in: user.subscription } });
    const totalEnrolled = enrolledCourses.length;

    // Get total lectures for enrolled courses
    let totalLectures = 0;
    const courseProgress = [];

    for (const course of enrolledCourses) {
        const lectures = await Lecture.find({ course: course._id });
        totalLectures += lectures.length;
        courseProgress.push({
            _id: course._id,
            title: course.title,
            category: course.category,
            totalLectures: lectures.length,
            image: course.image,
        });
    }

    // ===== TEST DATA =====
    const submissions = await TestSubmission.find({ userId })
        .sort({ submittedAt: -1 })
        .populate("testSeriesId", "title category description");

    const testsAttempted = submissions.length;
    let totalScore = 0;
    let totalCorrect = 0;
    let totalWrong = 0;
    let highestScore = 0;
    let lowestScore = testsAttempted > 0 ? 10 : 0;

    const testResults = [];
    const categoryScores = {};

    for (const sub of submissions) {
        totalScore += sub.score;
        totalCorrect += sub.score;
        totalWrong += (sub.totalQuestions - sub.score);

        if (sub.score > highestScore) highestScore = sub.score;
        if (sub.score < lowestScore) lowestScore = sub.score;

        const testTitle = sub.testSeriesId?.title || "Unknown Test";
        const testCategory = sub.testSeriesId?.title?.split(" ")[0] || "General";

        testResults.push({
            testTitle,
            score: sub.score,
            totalQuestions: sub.totalQuestions,
            percentage: (sub.score / sub.totalQuestions) * 100,
            date: sub.submittedAt,
        });

        // Category-based performance
        if (!categoryScores[testCategory]) {
            categoryScores[testCategory] = { total: 0, count: 0 };
        }
        categoryScores[testCategory].total += sub.score;
        categoryScores[testCategory].count += 1;
    }

    const averageScore = testsAttempted > 0 ? (totalScore / testsAttempted).toFixed(1) : 0;

    // ===== STRONG & WEAK TOPICS =====
    const topicPerformance = Object.entries(categoryScores).map(([topic, data]) => ({
        topic,
        averageScore: (data.total / data.count).toFixed(1),
        testsCount: data.count,
        percentage: ((data.total / (data.count * 10)) * 100).toFixed(0),
    }));

    // Sort: strong = highest average, weak = lowest average
    const sorted = [...topicPerformance].sort((a, b) => b.percentage - a.percentage);
    const strongTopics = sorted.filter(t => t.percentage >= 60);
    const weakTopics = sorted.filter(t => t.percentage < 60);

    // ===== RECENT ACTIVITY =====
    const recentActivity = [];

    // Recent test submissions
    const recentTests = submissions.slice(0, 3);
    for (const sub of recentTests) {
        recentActivity.push({
            type: "test",
            title: `Scored ${sub.score}/10 in ${sub.testSeriesId?.title || "a test"}`,
            date: sub.submittedAt,
            icon: "test",
        });
    }

    // Recent course enrollments (from user timestamps)
    for (const course of enrolledCourses.slice(0, 2)) {
        recentActivity.push({
            type: "course",
            title: `Enrolled in ${course.title}`,
            date: course.createdAt,
            icon: "course",
        });
    }

    // Sort recent activity by date
    recentActivity.sort((a, b) => new Date(b.date) - new Date(a.date));

    // ===== PERFORMANCE TREND (last 5 tests) =====
    const performanceTrend = testResults.slice(0, 7).reverse().map(t => ({
        label: t.testTitle.substring(0, 15),
        score: t.score,
        percentage: t.percentage,
    }));

    // ===== GAMIFICATION DATA =====
    let gamification = {
        totalPoints: 0,
        currentStreak: 0,
        longestStreak: 0,
        badges: [],
        rank: 0,
    };

    try {
        let progress = await StudentProgress.findOne({ userId });
        if (progress) {
            const allProgress = await StudentProgress.find().sort({ totalPoints: -1 });
            const myRank = allProgress.findIndex(p => p.userId.toString() === userId.toString()) + 1;
            gamification = {
                totalPoints: progress.totalPoints,
                currentStreak: progress.currentStreak,
                longestStreak: progress.longestStreak,
                badges: progress.badges,
                rank: myRank,
            };
        }
    } catch (err) {
        // Non-blocking
    }

    // ===== RESPONSE =====
    res.json({
        dashboard: {
            user: {
                name: user.name,
                email: user.email,
                joinedAt: user.createdAt,
            },
            courseStats: {
                totalEnrolled,
                totalLectures,
                courses: courseProgress,
            },
            testStats: {
                testsAttempted,
                averageScore: Number(averageScore),
                highestScore,
                lowestScore,
                totalCorrect,
                totalWrong,
                performanceTrend,
            },
            topicAnalysis: {
                strongTopics,
                weakTopics,
                allTopics: topicPerformance,
            },
            gamification,
            recentActivity: recentActivity.slice(0, 8),
        },
    });
});
