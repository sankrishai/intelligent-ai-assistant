import { useState, useCallback, useEffect, useRef } from 'react'
import Sidebar from './components/Sidebar'
import ChatWindow from './components/ChatWindow'
import ChatInput from './components/ChatInput'
import AiBrainIcon from './components/AiBrainIcon'
import './App.css'

const API_URL = import.meta.env.DEV ? 'http://localhost:8000' : ''

function App() {
  const [messages, setMessages] = useState([])
  const [provider, setProvider] = useState('gemini')
  const [apiKey, setApiKey] = useState('')
  const [temperature, setTemperature] = useState(0.6)
  const [geminiModel, setGeminiModel] = useState('gemini-2.5-flash-lite')
  const [isLoading, setIsLoading] = useState(false)
  const [backendStatus, setBackendStatus] = useState('checking')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [chatAction, setChatAction] = useState('text')
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark')
  const [atlassianConfig, setAtlassianConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('atlassianConfig')
      return saved && saved !== 'undefined' ? JSON.parse(saved) : { domain: '', email: '', token: '' }
    } catch(e) {
      return { domain: '', email: '', token: '' }
    }
  })

  const abortControllerRef = useRef(null)

  const handleStop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    setIsLoading(false)
  }, [])

  // Persist state
  useEffect(() => {
    localStorage.setItem('theme', theme)
  }, [theme])
  useEffect(() => {
    localStorage.setItem('atlassianConfig', JSON.stringify(atlassianConfig))
  }, [atlassianConfig])

  // Check backend health on mount and periodically
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch(`${API_URL}/api/health`)
        if (res.ok) setBackendStatus('connected')
        else setBackendStatus('error')
      } catch {
        setBackendStatus('disconnected')
      }
    }
    checkHealth()
    const interval = setInterval(checkHealth, 15000)
    return () => clearInterval(interval)
  }, [])

  const handleSend = useCallback(async ({ text, action, image }) => {
    if ((!text.trim() && !image) || isLoading) return
    let finalQuery = text

    abortControllerRef.current = new AbortController()
    const { signal } = abortControllerRef.current

    if (action === 'locator_gen') {
      finalQuery = `You are a QA automation expert. Extract all interactive elements from the provided URL or DOM snippet. Generate native locators and a complete Page Object Model (POM) class. Default to Playwright (TypeScript) unless I specify Selenium or Cypress. Be comprehensive and use best-practice selector strategies.\n\nUser Input/DOM: ${text}`
    } else if (action === 'jira' || action === 'rovo') {
      // Atlassian Fetch
      const idMatch = text.match(/^[^\s]+/)
      const id = idMatch ? idMatch[0] : ''
      const extraPrompt = text.slice(id.length).trim() || "Summarize this."

      if (!id) {
        alert(`Please provide a ${action === 'jira' ? 'Jira ID' : 'JQL Query'}.`)
        return
      }

      if (!atlassianConfig.domain || !atlassianConfig.email || !atlassianConfig.token) {
        alert('Please configure your Atlassian Domain, Email, and Token in the sidebar first.')
        return
      }

      setIsLoading(true)
      let endpoint = '/api/atlassian/jira'
      if (action === 'rovo') endpoint = '/api/atlassian/rovo'
      
      const reqBody = {
        domain: atlassianConfig.domain,
        email: atlassianConfig.email,
        api_token: atlassianConfig.token
      }
      if (action === 'jira') reqBody.issue_key = id
      else if (action === 'rovo') reqBody.jql = id

      try {
        const atlassianRes = await fetch(`${API_URL}${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(reqBody),
          signal
        })
        const atlassianData = await atlassianRes.json()
        if (atlassianData.error) {
          setMessages(prev => [...prev, { role: 'user', content: text, timestamp: new Date() }, { role: 'assistant', content: `❌ **Atlassian Fetch Failed:**\n\n${atlassianData.content}`, timestamp: new Date() }])
          setIsLoading(false)
          return
        }

        finalQuery = `Context from Atlassian:\n\n${atlassianData.content}\n\nUser instructions: ${extraPrompt}`
      } catch (e) {
        if (e.name === 'AbortError') return
        setMessages(prev => [...prev, { role: 'user', content: text, timestamp: new Date() }, { role: 'assistant', content: `❌ **Atlassian Fetch Failed:**\n\nCould not connect to backend API.`, timestamp: new Date() }])
        setIsLoading(false)
        return
      }
    } else if (action === 'web_search') {
      setIsLoading(true)
      try {
        const searchRes = await fetch(`${API_URL}/api/web_search`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: text }),
          signal
        })
        const searchData = await searchRes.json()
        if (searchData.error) {
          setMessages(prev => [...prev, { role: 'user', content: text, timestamp: new Date() }, { role: 'assistant', content: `❌ **Web Search Failed:**\n\n${searchData.content}`, timestamp: new Date() }])
          setIsLoading(false)
          return
        }
        finalQuery = `You are a helpful AI assistant. Answer the user's question using the following live web search results as context. If the results do not contain the answer, state that, but otherwise integrate the information naturally.\n\n${searchData.content}\n\nUser Question: ${text}`
      } catch (e) {
        if (e.name === 'AbortError') return
        setMessages(prev => [...prev, { role: 'user', content: text, timestamp: new Date() }, { role: 'assistant', content: `❌ **Web Search Failed:**\n\nCould not connect to backend API.`, timestamp: new Date() }])
        setIsLoading(false)
        return
      }
    }

    const userMsgContent = image ? `[Image Uploaded]\n${text}` : text
    const userMsg = { role: 'user', content: userMsgContent, timestamp: new Date() }
    setMessages(prev => [...prev, userMsg])
    setIsLoading(true)

    try {
      if (action === 'image') {
        const res = await fetch(`${API_URL}/api/generate_image`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: text,
            api_key: apiKey
          }),
          signal
        })
        const data = await res.json()
        const assistantMsg = { role: 'assistant', content: data.response, timestamp: new Date() }
        setMessages(prev => [...prev, assistantMsg])
      } else {
        const res = await fetch(`${API_URL}/api/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            provider,
            message: finalQuery,
            api_key: apiKey,
            temperature,
            model_name: geminiModel,
            image_data: image
          }),
          signal
        })
        const data = await res.json()
        const assistantMsg = { role: 'assistant', content: data.response, timestamp: new Date() }
        setMessages(prev => [...prev, assistantMsg])
      }
    } catch (err) {
      if (err.name === 'AbortError') return
      const errorMsg = {
        role: 'assistant',
        content: `**⚠️ Connection Error**\n\nCould not reach the backend server at \`${API_URL}\`.\n\nMake sure the FastAPI server is running:\n\`\`\`bash\ncd backend && python3 -m uvicorn server:app --reload --port 8000\n\`\`\``,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMsg])
    } finally {
      setIsLoading(false)
    }
  }, [provider, apiKey, temperature, geminiModel, isLoading])

  const handleClearChat = useCallback(() => {
    setMessages([])
  }, [])

  const handleExportChat = useCallback(() => {
    if (messages.length === 0) return
    const md = messages.map(m => {
      const role = m.role === 'user' ? '**You**' : '**Assistant**'
      const time = m.timestamp ? new Date(m.timestamp).toLocaleTimeString() : ''
      return `### ${role} ${time ? `_(${time})_` : ''}\n\n${m.content}`
    }).join('\n\n---\n\n')

    const header = `# Intelligent QA AI Assistant — Chat Export\n_Exported on ${new Date().toLocaleString()}_\n\n---\n\n`
    const blob = new Blob([header + md], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `testforge-chat-${Date.now()}.md`
    a.click()
    URL.revokeObjectURL(url)
  }, [messages])

  return (
    <div className={`app-container ${theme}`}>
      <Sidebar
        provider={provider}
        setProvider={setProvider}
        apiKey={apiKey}
        setApiKey={setApiKey}
        temperature={temperature}
        setTemperature={setTemperature}
        geminiModel={geminiModel}
        setGeminiModel={setGeminiModel}
        onClearChat={handleClearChat}
        onExportChat={handleExportChat}
        backendStatus={backendStatus}
        messageCount={messages.length}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        theme={theme}
        setTheme={setTheme}
        chatAction={chatAction}
        setChatAction={setChatAction}
        atlassianConfig={atlassianConfig}
        setAtlassianConfig={setAtlassianConfig}
      />
      <main className="main-content">
        <header className="app-header">
          <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="18" x="3" y="3" rx="2" />
                <path d="M9 3v18" />
                <path d="m16 15-3-3 3-3" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="18" x="3" y="3" rx="2" />
                <path d="M9 3v18" />
                <path d="m14 9 3 3-3 3" />
              </svg>
            )}
          </button>
          <div className="header-icon-wrapper">
            <AiBrainIcon size={36} />
            <div className="header-icon-glow"></div>
          </div>
          <div className="header-text">
            <h1>Intelligent QA AI Assistant</h1>
            <p className="header-credit-text">
              Developed by <a href="https://in.linkedin.com/in/sanjay-krishna" target="_blank" rel="noopener noreferrer" className="header-credit-link"><strong>Sanjay Krishna</strong></a>
            </p>
          </div>
          <div className="header-right">
            <button
              onClick={handleClearChat}
              disabled={messages.length === 0}
              className={`action-btn clear-btn ${messages.length === 0 ? 'disabled' : ''}`}
              style={{ fontSize: '0.7rem', padding: '0.3rem 0.6rem', border: '1px solid var(--border-1)', background: 'transparent' }}
              title="Start a new chat"
            >
              🔄 New Chat
            </button>
          </div>
        </header>
        <div className="header-divider"></div>
        <ChatWindow messages={messages} isLoading={isLoading} onSend={handleSend} />
        <ChatInput onSend={handleSend} isLoading={isLoading} onStop={handleStop} action={chatAction} setAction={setChatAction} />
      </main>
    </div>
  )
}

export default App
