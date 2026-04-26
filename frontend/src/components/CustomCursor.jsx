import React, { useEffect, useState, useRef } from 'react';

const CustomCursor = () => {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
    const requestRef = useRef();

    // 1. Track actual mouse position
    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    // 2. Animate the follower with a "lag" effect using lerp (Linear Interpolation)
    const animate = () => {
        setCursorPosition((prev) => {
            const dx = mousePosition.x - prev.x;
            const dy = mousePosition.y - prev.y;
            // 0.15 creates a smooth, trailing delay. Higher = faster, Lower = more lag.
            return {
                x: prev.x + dx * 0.1,
                y: prev.y + dy * 0.1,
            };
        });
        requestRef.current = requestAnimationFrame(animate);
    };

    useEffect(() => {
        requestRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(requestRef.current);
    }, [mousePosition]);

    return (
        <>
            {/* The Outer Trailing Circle */}
            <div
                className="fixed top-0 left-0 w-10 h-10 border border-indigo-500 rounded-full pointer-events-none z-[9999] transition-transform duration-100 ease-out flex items-center justify-center"
                style={{
                    transform: `translate(${cursorPosition.x - 20}px, ${cursorPosition.y - 20}px)`,
                }}
            >
                {/* A tiny inner glow core */}
                <div className="w-1 h-1 bg-indigo-500 rounded-full shadow-[0_0_8px_#6366f1]"></div>
            </div>

            {/* A faint secondary glow that follows even slower */}
            <div
                className="fixed top-0 left-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none z-[9998]"
                style={{
                    transform: `translate(${cursorPosition.x - 64}px, ${cursorPosition.y - 64}px)`,
                }}
            />
        </>
    );
};

export default CustomCursor;
