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
            {copied ? '✓ Copied' : 'Copy'}
        </button>
    )
}

function DownloadButton({ text, language }) {
    const extMap = { javascript: 'js', typescript: 'ts', python: 'py', java: 'java', csharp: 'cs', go: 'go', rust: 'rs', bash: 'sh', html: 'html', css: 'css', json: 'json', yaml: 'yml', sql: 'sql' }
    const ext = extMap[language] || language || 'txt'

    const handleDownload = () => {
        const blob = new Blob([text], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `code.${ext}`
        a.click()
        URL.revokeObjectURL(url)
    }

    return (
        <button className="code-download-btn" onClick={handleDownload} title="Download file">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            .{ext}
        </button>
    )
}

function MessageBubble({ role, content, timestamp, onRegenerate }) {
    const [copiedAll, setCopiedAll] = useState(false)
    const isUser = role === 'user'
    const timeStr = timestamp ? new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''

    const handleCopyAll = () => {
        navigator.clipboard.writeText(content)
        setCopiedAll(true)
        setTimeout(() => setCopiedAll(false), 2000)
    }

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
                                            <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                                                <DownloadButton text={codeString} language={match[1]} />
                                                <CopyButton text={codeString} />
                                            </div>
                                        </div>
                                        <SyntaxHighlighter
                                            style={oneDark}
                                            language={match[1]}
                                            PreTag="div"
                                            showLineNumbers={true}
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
                {!isUser && content && (
                    <div className="message-actions">
                        <button
                            className={`msg-action-btn ${copiedAll ? 'copied' : ''}`}
                            onClick={handleCopyAll}
                            title="Copy entire response"
                        >
                            {copiedAll ? '✓ Copied' : 'Copy All'}
                        </button>
                        {onRegenerate && (
                            <button
                                className="msg-action-btn"
                                onClick={onRegenerate}
                                title="Regenerate this response"
                            >
                                Regenerate
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default MessageBubble
