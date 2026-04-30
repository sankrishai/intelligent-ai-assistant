import { useState, useEffect } from 'react'
import { GeminiIcon, OpenAIIcon, ClaudeIcon, DeepSeekIcon, MistralIcon, KimiIcon, GroqIcon } from './ProviderIcons'
import AiBrainIcon from './AiBrainIcon'

const PROVIDERS = [
    { id: 'gemini', label: 'Google Gemini', icon: GeminiIcon },
    { id: 'openai', label: 'OpenAI', icon: OpenAIIcon },
    { id: 'claude', label: 'Anthropic Claude', icon: ClaudeIcon },
    { id: 'deepseek', label: 'DeepSeek', icon: DeepSeekIcon },
    { id: 'mistral', label: 'Mistral AI', icon: MistralIcon },
    { id: 'kimi', label: 'KimiCode', icon: KimiIcon },
    { id: 'groq', label: 'Groq', icon: GroqIcon },
]

const PROVIDER_MODELS = {
    gemini: [
        { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
        { id: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
        { id: 'gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash-Lite' },
        { id: 'gemini-3.1-pro-preview', label: 'Gemini 3.1 Pro (Preview)' },
        { id: 'gemini-3-flash-preview', label: 'Gemini 3 Flash (Preview)' },
    ],
    openai: [
        { id: 'gpt-4o', label: 'GPT-4o' },
        { id: 'gpt-4o-mini', label: 'GPT-4o Mini' },
        { id: 'gpt-4.1', label: 'GPT-4.1' },
        { id: 'gpt-4.1-mini', label: 'GPT-4.1 Mini' },
        { id: 'gpt-4.1-nano', label: 'GPT-4.1 Nano' },
        { id: 'o4-mini', label: 'o4-mini' },
        { id: 'o3', label: 'o3' },
        { id: 'o3-mini', label: 'o3-mini' },
    ],
    claude: [
        { id: 'claude-opus-4-7', label: 'Claude Opus 4.7' },
        { id: 'claude-sonnet-4-6', label: 'Claude Sonnet 4.6' },
        { id: 'claude-opus-4-6', label: 'Claude Opus 4.6' },
        { id: 'claude-haiku-4-5', label: 'Claude Haiku 4.5' },
        { id: 'claude-sonnet-4-5', label: 'Claude Sonnet 4.5' },
        { id: 'claude-3-7-sonnet-20250219', label: 'Claude 3.7 Sonnet' },
        { id: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet' },
    ],
    deepseek: [
        { id: 'deepseek-chat', label: 'DeepSeek V3' },
        { id: 'deepseek-reasoner', label: 'DeepSeek R1' },
    ],
    mistral: [
        { id: 'mistral-large-latest', label: 'Mistral Large' },
        { id: 'mistral-small-latest', label: 'Mistral Small' },
        { id: 'codestral-latest', label: 'Codestral' },
        { id: 'magistral-medium-2509', label: 'Magistral Medium' },
        { id: 'magistral-small-2509', label: 'Magistral Small' },
        { id: 'devstral-2512', label: 'Devstral' },
    ],
    kimi: [
        { id: 'kimi-k2.6', label: 'Kimi K2.6' },
        { id: 'kimi-k2.5', label: 'Kimi K2.5' },
    ],
    groq: [
        { id: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70B' },
        { id: 'llama-3.1-8b-instant', label: 'Llama 3.1 8B' },
        { id: 'meta-llama/llama-4-scout-17b-16e-instruct', label: 'Llama 4 Scout 17B' },
        { id: 'qwen/qwen3-32b', label: 'Qwen3 32B' },
        { id: 'gemma2-9b-it', label: 'Gemma 2 9B' },
    ],
}

const API_KEY_LABELS = {
    gemini: { label: 'Gemini API Key', hint: 'Get from aistudio.google.com' },
    openai: { label: 'OpenAI API Key', hint: 'Get from platform.openai.com' },
    claude: { label: 'Anthropic API Key', hint: 'Get from console.anthropic.com' },
    deepseek: { label: 'DeepSeek API Key', hint: 'Get from platform.deepseek.com' },
    mistral: { label: 'Mistral API Key', hint: 'Get from console.mistral.ai' },
    kimi: { label: 'Kimi API Key', hint: 'Get from platform.kimi.ai' },
    groq: { label: 'Groq API Key', hint: 'Get from console.groq.com' },
}

const CAPABILITIES = [
    { id: 'text', label: 'Text / Code Gen', icon: '💬', description: 'Generate tests, review code' },
    { id: 'locator_gen', label: 'DOM Locator Gen', icon: '🔍', description: 'POM & native locators' },
    { id: 'web_search', label: 'Web Search', icon: '🌐', description: 'Live web results' },
    { id: 'image', label: 'Image Generation', icon: '🎨', description: 'DALL-E 3 images' },
    { id: 'jira', label: 'Query Jira', icon: '🔵', description: 'Fetch Jira tickets' },
    { id: 'rovo', label: 'Rovo (JQL Search)', icon: '🤖', description: 'Search Jira via JQL' },
]

function Sidebar({ provider, setProvider, apiKey, setApiKey, temperature, setTemperature, geminiModel, setGeminiModel, streamingEnabled, setStreamingEnabled, onClearChat, onExportChat, backendStatus, messageCount, isOpen, onToggle, theme, setTheme, chatAction, setChatAction, atlassianConfig, setAtlassianConfig }) {
    const [showIntegrations, setShowIntegrations] = useState(false)
    const [showApiKey, setShowApiKey] = useState(false)
    const [configOpen, setConfigOpen] = useState(() => localStorage.getItem('sb_config') !== 'false')
    const [capsOpen, setCapsOpen] = useState(() => localStorage.getItem('sb_caps') !== 'false')
    const [integrationsOpen, setIntegrationsOpen] = useState(() => localStorage.getItem('sb_integrations') !== 'false')

    const toggleConfig = () => { const v = !configOpen; setConfigOpen(v); localStorage.setItem('sb_config', v) }
    const toggleCaps = () => { const v = !capsOpen; setCapsOpen(v); localStorage.setItem('sb_caps', v) }
    const toggleIntegrations = () => { const v = !integrationsOpen; setIntegrationsOpen(v); localStorage.setItem('sb_integrations', v) }

    const activeProvider = PROVIDERS.find(p => p.id === provider)
    const models = PROVIDER_MODELS[provider] || []
    const apiKeyInfo = API_KEY_LABELS[provider]
    const ActiveIcon = activeProvider?.icon

    const handleModelChange = (e) => {
        setGeminiModel(e.target.value)
    }

    // Validate stored model against current provider's model list
    const isValidModel = models.some(m => m.id === geminiModel)
    const currentModel = (isValidModel && geminiModel) || (models[0]?.id || '')

    // Auto-correct stale model from localStorage
    useEffect(() => {
        if (!isValidModel && models.length > 0) {
            setGeminiModel(models[0].id)
        }
    }, [provider, isValidModel, models, setGeminiModel])

    return (
        <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
            {/* ── Brand Header with inline status ── */}
            <div className="sidebar-brand">
                <span className="brand-icon"><AiBrainIcon size={28} /></span>
                <div>
                    <div className="brand-name">Intelligent QA Assistant</div>
                    <div className="brand-version">
                        Multi-Provider AI for Testing
                        <span className="brand-status-separator">•</span>
                        <span className={`brand-status-dot ${backendStatus}`}></span>
                        <span className={`brand-status-text ${backendStatus}`}>
                            {backendStatus === 'connected' ? 'Online' : backendStatus === 'checking' ? 'Checking' : 'Offline'}
                        </span>
                    </div>
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
                {/* ── CONFIGURATION ── */}
                <div className="sidebar-section-header" onClick={toggleConfig} style={{ cursor: 'pointer' }}>
                    <span className="section-header-line"></span>
                    <span className="section-header-text">Configuration</span>
                    <span className="section-header-line"></span>
                    <span className={`section-chevron ${configOpen ? 'open' : ''}`}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                    </span>
                </div>

                <div className={`section-content-wrapper ${configOpen ? 'open' : ''}`}>
                    <div className="section-content-inner">
                        {/* Provider */}
                        <div className="sidebar-section">
                            <label className="section-label">Provider</label>
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
                            </div>
                        </div>

                        {/* Model */}
                        {models.length > 0 && (
                            <div className="sidebar-section">
                                <label className="section-label">Model</label>
                                <select
                                    className="model-select"
                                    value={currentModel}
                                    onChange={handleModelChange}
                                >
                                    {models.map(m => (
                                        <option key={m.id} value={m.id}>{m.label}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* API Key */}
                        {apiKeyInfo && (
                            <div className="sidebar-section">
                                <label className="section-label">🔑 {apiKeyInfo.label}</label>
                                <div className="input-wrapper">
                                    <input
                                        type={showApiKey ? "text" : "password"}
                                        className="api-key-input"
                                        placeholder={`Enter ${apiKeyInfo.label}...`}
                                        value={apiKey}
                                        onChange={(e) => setApiKey(e.target.value)}
                                        style={{ paddingRight: '70px' }}
                                    />
                                    <div style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', display: 'flex', gap: '4px', alignItems: 'center' }}>
                                        {apiKey && <span className="api-saved-badge">Saved ✓</span>}
                                        <span
                                            onClick={() => setShowApiKey(!showApiKey)}
                                            style={{ cursor: 'pointer', fontSize: '0.9rem', opacity: 0.6 }}
                                            title={showApiKey ? "Hide Key" : "Show Key"}
                                        >
                                            {showApiKey ? '🙈' : '👁️'}
                                        </span>
                                    </div>
                                </div>
                                <span className="help-text">{apiKeyInfo.hint} • Auto-saved to browser</span>
                            </div>
                        )}

                        {/* Temperature — Compact Inline */}
                        <div className="sidebar-section">
                            <div className="temp-inline">
                                <label className="section-label" style={{ marginBottom: 0 }}>🌡️ Temperature</label>
                                <span className="temp-value">{temperature.toFixed(1)}</span>
                            </div>
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

                        {/* Streaming Toggle */}
                        <div className="sidebar-section streaming-toggle-section">
                            <div className="streaming-toggle-row">
                                <span className="streaming-label">⚡ Streaming</span>
                                <label className="toggle-switch">
                                    <input
                                        type="checkbox"
                                        checked={streamingEnabled}
                                        onChange={(e) => setStreamingEnabled(e.target.checked)}
                                    />
                                    <span className="toggle-slider"></span>
                                </label>
                                <span className="streaming-status">{streamingEnabled ? 'ON' : 'OFF'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── CAPABILITIES ── */}
                <div className="sidebar-section-header" onClick={toggleCaps} style={{ cursor: 'pointer' }}>
                    <span className="section-header-line"></span>
                    <span className="section-header-text">Capabilities</span>
                    <span className="section-header-line"></span>
                    <span className={`section-chevron ${capsOpen ? 'open' : ''}`}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                    </span>
                </div>

                <div className={`section-content-wrapper ${capsOpen ? 'open' : ''}`}>
                    <div className="section-content-inner">
                        <div className="capabilities-list">
                            {CAPABILITIES.map(cap => (
                                <button
                                    key={cap.id}
                                    className={`capability-pill ${chatAction === cap.id ? 'active' : ''}`}
                                    onClick={() => setChatAction(cap.id)}
                                    title={cap.description}
                                >
                                    <span className="cap-icon">{cap.icon}</span>
                                    <div className="cap-content">
                                        <span className="cap-label">{cap.label}</span>
                                        <span className="cap-desc">{cap.description}</span>
                                    </div>
                                    {chatAction === cap.id && <span className="cap-active-dot"></span>}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── INTEGRATIONS ── */}
                <div className="sidebar-section-header" onClick={toggleIntegrations} style={{ cursor: 'pointer' }}>
                    <span className="section-header-line"></span>
                    <span className="section-header-text">Integrations</span>
                    <span className="section-header-line"></span>
                    <span className={`section-chevron ${integrationsOpen ? 'open' : ''}`}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                    </span>
                </div>

                <div className={`section-content-wrapper ${integrationsOpen ? 'open' : ''}`}>
                    <div className="section-content-inner">
                        <div className="sidebar-section">
                            <div
                                className="integration-toggle"
                                onClick={() => setShowIntegrations(!showIntegrations)}
                            >
                                <span className="integration-toggle-icon">🔗</span>
                                <span className="integration-toggle-label">Jira / Rovo Setup</span>
                                <span className={`integration-chevron ${showIntegrations ? 'open' : ''}`}>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="6 9 12 15 18 9"></polyline>
                                    </svg>
                                </span>
                            </div>
                            {showIntegrations && (
                                <div className="integration-fields">
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
                                    <span className="help-text">Select <strong>Query Jira</strong> or <strong>Rovo</strong> from Capabilities above to use.</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="sidebar-divider"></div>
            </div>

            {/* Actions — pinned above footer */}
            <div className="sidebar-actions-pinned">
                <button className="action-btn export-btn" onClick={onExportChat} disabled={messageCount === 0}>
                    📥 Export Chat
                    {messageCount > 0 && <span className="msg-count">{messageCount}</span>}
                </button>
                <button className="action-btn clear-btn" onClick={onClearChat} disabled={messageCount === 0}>
                    🗑️ Clear Chat
                </button>
            </div>

            <div className="sidebar-footer">
                <span>Developed by <a href="https://in.linkedin.com/in/sanjay-krishna" target="_blank" rel="noopener noreferrer" className="footer-link"><strong>Sanjay Krishna</strong></a></span>
            </div>
        </aside>
    )
}

export default Sidebar
