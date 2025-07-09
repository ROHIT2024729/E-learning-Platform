import Trycatch from "../middlewares/TryCatch.js";
import { TestSeries } from "../models/TestSeries.js";
import { TestSubmission } from "../models/TestSubmission.js";
import { User } from "../models/User.js";
import { instance } from "../index.js";
import crypto from "crypto";

// Get all test series (public listing — hides questions)
export const getAllTestSeries = Trycatch(async (req, res) => {
    const tests = await TestSeries.find().select("-questions");
    res.json({ tests });
});

// Get single test series with questions (access-controlled)
export const getTestSeries = Trycatch(async (req, res) => {
    const test = await TestSeries.findById(req.params.id);
    if (!test) return res.status(404).json({ message: "Test not found" });

    const user = await User.findById(req.user._id);

    if (user.role === "admin") {
        return res.json({ test });
    }

    // Free tests are open to all
    if (test.type === "paid") {
        const hasAccess = user.testSubscription.some(
            (sub) => sub.toString() === test._id.toString()
        );
        if (!hasAccess) {
            return res.status(403).json({ message: "Please purchase this test series first" });
        }
    }

    // Send questions without correct answers to students
    const safeQuestions = test.questions.map((q) => ({
        _id: q._id,
        questionText: q.questionText,
        options: q.options,
    }));

    res.json({
        test: {
            _id: test._id,
            title: test.title,
            description: test.description,
            type: test.type,
            price: test.price,
            createdBy: test.createdBy,
            questions: safeQuestions,
        },
    });
});

// Submit test answers and get result
export const submitTest = Trycatch(async (req, res) => {
    const { answers } = req.body;
    const testId = req.params.id;
    const userId = req.user._id;

    if (!answers || !Array.isArray(answers) || answers.length !== 10) {
        return res.status(400).json({ message: "Please answer all 10 questions" });
    }

    const test = await TestSeries.findById(testId);
    if (!test) return res.status(404).json({ message: "Test not found" });

    const user = await User.findById(userId);

    // Check paid access
    if (test.type === "paid") {
        const hasAccess = user.testSubscription.some(
            (sub) => sub.toString() === test._id.toString()
        );
        if (!hasAccess) {
            return res.status(403).json({ message: "Please purchase this test series first" });
        }
    }

    // Check for existing submission
    const existing = await TestSubmission.findOne({ userId, testSeriesId: testId });
    if (existing) {
        return res.status(400).json({ message: "You have already submitted this test" });
    }

    // Grade the test
    let score = 0;
    const feedback = test.questions.map((q, i) => {
        const isCorrect = answers[i] === q.correctOption;
        if (isCorrect) score++;
        return {
            questionText: q.questionText,
            options: q.options,
            selectedOption: answers[i],
            correctOption: q.correctOption,
            isCorrect,
        };
    });

    // Save submission
    await TestSubmission.create({
        userId,
        testSeriesId: testId,
        answers,
        score,
    });

    // ===== GAMIFICATION: Award points for test completion =====
    try {
        const { StudentProgress } = await import("../models/StudentProgress.js");
        let progress = await StudentProgress.findOne({ userId });
        if (!progress) progress = await StudentProgress.create({ userId });

        // Base points
        let totalEarned = 15;
        progress.testsCompleted += 1;
        progress.totalPoints += 15;
        progress.pointsHistory.push({
            action: "test_submit",
            points: 15,
            description: `Completed a test (Score: ${score}/10)`,
        });

        // Score bonuses
        let bonus = 0;
        if (score === 10) bonus = 50;
        else if (score >= 9) bonus = 25;
        else if (score >= 7) bonus = 10;

        if (bonus > 0) {
            progress.totalPoints += bonus;
            totalEarned += bonus;
            progress.pointsHistory.push({
                action: "high_score",
                points: bonus,
                description: `High score bonus (${score}/10)`,
            });
        }

        // Streak
        const today = new Date().toISOString().split("T")[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
        if (progress.lastActiveDate !== today) {
            if (progress.lastActiveDate === yesterday) {
                progress.currentStreak += 1;
            } else {
                progress.currentStreak = 1;
            }
            if (progress.currentStreak > progress.longestStreak) {
                progress.longestStreak = progress.currentStreak;
            }
            progress.lastActiveDate = today;
        }

        await progress.save();
    } catch (gamErr) {
        console.error("Gamification error (non-blocking):", gamErr.message);
    }

    // Calculate rank
    const allSubmissions = await TestSubmission.find({ testSeriesId: testId }).sort({ score: -1 });
    const rank = allSubmissions.findIndex((s) => s.userId.toString() === userId.toString()) + 1;
    const totalStudents = allSubmissions.length;

    res.json({
        message: "Test submitted successfully",
        score,
        totalQuestions: 10,
        percentage: (score / 10) * 100,
        rank,
        totalStudents,
        feedback,
    });
});

// Get leaderboard for a test
export const getLeaderboard = Trycatch(async (req, res) => {
    const testId = req.params.id;

    const submissions = await TestSubmission.find({ testSeriesId: testId })
        .sort({ score: -1, submittedAt: 1 })
        .populate("userId", "name email");

    const leaderboard = submissions.map((s, i) => ({
        rank: i + 1,
        name: s.userId?.name || "Unknown",
        score: s.score,
        percentage: (s.score / 10) * 100,
    }));

    res.json({ leaderboard });
});

// Get user's submission for a test (to show results again)
export const getMySubmission = Trycatch(async (req, res) => {
    const testId = req.params.id;
    const userId = req.user._id;

    const submission = await TestSubmission.findOne({ userId, testSeriesId: testId });
    if (!submission) {
        return res.json({ submission: null });
    }

    const test = await TestSeries.findById(testId);
    const allSubmissions = await TestSubmission.find({ testSeriesId: testId }).sort({ score: -1 });
    const rank = allSubmissions.findIndex((s) => s.userId.toString() === userId.toString()) + 1;

    const feedback = test.questions.map((q, i) => ({
        questionText: q.questionText,
        options: q.options,
        selectedOption: submission.answers[i],
        correctOption: q.correctOption,
        isCorrect: submission.answers[i] === q.correctOption,
    }));

    res.json({
        submission: {
            score: submission.score,
            totalQuestions: 10,
            percentage: (submission.score / 10) * 100,
            rank,
            totalStudents: allSubmissions.length,
            feedback,
        },
    });
});

// Checkout for paid test
export const testCheckout = Trycatch(async (req, res) => {
    const user = await User.findById(req.user._id);
    const test = await TestSeries.findById(req.params.id);

    if (!test) return res.status(404).json({ message: "Test not found" });
    if (test.type === "free") return res.status(400).json({ message: "This test is free" });

    const hasAccess = user.testSubscription.some(
        (sub) => sub.toString() === test._id.toString()
    );
    if (hasAccess) return res.status(400).json({ message: "You already have access to this test" });

    const options = {
        amount: Number(test.price * 100),
        currency: "INR",
    };

    const order = await instance.orders.create(options);
    res.status(201).json({ order, test });
});

// Verify payment for paid test
export const testPaymentVerification = Trycatch(async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
        .createHmac("sha256", process.env.Razorpay_Secret)
        .update(body)
        .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
        const user = await User.findById(req.user._id);
        user.testSubscription.push(req.params.id);
        await user.save();

        res.status(200).json({ message: "Test Series Purchased Successfully!" });
    } else {
        return res.status(400).json({ message: "Payment Failed!" });
    }
});

// ===== ADMIN CONTROLLERS =====

export const createTestSeries = Trycatch(async (req, res) => {
    const { title, description, type, price, questions } = req.body;

    if (!questions || questions.length !== 10) {
        return res.status(400).json({ message: "Exactly 10 questions are required" });
    }

    // Validate each question
    for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        if (!q.questionText || !q.options || q.options.length !== 4 || q.correctOption === undefined) {
            return res.status(400).json({
                message: `Question ${i + 1} is invalid. Each question needs text, 4 options, and a correct answer.`,
            });
        }
        if (q.correctOption < 0 || q.correctOption > 3) {
            return res.status(400).json({
                message: `Question ${i + 1}: correctOption must be 0-3`,
            });
        }
    }

    await TestSeries.create({
        title,
        description,
        type: type || "free",
        price: type === "paid" ? price : 0,
        questions,
        createdBy: req.user.name,
    });

    res.status(201).json({ message: "Test Series Created!" });
});

export const updateTestSeries = Trycatch(async (req, res) => {
    const test = await TestSeries.findById(req.params.id);
    if (!test) return res.status(404).json({ message: "Test not found" });

    const { title, description, type, price, questions } = req.body;

    if (questions && questions.length !== 10) {
        return res.status(400).json({ message: "Exactly 10 questions are required" });
    }

    if (title) test.title = title;
    if (description) test.description = description;
    if (type) test.type = type;
    if (type === "paid" && price !== undefined) test.price = price;
    if (type === "free") test.price = 0;
    if (questions) test.questions = questions;

    await test.save();
    res.json({ message: "Test Series Updated!" });
});

export const deleteTestSeries = Trycatch(async (req, res) => {
    const test = await TestSeries.findById(req.params.id);
    if (!test) return res.status(404).json({ message: "Test not found" });

    // Remove all submissions for this test
    await TestSubmission.deleteMany({ testSeriesId: req.params.id });

    // Remove from users' testSubscription
    await User.updateMany({}, { $pull: { testSubscription: req.params.id } });

    await test.deleteOne();
    res.json({ message: "Test Series Deleted!" });
});
