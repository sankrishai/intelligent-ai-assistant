/* Ollama — Llama silhouette */
export function OllamaIcon({ size = 20 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="16" r="15" fill="#1A1A2E" stroke="#333" strokeWidth="1" />
            <path d="M11 24V16C11 12 13 9 16 8C19 9 21 12 21 16V24" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <circle cx="13.5" cy="14" r="1.2" fill="white" />
            <circle cx="18.5" cy="14" r="1.2" fill="white" />
            <path d="M14 18C14 18 15 19.5 16 19.5C17 19.5 18 18 18 18" stroke="white" strokeWidth="1" strokeLinecap="round" fill="none" />
            <path d="M9 13C8 11 8 9 10 8" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            <path d="M23 13C24 11 24 9 22 8" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        </svg>
    )
}

/* Gemini — Google's sparkle */
export function GeminiIcon({ size = 20 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="16" r="15" fill="#1A1A2E" stroke="#333" strokeWidth="1" />
            <path d="M16 7C16.5 12 12.5 15.5 7 16C12.5 16.5 15.5 20 16 25C16.5 20 20 16.5 25 16C20 15.5 16.5 12 16 7Z" fill="url(#gemGrad)" />
            <defs>
                <linearGradient id="gemGrad" x1="7" y1="7" x2="25" y2="25" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#4285F4" /><stop offset="0.5" stopColor="#9B72CB" /><stop offset="1" stopColor="#D96570" />
                </linearGradient>
            </defs>
        </svg>
    )
}

/* OpenAI — Hexagonal logo */
export function OpenAIIcon({ size = 20 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="16" r="15" fill="#1A1A2E" stroke="#333" strokeWidth="1" />
            <path d="M16 7L23 11V21L16 25L9 21V11L16 7Z" stroke="#10A37F" strokeWidth="1.5" fill="none" strokeLinejoin="round" />
            <path d="M16 7V16M16 16L23 11M16 16L9 11M16 16V25M16 16L23 21M16 16L9 21" stroke="#10A37F" strokeWidth="1" opacity="0.5" />
            <circle cx="16" cy="16" r="2" fill="#10A37F" />
        </svg>
    )
}

/* Claude — Anthropic 'A' */
export function ClaudeIcon({ size = 20 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="16" r="15" fill="#1A1A2E" stroke="#333" strokeWidth="1" />
            <path d="M10 24L16 8L22 24" stroke="#D4A574" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d="M12 20H20" stroke="#D4A574" strokeWidth="2" strokeLinecap="round" />
            <circle cx="16" cy="8" r="1.5" fill="#D4A574" opacity="0.6" />
        </svg>
    )
}

/* DeepSeek — Brain/node network */
export function DeepSeekIcon({ size = 20 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="16" r="15" fill="#1A1A2E" stroke="#333" strokeWidth="1" />
            <circle cx="16" cy="12" r="2.5" fill="#4D6BFE" />
            <circle cx="10" cy="20" r="2" fill="#4D6BFE" opacity="0.8" />
            <circle cx="22" cy="20" r="2" fill="#4D6BFE" opacity="0.8" />
            <circle cx="16" cy="24" r="1.5" fill="#4D6BFE" opacity="0.6" />
            <path d="M16 14.5V22.5M14 13L10.5 18.5M18 13L21.5 18.5M12 20H20" stroke="#4D6BFE" strokeWidth="1" opacity="0.5" strokeLinecap="round" />
        </svg>
    )
}

/* Mistral — Wind/sail */
export function MistralIcon({ size = 20 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="16" r="15" fill="#1A1A2E" stroke="#333" strokeWidth="1" />
            <rect x="8" y="9" width="4" height="4" rx="0.5" fill="#F7D046" />
            <rect x="14" y="9" width="4" height="4" rx="0.5" fill="#F7D046" />
            <rect x="20" y="9" width="4" height="4" rx="0.5" fill="#FF7000" />
            <rect x="8" y="14.5" width="4" height="4" rx="0.5" fill="#F7D046" />
            <rect x="20" y="14.5" width="4" height="4" rx="0.5" fill="#FF7000" />
            <rect x="8" y="20" width="4" height="4" rx="0.5" fill="#F7D046" />
            <rect x="14" y="20" width="4" height="4" rx="0.5" fill="#FF7000" />
            <rect x="20" y="20" width="4" height="4" rx="0.5" fill="#FF7000" />
        </svg>
    )
}

/* KimiCode / Moonshot — Crescent moon */
export function KimiIcon({ size = 20 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="16" r="15" fill="#1A1A2E" stroke="#333" strokeWidth="1" />
            <path d="M20 8C15 9.5 12 13.5 12 18C12 22.5 15 25.5 19 26C14 25.5 10 21.5 10 16.5C10 11.5 14 8 20 8Z" fill="url(#moonGrad)" />
            <circle cx="21" cy="11" r="1" fill="#FFD700" opacity="0.8" />
            <circle cx="23" cy="14" r="0.6" fill="#FFD700" opacity="0.5" />
            <circle cx="22" cy="20" r="0.8" fill="#FFD700" opacity="0.6" />
            <defs>
                <linearGradient id="moonGrad" x1="10" y1="8" x2="20" y2="26" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#FFE082" /><stop offset="1" stopColor="#FFB300" />
                </linearGradient>
            </defs>
        </svg>
    )
}

/* Groq — Lightning */
export function GroqIcon({ size = 20 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="16" r="15" fill="#1A1A2E" stroke="#333" strokeWidth="1" />
            <path d="M18 8L10 18H16L14 26L22 16H16L18 8Z" fill="#F55036" stroke="#F55036" strokeWidth="1" strokeLinejoin="round" />
        </svg>
    )
}
