function AiBrainIcon({ size = 24, className = '' }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            {/* Brain outline */}
            <path
                d="M32 8C24 8 18 12 16 18C12 18 8 22 8 28C8 32 10 35 13 37C12 39 12 42 14 45C16 48 19 49 22 49C23 52 26 56 32 56C38 56 41 52 42 49C45 49 48 48 50 45C52 42 52 39 51 37C54 35 56 32 56 28C56 22 52 18 48 18C46 12 40 8 32 8Z"
                fill="url(#brainGrad)"
                stroke="white"
                strokeWidth="1.5"
                strokeLinejoin="round"
            />
            {/* Center line */}
            <path
                d="M32 16V48"
                stroke="rgba(255,255,255,0.4)"
                strokeWidth="1"
                strokeDasharray="2 2"
            />
            {/* Circuit nodes - left */}
            <circle cx="22" cy="26" r="2.5" fill="white" opacity="0.9" />
            <circle cx="20" cy="38" r="2.5" fill="white" opacity="0.9" />
            <circle cx="26" cy="44" r="2" fill="white" opacity="0.7" />
            {/* Circuit nodes - right */}
            <circle cx="42" cy="26" r="2.5" fill="white" opacity="0.9" />
            <circle cx="44" cy="38" r="2.5" fill="white" opacity="0.9" />
            <circle cx="38" cy="44" r="2" fill="white" opacity="0.7" />
            {/* Circuit lines - left */}
            <path d="M22 26L28 30L32 28" stroke="white" strokeWidth="1.2" opacity="0.6" strokeLinecap="round" />
            <path d="M20 38L26 36L32 38" stroke="white" strokeWidth="1.2" opacity="0.6" strokeLinecap="round" />
            <path d="M26 44L30 42" stroke="white" strokeWidth="1.2" opacity="0.5" strokeLinecap="round" />
            {/* Circuit lines - right */}
            <path d="M42 26L36 30L32 28" stroke="white" strokeWidth="1.2" opacity="0.6" strokeLinecap="round" />
            <path d="M44 38L38 36L32 38" stroke="white" strokeWidth="1.2" opacity="0.6" strokeLinecap="round" />
            <path d="M38 44L34 42" stroke="white" strokeWidth="1.2" opacity="0.5" strokeLinecap="round" />
            {/* Center glow dot */}
            <circle cx="32" cy="32" r="3" fill="white" opacity="0.95" />
            <circle cx="32" cy="32" r="5" fill="white" opacity="0.15" />
            {/* Gradient */}
            <defs>
                <linearGradient id="brainGrad" x1="8" y1="8" x2="56" y2="56" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#818CF8" />
                    <stop offset="1" stopColor="#6366F1" />
                </linearGradient>
            </defs>
        </svg>
    )
}

export default AiBrainIcon
