import Trycatch from "../middlewares/TryCatch.js";
import { User } from "../models/User.js";
import { Courses } from "../models/Courses.js";
import { Lecture } from "../models/Lectures.js";
import { TestSeries } from "../models/TestSeries.js";
import { TestSubmission } from "../models/TestSubmission.js";
import { Payment } from "../models/payment.js";
import { StudentProgress } from "../models/StudentProgress.js";

export const getAdminAnalytics = Trycatch(async (req, res) => {
    // ===== USERS =====
    const allUsers = await User.find().select("name role createdAt subscription testSubscription");
    const totalUsers = allUsers.length;
    const totalStudents = allUsers.filter(u => u.role === "user").length;
    const totalAdmins = allUsers.filter(u => u.role === "admin").length;

    // Users by time period
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - 7);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const newUsersToday = allUsers.filter(u => new Date(u.createdAt) >= todayStart).length;
    const newUsersWeek = allUsers.filter(u => new Date(u.createdAt) >= weekStart).length;
    const newUsersMonth = allUsers.filter(u => new Date(u.createdAt) >= monthStart).length;

    // User growth last 6 months
    const userGrowth = [];
    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const dEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
        const count = allUsers.filter(u => {
            const c = new Date(u.createdAt);
            return c >= d && c <= dEnd;
        }).length;
        userGrowth.push({
            month: d.toLocaleString("en-US", { month: "short" }),
            count,
        });
    }

    // ===== ACTIVE USERS (from StudentProgress) =====
    const today = now.toISOString().split("T")[0];
    const progressRecords = await StudentProgress.find().select("lastActiveDate userId");
    const activeToday = progressRecords.filter(p => p.lastActiveDate === today).length;

    const weekDates = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        weekDates.push(d.toISOString().split("T")[0]);
    }
    const activeWeek = progressRecords.filter(p => weekDates.includes(p.lastActiveDate)).length;

    const monthDates = [];
    for (let i = 0; i < 30; i++) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        monthDates.push(d.toISOString().split("T")[0]);
    }
    const activeMonth = progressRecords.filter(p => monthDates.includes(p.lastActiveDate)).length;

    // ===== REVENUE =====
    const allCourses = await Courses.find();
    const totalPayments = await Payment.countDocuments();

    // Revenue from courses: count subscriptions × course price
    let totalCourseRevenue = 0;
    const courseRevenueList = [];

    for (const course of allCourses) {
        const enrolledCount = allUsers.filter(u =>
            u.subscription.some(s => s.toString() === course._id.toString())
        ).length;
        const revenue = enrolledCount * course.price;
        totalCourseRevenue += revenue;
        courseRevenueList.push({
            title: course.title,
            price: course.price,
            enrolled: enrolledCount,
            revenue,
        });
    }

    // Revenue from test series
    const allTestSeries = await TestSeries.find();
    let totalTestRevenue = 0;
    const testRevenueList = [];

    for (const test of allTestSeries) {
        if (test.type === "paid") {
            const purchasedCount = allUsers.filter(u =>
                u.testSubscription.some(s => s.toString() === test._id.toString())
            ).length;
            const revenue = purchasedCount * test.price;
            totalTestRevenue += revenue;
            testRevenueList.push({
                title: test.title,
                price: test.price,
                purchased: purchasedCount,
                revenue,
            });
        }
    }

    const totalRevenue = totalCourseRevenue + totalTestRevenue;

    // Revenue by month (from payment timestamps)
    const payments = await Payment.find().select("createdAt");
    const revenueByMonth = [];
    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const dEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
        const monthPayments = payments.filter(p => {
            const c = new Date(p.createdAt);
            return c >= d && c <= dEnd;
        }).length;
        revenueByMonth.push({
            month: d.toLocaleString("en-US", { month: "short" }),
            transactions: monthPayments,
        });
    }

    // ===== COURSE PERFORMANCE =====
    const totalLectures = await Lecture.countDocuments();
    const coursePerformance = [];

    for (const course of allCourses) {
        const lectureCount = await Lecture.countDocuments({ course: course._id });
        const enrolledCount = allUsers.filter(u =>
            u.subscription.some(s => s.toString() === course._id.toString())
        ).length;
        const avgRating = course.ratings.length > 0
            ? (course.ratings.reduce((sum, r) => sum + r.rating, 0) / course.ratings.length).toFixed(1)
            : 0;

        coursePerformance.push({
            _id: course._id,
            title: course.title,
            category: course.category,
            price: course.price,
            lectures: lectureCount,
            enrolled: enrolledCount,
            ratings: course.ratings.length,
            avgRating: Number(avgRating),
            revenue: enrolledCount * course.price,
        });
    }

    // Sort by enrolled descending
    coursePerformance.sort((a, b) => b.enrolled - a.enrolled);

    // ===== TEST ANALYTICS =====
    const totalTests = allTestSeries.length;
    const totalSubmissions = await TestSubmission.countDocuments();
    const allSubmissions = await TestSubmission.find().select("score totalQuestions testSeriesId submittedAt");

    const totalScoreSum = allSubmissions.reduce((s, sub) => s + sub.score, 0);
    const avgTestScore = totalSubmissions > 0 ? (totalScoreSum / totalSubmissions).toFixed(1) : 0;

    const freeTests = allTestSeries.filter(t => t.type === "free").length;
    const paidTests = allTestSeries.filter(t => t.type === "paid").length;

    // Per-test stats
    const testPerformance = [];
    for (const test of allTestSeries) {
        const subs = allSubmissions.filter(s => s.testSeriesId.toString() === test._id.toString());
        const attempts = subs.length;
        const avgScore = attempts > 0
            ? (subs.reduce((sum, s) => sum + s.score, 0) / attempts).toFixed(1)
            : 0;

        testPerformance.push({
            _id: test._id,
            title: test.title,
            type: test.type,
            attempts,
            avgScore: Number(avgScore),
        });
    }

    testPerformance.sort((a, b) => b.attempts - a.attempts);

    // Score distribution
    const scoreDistribution = Array(11).fill(0); // 0-10
    allSubmissions.forEach(s => {
        if (s.score >= 0 && s.score <= 10) scoreDistribution[s.score]++;
    });

    // Test submissions by month
    const testsByMonth = [];
    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const dEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
        const count = allSubmissions.filter(s => {
            const c = new Date(s.submittedAt);
            return c >= d && c <= dEnd;
        }).length;
        testsByMonth.push({
            month: d.toLocaleString("en-US", { month: "short" }),
            attempts: count,
        });
    }

    // ===== RESPONSE =====
    res.json({
        analytics: {
            users: {
                totalUsers,
                totalStudents,
                totalAdmins,
                newUsersToday,
                newUsersWeek,
                newUsersMonth,
                userGrowth,
                activeToday,
                activeWeek,
                activeMonth,
            },
            revenue: {
                totalRevenue,
                totalCourseRevenue,
                totalTestRevenue,
                totalPayments,
                courseRevenueList: courseRevenueList.sort((a, b) => b.revenue - a.revenue),
                testRevenueList,
                revenueByMonth,
            },
            courses: {
                totalCourses: allCourses.length,
                totalLectures,
                coursePerformance,
            },
            tests: {
                totalTests,
                totalSubmissions,
                avgTestScore: Number(avgTestScore),
                freeTests,
                paidTests,
                testPerformance,
                scoreDistribution,
                testsByMonth,
            },
        },
    });
});
