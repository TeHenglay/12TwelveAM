import React, { useEffect, useRef, useState } from "react";

export interface ScrambledTextProps {
  radius?: number;
  duration?: number;
  speed?: number;
  scrambleChars?: string;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

const ScrambledText: React.FC<ScrambledTextProps> = ({
  radius = 100,
  duration = 1.2,
  speed = 0.5,
  scrambleChars = "•",
  className = "",
  style = {},
  children,
}) => {
  const originalText = children as string;
  const [displayChars, setDisplayChars] = useState(originalText.split(''));
  const [scramblingChars, setScramblingChars] = useState<Set<number>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);
  const charRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const timeoutsRef = useRef<Map<number, NodeJS.Timeout>>(new Map());

  const scrambleChar = (charIndex: number) => {
    if (originalText[charIndex] === ' ' || originalText[charIndex] === '-') {
      return; // Don't scramble spaces or dashes
    }

    setScramblingChars(prev => new Set(prev).add(charIndex));
    
    const scrambleInterval = setInterval(() => {
      setDisplayChars(prev => {
        const newChars = [...prev];
        newChars[charIndex] = scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
        return newChars;
      });
    }, 100);

    // Clear any existing timeout for this character
    const existingTimeout = timeoutsRef.current.get(charIndex);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Set timeout to restore original character
    const restoreTimeout = setTimeout(() => {
      clearInterval(scrambleInterval);
      setDisplayChars(prev => {
        const newChars = [...prev];
        newChars[charIndex] = originalText[charIndex];
        return newChars;
      });
      setScramblingChars(prev => {
        const newSet = new Set(prev);
        newSet.delete(charIndex);
        return newSet;
      });
      timeoutsRef.current.delete(charIndex);
    }, duration * 500);

    timeoutsRef.current.set(charIndex, restoreTimeout);
  };

  const handleCharMouseEnter = (charIndex: number) => {
    if (!scramblingChars.has(charIndex)) {
      scrambleChar(charIndex);
    }
  };

  useEffect(() => {
    // Initialize character refs array
    charRefs.current = charRefs.current.slice(0, originalText.length);
    
    return () => {
      // Cleanup all timeouts
      timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
      timeoutsRef.current.clear();
    };
  }, [originalText]);

  return (
    <div
      ref={containerRef}
      className={`font-staatliches text-white cursor-pointer select-none ${className}`}
      style={style}
    >
      <p className="font-bold tracking-wider">
        {displayChars.map((char, index) => (
          <span
            key={index}
            ref={el => { charRefs.current[index] = el; }}
            className={`transition-colors duration-200 hover:text-gray-300 ${char === ' ' ? 'inline' : 'inline-block'}`}
            onMouseEnter={() => handleCharMouseEnter(index)}
            style={{ whiteSpace: char === ' ' ? 'pre' : 'normal' }}
          >
            {char === ' ' ? '\u00A0' : char}
          </span>
        ))}
      </p>
    </div>
  );
};

export default ScrambledText;
