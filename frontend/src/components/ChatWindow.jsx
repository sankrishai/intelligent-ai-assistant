import { useRef, useEffect } from 'react'
import MessageBubble from './MessageBubble'
import AiBrainIcon from './AiBrainIcon'

const SUGGESTIONS = [
    { icon: '🎭', text: 'Generate Playwright or Selenium test scripts from my code' },
    { icon: '🧪', text: 'Create unit test cases with edge cases and assertions' },
    { icon: '📋', text: 'Build a test plan with positive, negative and boundary scenarios' },
    { icon: '🐛', text: 'Analyze my code for bugs and suggest fixes' }
]

function ChatWindow({ messages, isLoading, onSend }) {
    const bottomRef = useRef(null)

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, isLoading])

    return (
        <div className="chat-window">
            {messages.length === 0 && !isLoading && (
                <div className="empty-state">
                    <div className="empty-hero">
                        <div className="empty-icon-ring">
                            <AiBrainIcon size={48} />
                        </div>
                        <h2>How can I help you today?</h2>
                        <p>I'm <strong>Intelligent QA AI Assistant</strong> — your AI-powered testing companion. Paste code, ask questions, or explore testing strategies.</p>
                    </div>
                    <div className="suggestions-grid">
                        {SUGGESTIONS.map((s, i) => (
                            <button
                                key={i}
                                className="suggestion-card"
                                onClick={() => onSend(s.text)}
                            >
                                <span className="suggestion-icon">{s.icon}</span>
                                <span className="suggestion-text">{s.text}</span>
                                <span className="suggestion-arrow">→</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {messages.map((msg, i) => (
                <MessageBubble key={i} role={msg.role} content={msg.content} timestamp={msg.timestamp} />
            ))}

            {isLoading && (
                <div className="loading-row">
                    <div className="avatar assistant-avatar">🤖</div>
                    <div className="loading-bubble">
                        <div className="loading-dots">
                            <span></span><span></span><span></span>
                        </div>
                        <span className="loading-text">Generating response...</span>
                    </div>
                </div>
            )}

            <div ref={bottomRef} />
        </div>
    )
}

export default ChatWindow
