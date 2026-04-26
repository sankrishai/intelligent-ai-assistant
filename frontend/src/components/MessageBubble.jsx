import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

function CopyButton({ text }) {
    const [copied, setCopied] = useState(false)

    const handleCopy = () => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <button className={`copy-btn ${copied ? 'copied' : ''}`} onClick={handleCopy} title="Copy code">
            {copied ? '✓ Copied' : '📋 Copy'}
        </button>
    )
}

function MessageBubble({ role, content, timestamp }) {
    const isUser = role === 'user'
    const timeStr = timestamp ? new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''

    return (
        <div className={`message-row ${isUser ? 'user-row' : 'assistant-row'}`}>
            <div className={`avatar ${isUser ? 'user-avatar' : 'assistant-avatar'}`}>
                {isUser ? '👤' : '🤖'}
            </div>
            <div className="message-content">
                <div className="message-meta">
                    <span className="message-role">{isUser ? 'You' : 'Intelligent QA AI Assistant'}</span>
                    {timeStr && <span className="message-time">{timeStr}</span>}
                </div>
                <div className={`message-bubble ${isUser ? 'user-bubble' : 'assistant-bubble'}`}>
                    <ReactMarkdown
                        components={{
                            code({ node, inline, className, children, ...props }) {
                                const match = /language-(\w+)/.exec(className || '')
                                const codeString = String(children).replace(/\n$/, '')

                                return !inline && match ? (
                                    <div className="code-block-wrapper">
                                        <div className="code-block-header">
                                            <span className="code-lang">{match[1]}</span>
                                            <CopyButton text={codeString} />
                                        </div>
                                        <SyntaxHighlighter
                                            style={oneDark}
                                            language={match[1]}
                                            PreTag="div"
                                            customStyle={{
                                                borderRadius: '0 0 10px 10px',
                                                fontSize: '0.82rem',
                                                margin: '0',
                                                borderTop: 'none'
                                            }}
                                            {...props}
                                        >
                                            {codeString}
                                        </SyntaxHighlighter>
                                    </div>
                                ) : !inline ? (
                                    <div className="code-block-wrapper">
                                        <div className="code-block-header">
                                            <span className="code-lang">code</span>
                                            <CopyButton text={codeString} />
                                        </div>
                                        <pre className="plain-code-block"><code>{children}</code></pre>
                                    </div>
                                ) : (
                                    <code className="inline-code" {...props}>
                                        {children}
                                    </code>
                                )
                            }
                        }}
                    >
                        {content}
                    </ReactMarkdown>
                </div>
            </div>
        </div>
    )
}

export default MessageBubble
