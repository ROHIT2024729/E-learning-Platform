import Trycatch from "../middlewares/TryCatch.js";

export const askDoubt = Trycatch(async (req, res) => {
    const { question } = req.body;
    
    if (!question) {
        return res.status(400).json({ message: "Please ask a question" });
    }

    const lowerQ = question.toLowerCase();
    
    // Simple study-focused keyword checking logic
    const studyKeywords = [
        'what', 'how', 'why', 'explain', 'course', 'react', 'node', 'javascript', 
        'code', 'function', 'error', 'bug', 'build', 'api', 'database', 'learn', 'study',
        'lesson', 'lecture', 'help'
    ];
    
    const isStudyRelated = studyKeywords.some(keyword => lowerQ.includes(keyword));

    if (!isStudyRelated && lowerQ.length > 5) {
        return res.status(200).json({
            answer: "I am a study-focused assistant. Please ask questions related to your courses, coding, or learning materials."
        });
    }

    // Generic educational responses for the simulation
    let answer = "That's a great question! Based on your course material, the key concept here is understanding the core principles and practicing them through implementation. Let me know if you need a specific code example or a breakdown of a particular lesson.";
    
    if (lowerQ.includes('react')) {
        answer = "React is a JavaScript library for building user interfaces. It uses a component-based architecture and a virtual DOM for efficient rendering. What specific React concept are you struggling with?";
    } else if (lowerQ.includes('node') || lowerQ.includes('express')) {
        answer = "Node.js allows you to run JavaScript on the server. Express is a popular framework for building APIs in Node. Keep in mind asynchronous programming when working with Node!";
    } else if (lowerQ.includes('error') || lowerQ.includes('bug')) {
        answer = "Debugging is a normal part of coding! Please check your console or terminal for the exact error message. Reading the error trace top-to-bottom usually points to the exact line causing the issue.";
    }

    res.status(200).json({ answer });
});
