import React, { useEffect, useRef, memo } from 'react';

const CustomCursor = memo(() => {
    const cursorRef = useRef(null);
    const mousePos = useRef({ x: 0, y: 0 });
    const currentPos = useRef({ x: 0, y: 0 });
    const requestRef = useRef();

    useEffect(() => {
        const handleMouseMove = (e) => {
            mousePos.current = { x: e.clientX, y: e.clientY };
        };
        window.addEventListener('mousemove', handleMouseMove, { passive: true });

        const animate = () => {
            // Faster lerp for less laggy feel but still smooth
            const dx = mousePos.current.x - currentPos.current.x;
            const dy = mousePos.current.y - currentPos.current.y;

            currentPos.current.x += dx * 0.10;
            currentPos.current.y += dy * 0.10;

            if (cursorRef.current) {
                // Use translate3d to force GPU acceleration
                cursorRef.current.style.transform = `translate3d(${currentPos.current.x - 20}px, ${currentPos.current.y - 20}px, 0)`;
            }

            requestRef.current = requestAnimationFrame(animate);
        };

        requestRef.current = requestAnimationFrame(animate);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(requestRef.current);
        };
    }, []);

    return (
        <div
            ref={cursorRef}
            className="fixed top-0 left-0 w-10 h-10 border border-indigo-500/40 rounded-full pointer-events-none z-[9999] flex items-center justify-center will-change-transform"
            style={{ transform: 'translate3d(-100px, -100px, 0)' }}
        >
            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full shadow-[0_0_8px_#011e9f]"></div>
        </div>
    );
});

export default CustomCursor;
