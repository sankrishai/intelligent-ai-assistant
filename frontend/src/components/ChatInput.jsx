import { useState, useRef } from 'react'

function ChatInput({ onSend, isLoading, onStop }) {
    const [text, setText] = useState('')
    const [action, setAction] = useState('text')
    const [imagePreview, setImagePreview] = useState(null)
    const textareaRef = useRef(null)
    const fileInputRef = useRef(null)

    const handleImageUpload = (e) => {
        const file = e.target.files[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setImagePreview(reader.result)
            }
            reader.readAsDataURL(file)
        }
    }

    const clearImage = () => {
        setImagePreview(null)
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        if ((!text.trim() && !imagePreview) || isLoading) return
        onSend({ text, action, image: imagePreview })
        setText('')
        clearImage()
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'
        }
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSubmit(e)
        }
    }

    const handleInput = (e) => {
        setText(e.target.value)
        e.target.style.height = 'auto'
        e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px'
    }

    const charCount = text.length

    return (
        <form className="chat-input-container" onSubmit={handleSubmit} style={{ position: 'relative' }}>
            <div className="input-hint">
                <span>Press <kbd>Enter</kbd> to send, <kbd>Shift+Enter</kbd> for new line. <span style={{color: 'var(--primary-400)'}}>✨ New: Upload a screenshot for Visual QA!</span></span>
                {charCount > 0 && <span className="char-count">{charCount.toLocaleString()} chars</span>}
            </div>

            {imagePreview && (
                <div style={{ position: 'absolute', top: '-70px', left: '20px', zIndex: 10, background: 'var(--bg-input)', padding: '5px', borderRadius: '8px', border: '1px solid var(--border-active)', boxShadow: 'var(--shadow-glow)' }}>
                    <img src={imagePreview} alt="Preview" style={{ height: '50px', borderRadius: '4px' }} />
                    <button type="button" onClick={clearImage} style={{ position: 'absolute', top: '-8px', right: '-8px', background: 'var(--red-500)', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', fontSize: '10px' }}>✕</button>
                </div>
            )}

            <div className={`chat-input-wrapper ${isLoading ? 'loading' : ''}`}>
                <div className="action-selector-wrapper" style={{ flexShrink: 0, borderRight: '1px solid var(--border-1)', paddingRight: '0.5rem', marginRight: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    
                    <input 
                        type="file" 
                        accept="image/*" 
                        ref={fileInputRef} 
                        onChange={handleImageUpload} 
                        style={{ display: 'none' }} 
                    />
                    <button 
                        type="button" 
                        onClick={() => fileInputRef.current?.click()} 
                        title="Upload Screenshot for Visual QA"
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-3)', cursor: 'pointer', padding: '0.2rem', transition: 'color 0.2s' }}
                        onMouseOver={(e) => e.currentTarget.style.color = 'var(--primary-400)'}
                        onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-3)'}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
                        </svg>
                    </button>

                    <select
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-1)', fontSize: '0.8rem', padding: '0.3rem', cursor: 'pointer', outline: 'none' }}
                        value={action}
                        onChange={(e) => setAction(e.target.value)}
                        disabled={isLoading}
                    >
                        <option value="text">💬 Text / Code</option>
                        <option value="web_search">🌐 Web Search</option>
                        <option value="image">🎨 Generate Image</option>
                        <option value="jira">🔵 Query Jira</option>
                        <option value="rovo">🤖 Ask Rovo (Jira Search)</option>
                        <option value="confluence">📘 Query Confluence</option>
                    </select>
                </div>
                <textarea
                    ref={textareaRef}
                    className="chat-input"
                    value={text}
                    onChange={handleInput}
                    onKeyDown={handleKeyDown}
                    placeholder={
                        action === 'web_search' ? "Search the live web (e.g. Latest playwright features)..." :
                            action === 'image' ? "Describe the image to generate..." :
                                action === 'jira' ? "Enter Jira Ticket ID (e.g. PROJ-123)..." :
                                    action === 'rovo' ? "Enter JQL Query (e.g. project=PROJ AND status='To Do')..." :
                                        action === 'confluence' ? "Enter Confluence Page ID..." :
                                            "Paste code, ask questions, or attach an image for Visual QA..."
                    }
                    disabled={isLoading}
                    rows={1}
                />
                {isLoading ? (
                    <button
                        type="button"
                        className="send-btn stop-btn"
                        onClick={onStop}
                        title="Stop generating"
                        style={{ backgroundColor: 'var(--red-500)', borderColor: 'var(--red-500)' }}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="6" y="6" width="12" height="12"></rect>
                        </svg>
                    </button>
                ) : (
                    <button
                        type="submit"
                        className="send-btn"
                        disabled={!text.trim() && !imagePreview}
                        title="Send message"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="22" y1="2" x2="11" y2="13"></line>
                            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                        </svg>
                    </button>
                )}
            </div>
        </form>
    )
}

export default ChatInput

