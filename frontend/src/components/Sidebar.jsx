import { useState } from 'react'
import { GeminiIcon, OpenAIIcon, ClaudeIcon, DeepSeekIcon, MistralIcon, KimiIcon, GroqIcon } from './ProviderIcons'
import AiBrainIcon from './AiBrainIcon'

const PROVIDERS = [
    { id: 'gemini', label: 'Google Gemini', badge: 'Cloud', icon: GeminiIcon },
    { id: 'openai', label: 'OpenAI', badge: 'Cloud', icon: OpenAIIcon },
    { id: 'claude', label: 'Anthropic Claude', badge: 'Cloud', icon: ClaudeIcon },
    { id: 'deepseek', label: 'DeepSeek', badge: 'Cloud', icon: DeepSeekIcon },
    { id: 'mistral', label: 'Mistral AI', badge: 'Cloud', icon: MistralIcon },
    { id: 'kimi', label: 'KimiCode', badge: 'Cloud', icon: KimiIcon },
    { id: 'groq', label: 'Groq', badge: 'Cloud', icon: GroqIcon },
]

const PROVIDER_MODELS = {
    gemini: [
        { id: 'gemini-3.1-pro', label: 'Gemini 3.1 Pro' },
        { id: 'gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash-Lite' },
        { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
        { id: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
        { id: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash' },
        { id: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
        { id: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash' },
    ],
    openai: [
        { id: 'gpt-4.5-preview', label: 'GPT-4.5 Preview' },
        { id: 'o1', label: 'o1' },
        { id: 'o1-mini', label: 'o1-mini' },
        { id: 'o3-mini', label: 'o3-mini' },
        { id: 'gpt-4o', label: 'GPT-4o' },
        { id: 'gpt-4o-mini', label: 'GPT-4o Mini' },
        { id: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
    ],
    claude: [
        { id: 'claude-opus-4-7', label: 'Claude Opus 4.7' },
        { id: 'claude-sonnet-4-7', label: 'Claude Sonnet 4.7' },
        { id: 'claude-opus-4-6', label: 'Claude Opus 4.6' },
        { id: 'claude-sonnet-4-6', label: 'Claude Sonnet 4.6' },
        { id: 'claude-haiku-4-6', label: 'Claude Haiku 4.6' },
        { id: 'claude-3-7-sonnet-20250219', label: 'Claude 3.7 Sonnet' },
        { id: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet' },
        { id: 'claude-3-5-haiku-20241022', label: 'Claude 3.5 Haiku' },
        { id: 'claude-3-opus-20240229', label: 'Claude 3 Opus' },
    ],
    deepseek: [
        { id: 'deepseek-chat', label: 'DeepSeek V3' },
        { id: 'deepseek-reasoner', label: 'DeepSeek R1' },
    ],
    mistral: [
        { id: 'mistral-large-latest', label: 'Mistral Large' },
        { id: 'mistral-medium-latest', label: 'Mistral Medium' },
        { id: 'mistral-small-latest', label: 'Mistral Small' },
        { id: 'codestral-latest', label: 'Codestral' },
    ],
    kimi: [
        { id: 'kimi-k2.5', label: 'Kimi K2.5' },
    ],
    groq: [
        { id: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70B' },
        { id: 'llama-3.1-8b-instant', label: 'Llama 3.1 8B' },
        { id: 'deepseek-r1-distill-llama-70b', label: 'DeepSeek R1 Llama 70B' },
        { id: 'mixtral-8x7b-32768', label: 'Mixtral 8x7B' },
        { id: 'gemma2-9b-it', label: 'Gemma 2 9B' },
    ],
}

const API_KEY_LABELS = {
    gemini: { label: 'Gemini API Key', hint: 'Get from aistudio.google.com' },
    openai: { label: 'OpenAI API Key', hint: 'Get from platform.openai.com' },
    claude: { label: 'Anthropic API Key', hint: 'Get from console.anthropic.com' },
    deepseek: { label: 'DeepSeek API Key', hint: 'Get from platform.deepseek.com' },
    mistral: { label: 'Mistral API Key', hint: 'Get from console.mistral.ai' },
    kimi: { label: 'Kimi API Key', hint: 'Get from platform.moonshot.ai' },
    groq: { label: 'Groq API Key', hint: 'Get from console.groq.com' },
}

function Sidebar({ provider, setProvider, apiKey, setApiKey, temperature, setTemperature, geminiModel, setGeminiModel, onClearChat, onExportChat, backendStatus, messageCount, isOpen, onToggle, theme, setTheme, atlassianConfig, setAtlassianConfig }) {
    const [showAtlassian, setShowAtlassian] = useState(false)
    const [showApiKey, setShowApiKey] = useState(false)

    const activeProvider = PROVIDERS.find(p => p.id === provider)
    const models = PROVIDER_MODELS[provider] || []
    const apiKeyInfo = API_KEY_LABELS[provider]
    const needsApiKey = true
    const ActiveIcon = activeProvider?.icon

    const handleModelChange = (e) => {
        setGeminiModel(e.target.value)
    }

    const currentModel = geminiModel || (models[0]?.id || '')

    return (
        <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
            <div className="sidebar-brand">
                <span className="brand-icon"><AiBrainIcon size={28} /></span>
                <div>
                    <div className="brand-name">Intelligent QA AI Assistant</div>
                    <div className="brand-version">v2.0 — React Edition</div>
                </div>
                <button
                    className="theme-toggle"
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                >
                    {theme === 'dark' ? '☀️' : '🌙'}
                </button>
            </div>

            <div className="sidebar-scroll">
                {/* Connection Status */}
                <div className="sidebar-section">
                    <div className={`connection-card ${backendStatus}`}>
                        <div className={`conn-dot ${backendStatus}`}></div>
                        <div className="conn-info">
                            <span className="conn-label">Backend API</span>
                            <span className="conn-status">
                                {backendStatus === 'connected' ? 'Connected' : backendStatus === 'checking' ? 'Checking...' : 'Disconnected'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Provider Selection - Dropdown */}
                <div className="sidebar-section">
                    <label className="section-label">AI Provider</label>
                    <div className="provider-dropdown-wrapper">
                        {ActiveIcon && (
                            <span className="provider-dropdown-icon">
                                <ActiveIcon size={20} />
                            </span>
                        )}
                        <select
                            className="provider-dropdown"
                            value={provider}
                            onChange={(e) => {
                                const newProvider = e.target.value
                                setProvider(newProvider)
                                setApiKey('')
                                // Auto-select the first available model for the new provider
                                const newModels = PROVIDER_MODELS[newProvider] || []
                                if (newModels.length > 0) {
                                    setGeminiModel(newModels[0].id)
                                }
                            }}
                        >
                            {PROVIDERS.map(p => (
                                <option key={p.id} value={p.id}>
                                    {p.label}
                                </option>
                            ))}
                        </select>
                        <span className="provider-type-badge badge-cloud">
                            Cloud
                        </span>
                    </div>
                </div>

                {/* Model Selection */}
                {models.length > 0 && (
                    <div className="sidebar-section">
                        <label className="section-label">🧠 Model</label>
                        <select
                            className="model-select"
                            value={currentModel}
                            onChange={handleModelChange}
                        >
                            {models.map(m => (
                                <option key={m.id} value={m.id}>{m.label}</option>
                            ))}
                        </select>
                        <div className="model-card">
                            <div className="model-card-header">
                                <span className="model-card-icon">⚡</span>
                                <span className="model-card-title">Active Model</span>
                            </div>
                            <div className="model-card-value">{currentModel}</div>
                        </div>
                    </div>
                )}

                {/* API Key */}
                {needsApiKey && apiKeyInfo && (
                    <div className="sidebar-section">
                        <label className="section-label">🔑 {apiKeyInfo.label}</label>
                        <div className="input-wrapper">
                            <input
                                type={showApiKey ? "text" : "password"}
                                className="api-key-input"
                                placeholder={`Enter ${apiKeyInfo.label}...`}
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                style={{ paddingRight: '50px' }}
                            />
                            <div style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', display: 'flex', gap: '4px', alignItems: 'center' }}>
                                {apiKey && <span className="input-check" style={{ position: 'static', transform: 'none' }}>✓</span>}
                                <span
                                    onClick={() => setShowApiKey(!showApiKey)}
                                    style={{ cursor: 'pointer', fontSize: '0.9rem', opacity: 0.6 }}
                                    title={showApiKey ? "Hide Key" : "Show Key"}
                                >
                                    {showApiKey ? '🙈' : '👁️'}
                                </span>
                            </div>
                        </div>
                        <span className="help-text">{apiKeyInfo.hint}</span>
                    </div>
                )}


                {/* Temperature */}
                <div className="sidebar-section">
                    <label className="section-label">🌡️ Temperature</label>
                    <div className="temp-display">{temperature.toFixed(1)}</div>
                    <input
                        type="range"
                        className="temp-slider"
                        min="0"
                        max="1"
                        step="0.1"
                        value={temperature}
                        onChange={(e) => setTemperature(parseFloat(e.target.value))}
                    />
                    <div className="slider-labels">
                        <span>Precise</span>
                        <span>Creative</span>
                    </div>
                </div>

                <div className="sidebar-divider"></div>

                {/* Atlassian Support */}
                <div className="sidebar-section">
                    <div
                        className="section-label"
                        style={{ display: 'flex', justifyContent: 'space-between', cursor: 'pointer', paddingRight: '5px' }}
                        onClick={() => setShowAtlassian(!showAtlassian)}
                    >
                        <span>Atlassian Integration</span>
                        <span>{showAtlassian ? '▼' : '▶'}</span>
                    </div>
                    {showAtlassian && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.3rem' }}>
                            <div className="input-wrapper">
                                <input
                                    type="text"
                                    className="api-key-input"
                                    placeholder="Domain (e.g. company.atlassian.net)"
                                    value={atlassianConfig.domain}
                                    onChange={(e) => setAtlassianConfig({ ...atlassianConfig, domain: e.target.value })}
                                />
                            </div>
                            <div className="input-wrapper">
                                <input
                                    type="email"
                                    className="api-key-input"
                                    placeholder="Account Email"
                                    value={atlassianConfig.email}
                                    onChange={(e) => setAtlassianConfig({ ...atlassianConfig, email: e.target.value })}
                                />
                            </div>
                            <div className="input-wrapper">
                                <input
                                    type="password"
                                    className="api-key-input"
                                    placeholder="Jira API Token"
                                    value={atlassianConfig.token}
                                    onChange={(e) => setAtlassianConfig({ ...atlassianConfig, token: e.target.value })}
                                />
                            </div>
                            <span className="help-text">Type <strong>/jira PROJ-123</strong>, <strong>/confluence 12345</strong>, or <strong>/rovo &lt;JQL&gt;</strong> in chat to import.</span>
                        </div>
                    )}
                </div>

                <div className="sidebar-divider"></div>

                {/* Quick Guide */}
                <div className="sidebar-section">
                    <label className="section-label">Quick Guide</label>
                    <div className="guide-cards">
                        <div className="guide-card">
                            <span className="guide-icon">📝</span>
                            <span>Paste code to generate tests</span>
                        </div>
                        <div className="guide-card">
                            <span className="guide-icon">🔍</span>
                            <span>Ask for code reviews</span>
                        </div>
                        <div className="guide-card">
                            <span className="guide-icon">🐛</span>
                            <span>Debug errors & logs</span>
                        </div>
                    </div>
                </div>

                <div className="sidebar-divider"></div>

                {/* Actions */}
                <div className="sidebar-section actions-section">
                    <button className="action-btn export-btn" onClick={onExportChat} disabled={messageCount === 0}>
                        📥 Export Chat
                        {messageCount > 0 && <span className="msg-count">{messageCount}</span>}
                    </button>
                    <button className="action-btn clear-btn" onClick={onClearChat} disabled={messageCount === 0}>
                        🗑️ Clear Chat
                    </button>
                </div>
            </div>

            <div className="sidebar-footer">
                <span>Developed by <a href="https://in.linkedin.com/in/sanjay-krishna" target="_blank" rel="noopener noreferrer" className="footer-link"><strong>Sanjay Krishna</strong></a></span>
            </div>
        </aside>
    )
}

export default Sidebar
