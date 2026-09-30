import { useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SlidersHorizontal, Eye, Zap, Bird } from 'lucide-react';
import Footer from '../components/Footer';
import CustomCursor from '../components/CustomCursor';

const LandingPage = () => {
    const navigate = useNavigate();
    const activeIndexRef = useRef(0);
    const isAnimatingRef = useRef(false);
    const containerRef = useRef(null);

    const scrollToSection = useCallback((index) => {
        if (!containerRef.current) return;
        const container = containerRef.current;
        const sections = container.querySelectorAll('.landing-snap-section');
        if (!sections[index]) return;

        isAnimatingRef.current = true;
        activeIndexRef.current = index;

        const startScroll = container.scrollTop;
        const targetScroll = sections[index].offsetTop;
        const distance = targetScroll - startScroll;

        const duration = 1200; // Premium 1.2s smooth animated slide!
        let startTime = null;

        const animate = (currentTime) => {
            if (!startTime) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const progress = Math.min(timeElapsed / duration, 1);

            const ease = progress < 0.5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2;
            container.scrollTop = startScroll + distance * ease;

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                isAnimatingRef.current = false;
            }
        };

        requestAnimationFrame(animate);
    }, []);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        let touchStartY = 0;

        const handleWheel = (e) => {
            e.preventDefault();
            if (isAnimatingRef.current) return;

            const delta = e.deltaY;
            if (Math.abs(delta) < 20) return;

            let targetIndex = activeIndexRef.current;
            if (delta > 0) {
                if (activeIndexRef.current < 3) {
                    targetIndex = activeIndexRef.current + 1;
                }
            } else {
                if (activeIndexRef.current > 0) {
                    targetIndex = activeIndexRef.current - 1;
                }
            }

            if (targetIndex !== activeIndexRef.current) {
                scrollToSection(targetIndex);
            }
        };

        const handleTouchStart = (e) => {
            touchStartY = e.touches[0].clientY;
        };

        const handleTouchEnd = (e) => {
            if (isAnimatingRef.current) return;
            const touchEndY = e.changedTouches[0].clientY;
            const diff = touchStartY - touchEndY;

            if (Math.abs(diff) > 50) {
                let targetIndex = activeIndexRef.current;
                if (diff > 0) {
                    if (activeIndexRef.current < 3) {
                        targetIndex = activeIndexRef.current + 1;
                    }
                } else {
                    if (activeIndexRef.current > 0) {
                        targetIndex = activeIndexRef.current - 1;
                    }
                }

                if (targetIndex !== activeIndexRef.current) {
                    scrollToSection(targetIndex);
                }
            }
        };

        const handleKeyDown = (e) => {
            if (isAnimatingRef.current) return;
            let targetIndex = activeIndexRef.current;
            if (e.key === 'ArrowDown' || e.key === 'PageDown') {
                if (activeIndexRef.current < 3) {
                    targetIndex = activeIndexRef.current + 1;
                }
            } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
                if (activeIndexRef.current > 0) {
                    targetIndex = activeIndexRef.current - 1;
                }
            } else if (e.key === 'Home') {
                targetIndex = 0;
            } else if (e.key === 'End') {
                targetIndex = 3;
            }

            if (targetIndex !== activeIndexRef.current) {
                e.preventDefault();
                scrollToSection(targetIndex);
            }
        };

        const handleResize = () => {
            const sections = container.querySelectorAll('.landing-snap-section');
            if (sections[activeIndexRef.current]) {
                container.scrollTop = sections[activeIndexRef.current].offsetTop;
            }
        };

        container.addEventListener('wheel', handleWheel, { passive: false });
        container.addEventListener('touchstart', handleTouchStart, { passive: true });
        container.addEventListener('touchend', handleTouchEnd, { passive: false });
        window.addEventListener('keydown', handleKeyDown, { passive: false });
        window.addEventListener('resize', handleResize);

        return () => {
            container.removeEventListener('wheel', handleWheel);
            container.removeEventListener('touchstart', handleTouchStart);
            container.removeEventListener('touchend', handleTouchEnd);
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('resize', handleResize);
        };
    }, [scrollToSection]);

    const features = [
        {
            icon: <SlidersHorizontal size={22} className="text-[#4f7cff]" />,
            title: 'Custom Rule Engine',
            description: 'Set personalized high or low price triggers for multiple assets using real-time data.',
        },
        {
            icon: <Eye size={22} className="text-[#4f7cff]" />,
            title: 'Automated Vigilance',
            description: "Our background sentinel continuously polls the market so you don't have to keep your tabs open.",
        },
        {
            icon: <Zap size={22} className="text-[#4f7cff]" />,
            title: 'Instant Dispatch',
            description: 'Immediate, formatted delivery of triggered alerts routed directly to your private Discord server.',
        },
    ];

    const steps = [
        {
            number: '01',
            title: 'Connect Your Webhook',
            description: 'Generate a secure webhook URL from your Discord server and paste it into Kestrel to create a private alert pipeline.',
        },
        {
            number: '02',
            title: 'Define Your Thresholds',
            description: "Select a cryptocurrency and set your exact trigger conditions (e.g., 'Alert me when Bitcoin drops below $65k').",
        },
        {
            number: '03',
            title: 'Catch Every Shift',
            description: 'Step away from the charts. Kestrel will instantly ping your channel the second the market meets your criteria.',
        },
    ];

    return (
        <div ref={containerRef} className="landing-snap-container bg-[#07090F] text-white flex flex-col custom-scrollbar">
            <CustomCursor />

            {/* ── NAVBAR ── */}
            <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 bg-[#07090F]/80 backdrop-blur-md border-b border-gray-800/40">
                <div className="flex items-center space-x-2 text-indigo-500">
                    <Bird size={20} strokeWidth={2.5} />
                    <span className="text-white font-bold text-lg tracking-wide">Kestrel</span>
                </div>

                <div className="flex items-center space-x-4">
                    <Link
                        to="/login"
                        className="text-xs border border-white/60 hover:border-white text-white font-semibold px-4 py-1.5 rounded-lg transition-colors tracking-wider uppercase"
                    >
                        Log In
                    </Link>
                    <Link
                        to="/register"
                        className="text-xs bg-white text-black font-bold px-4 py-1.5 rounded-lg hover:bg-gray-200 transition-colors uppercase tracking-wider"
                    >
                        Get Started
                    </Link>
                </div>
            </nav>

            {/* ── HERO ── */}
            <section
                id="hero"
                className="landing-snap-section flex flex-col items-center justify-center text-center px-6 pt-20"
            >
                <div className="flex items-center space-x-2 mb-10">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#4f7cff]"></span>
                    <p className="text-[10px] uppercase tracking-[0.25em] text-gray-500 font-semibold">
                        Real-Time Asynchronous Engine
                    </p>
                </div>

                <h1 className="text-5xl md:text-7xl font-extrabold leading-tight max-w-4xl mb-8">
                    Watch the market{' '}
                    <span className="text-[#3b5eff]">without watching</span>
                    {' '}the screen.
                </h1>

                <p className="text-gray-400 text-xs md:text-sm max-w-md mb-12 leading-relaxed">
                    Kestrel's engine monitors the charts and pushes instant Discord alerts the second your target is hit.
                </p>

                <button
                    onClick={() => navigate('/register')}
                    className="px-10 py-4 rounded-xl text-sm font-semibold text-black bg-white hover:bg-gray-100 transition-all shadow-lg active:scale-95"
                    style={{
                        background: 'linear-gradient(135deg, #c8d4f5 0%, #9aaee8 50%, #b8c7f0 100%)',
                    }}
                >
                    Start Monitoring for Free
                </button>
            </section>

            {/* ── FEATURES ── */}
            <section id="features" className="landing-snap-section flex flex-col justify-center px-6 py-28 max-w-6xl mx-auto w-full">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-white mb-4">Features</h2>
                    <p className="text-gray-400 max-w-lg mx-auto text-sm leading-relaxed">
                        Powerful tools built for the modern trader who demands precision and speed.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {features.map((f) => (
                        <div
                            key={f.title}
                            className="bg-[#0F111A] border border-gray-800/60 rounded-2xl p-8 flex flex-col gap-5 hover:border-gray-700 transition-colors"
                        >
                            <div className="w-11 h-11 rounded-xl bg-[#1a1e30] flex items-center justify-center">
                                {f.icon}
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-base mb-2">{f.title}</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">{f.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── HOW IT WORKS ── */}
            <section id="how-it-works" className="landing-snap-section flex flex-col justify-center px-6 py-28 max-w-6xl mx-auto w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-start">

                    {/* Left: sticky header */}
                    <div className="md:sticky md:top-32">
                        <h2 className="text-4xl md:text-5xl font-extrabold leading-tight text-white mb-6">
                            Built for<br />precision.<br />Made for<br />speed.
                        </h2>
                        <p className="text-gray-400 text-sm leading-relaxed mb-8 max-w-xs">
                            Kestrel streamlines your monitoring workflow into three steps.
                        </p>
                        <div className="w-14 h-0.5 bg-white rounded-full"></div>
                    </div>

                    {/* Right: steps */}
                    <div className="flex flex-col gap-10">
                        {steps.map((step) => (
                            <div key={step.number} className="flex items-start gap-6">
                                <div className="flex-shrink-0 w-14 h-14 bg-[#0F111A] border border-gray-800 rounded-xl flex items-center justify-center">
                                    <span className="text-white font-bold text-sm">{step.number}</span>
                                </div>
                                <div>
                                    <h3 className="text-white font-bold text-base mb-2">{step.title}</h3>
                                    <p className="text-gray-400 text-sm leading-relaxed">{step.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA & FOOTER ── */}
            <section id="cta" className="landing-snap-section flex flex-col justify-between px-6 pt-28 pb-8 max-w-6xl mx-auto w-full">
                <div className="flex-grow flex flex-col justify-center">
                    <div
                        className="rounded-3xl px-10 py-20 text-center"
                        style={{
                            background: 'radial-gradient(ellipse at center, #131929 0%, #0d111d 60%, #090d17 100%)',
                            border: '1px solid rgba(255,255,255,0.06)',
                        }}
                    >
                        <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
                            Ready to start observing?
                        </h2>
                        <p className="text-gray-400 text-sm max-w-md mx-auto mb-10 leading-relaxed">
                            Keep an eye on the market— without watching the screen.
                        </p>
                        <button
                            onClick={() => navigate('/register')}
                            className="px-10 py-4 bg-white hover:bg-gray-100 text-black text-sm font-bold rounded-xl transition-all shadow-lg active:scale-95"
                        >
                            Get Started for Free
                        </button>
                    </div>
                </div>

                {/* ── FOOTER ── */}
                <div className="w-full pt-12">
                    <Footer />
                </div>
            </section>

        </div>
    );
};

export default LandingPage;
