import React, { useState } from 'react';
import axios from 'axios';
import { server } from '../../main';
import './DoubtBot.css';
import { BsChatDotsFill, BsX } from 'react-icons/bs';
import { IoSend } from 'react-icons/io5';

const DoubtBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { text: "Hi! I'm your study assistant. Ask me any course-related doubt!", sender: "bot" }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = { text: input, sender: "user" };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const token = localStorage.getItem("token");
            const { data } = await axios.post(`${server}/api/doubt`, { question: input }, {
                headers: { token }
            });
            
            setMessages(prev => [...prev, { text: data.answer, sender: "bot" }]);
        } catch (error) {
            setMessages(prev => [...prev, { text: "Sorry, I couldn't process that right now. Please try again later.", sender: "bot" }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`doubt-bot-container ${isOpen ? 'open' : ''}`}>
            {!isOpen && (
                <button className="doubt-bot-toggle" onClick={() => setIsOpen(true)}>
                    <BsChatDotsFill size={24} />
                    <span className="tooltip">Ask a Doubt</span>
                </button>
            )}

            {isOpen && (
                <div className="doubt-bot-window">
                    <div className="doubt-bot-header">
                        <h3>Study Assistant</h3>
                        <button onClick={() => setIsOpen(false)}><BsX size={24} /></button>
                    </div>
                    
                    <div className="doubt-bot-messages">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`message ${msg.sender}`}>
                                {msg.text}
                            </div>
                        ))}
                        {loading && (
                            <div className="message bot loading">
                                <span className="dot"></span>
                                <span className="dot"></span>
                                <span className="dot"></span>
                            </div>
                        )}
                    </div>

                    <form className="doubt-bot-input" onSubmit={handleSend}>
                        <input 
                            type="text" 
                            placeholder="Ask a study doubt..." 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                        <button type="submit" disabled={!input.trim() || loading}>
                            <IoSend />
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default DoubtBot;
