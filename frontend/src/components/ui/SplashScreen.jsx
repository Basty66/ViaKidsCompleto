import { useState, useEffect, useCallback, useMemo } from 'react';
import { Bus, GraduationCap, Shield, MapPin, Navigation, Bell, Star } from 'lucide-react';

export const SplashScreen = ({ onComplete }) => {
    const [phase, setPhase] = useState(0);

    const particles = useMemo(() =>
        [...Array(20)].map((_, i) => ({
            id: i,
            top: 5 + Math.random() * 90,
            left: 5 + Math.random() * 90,
            size: 1 + Math.random() * 2.5,
            duration: 2 + Math.random() * 4,
            delay: Math.random() * 3,
            opacity: 0.1 + Math.random() * 0.35,
            color: ['blue', 'purple', 'emerald', 'amber', 'cyan'][Math.floor(Math.random() * 5)],
        })), []);

    const handleSkip = useCallback(() => {
        try { localStorage.removeItem('viakids_splash_seen') } catch(e) {}
        onComplete();
    }, [onComplete]);

    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
                handleSkip();
            }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [handleSkip]);

    useEffect(() => {
        const t1 = setTimeout(() => setPhase(1), 250);
        const t2 = setTimeout(() => setPhase(2), 700);
        const t3 = setTimeout(() => setPhase(3), 1400);
        const t4 = setTimeout(() => setPhase(4), 2200);
        const t5 = setTimeout(() => setPhase(5), 3000);
        const t6 = setTimeout(() => onComplete(), 3600);

        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
            clearTimeout(t3);
            clearTimeout(t4);
            clearTimeout(t5);
            clearTimeout(t6);
        };
    }, [onComplete]);

    const colorMap = {
        blue: 'bg-blue-400',
        purple: 'bg-purple-400',
        emerald: 'bg-emerald-400',
        amber: 'bg-amber-400',
        cyan: 'bg-cyan-400',
    };

    return (
        <div className="fixed inset-0 z-[9999] bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 flex items-center justify-center overflow-hidden select-none">
            {/* Animated background orbs */}
            <div
                className="absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-blue-500/10 blur-[80px] sm:blur-[100px] transition-all duration-1000"
                style={{
                    transform: phase >= 1 ? 'translate(0, 0) scale(1)' : 'translate(50%, 50%) scale(0)',
                    top: phase >= 1 ? '-10%' : '50%',
                    left: phase >= 1 ? '-10%' : '50%',
                }}
            />
            <div
                className="absolute w-64 h-64 sm:w-80 sm:h-80 rounded-full bg-purple-500/10 blur-[60px] sm:blur-[100px] transition-all duration-1000"
                style={{
                    transform: phase >= 2 ? 'translate(0, 0) scale(1)' : 'translate(50%, 50%) scale(0)',
                    bottom: phase >= 2 ? '-10%' : '50%',
                    right: phase >= 2 ? '-10%' : '50%',
                }}
            />
            <div
                className="absolute w-48 h-48 sm:w-64 sm:h-64 rounded-full bg-emerald-500/5 blur-[60px] sm:blur-[80px] transition-all duration-1000"
                style={{
                    transform: phase >= 3 ? 'translate(-50%, -50%) scale(1)' : 'translate(-50%, -50%) scale(0)',
                    top: '45%',
                    left: '45%',
                }}
            />

            {/* Floating particles */}
            {phase >= 2 && particles.map((p) => (
                <div
                    key={p.id}
                    className={`absolute rounded-full ${colorMap[p.color]}`}
                    style={{
                        top: `${p.top}%`,
                        left: `${p.left}%`,
                        width: `${p.size}px`,
                        height: `${p.size}px`,
                        opacity: p.opacity,
                        animation: `float ${p.duration}s ease-in-out infinite`,
                        animationDelay: `${p.delay}s`,
                    }}
                />
            ))}

            {/* Grid pattern */}
            <div className="absolute inset-0 opacity-[0.025]" style={{
                backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
                backgroundSize: '48px 48px',
            }} />

            {/* Corner decorations */}
            <div className={`absolute top-8 left-8 transition-all duration-700 ${phase >= 3 ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}>
                <div className="w-8 h-8 sm:w-10 sm:h-10 border border-blue-500/20 rounded-lg rotate-45 animate-[spin-slow_12s_linear_infinite]" />
            </div>
            <div className={`absolute bottom-12 right-10 sm:bottom-16 sm:right-14 transition-all duration-700 ${phase >= 4 ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}>
                <div className="w-6 h-6 sm:w-8 sm:h-8 border border-purple-500/20 rounded-full animate-[spin-slow_8s_linear_infinite_reverse]" />
            </div>

            {/* Star decorations */}
            {phase >= 4 && (
                <>
                    <div className="absolute top-[15%] right-[15%] sm:top-[20%] sm:right-[20%] animate-[float_3s_ease-in-out_infinite]" style={{ animationDelay: '0.5s' }}>
                        <Star size={12} className="text-amber-400/30" />
                    </div>
                    <div className="absolute bottom-[25%] left-[12%] sm:bottom-[30%] sm:left-[15%] animate-[float_4s_ease-in-out_infinite]" style={{ animationDelay: '1s' }}>
                        <Star size={10} className="text-blue-400/25" />
                    </div>
                </>
            )}

            <div className="relative z-10 flex flex-col items-center justify-center px-4">
                {/* Logo container */}
                <div
                    className="transition-all duration-700 ease-out"
                    style={{
                        opacity: phase >= 1 ? 1 : 0,
                        transform: phase >= 1 ? 'scale(1)' : 'scale(0.5)',
                    }}
                >
                    <div className="relative">
                        {/* Glow rings */}
                        <div
                            className="absolute inset-[-16px] sm:inset-[-20px] rounded-full border-2 border-blue-500/20 transition-all duration-1000"
                            style={{ transform: phase >= 3 ? 'scale(1.1)' : 'scale(0.75)', opacity: phase >= 3 ? 1 : 0 }}
                        />
                        <div
                            className="absolute inset-[-28px] sm:inset-[-40px] rounded-full border border-blue-500/10 transition-all duration-1000"
                            style={{ transform: phase >= 4 ? 'scale(1)' : 'scale(0.5)', opacity: phase >= 4 ? 1 : 0 }}
                        />
                        <div
                            className="absolute inset-[-40px] sm:inset-[-56px] rounded-full border border-blue-500/5 transition-all duration-1000"
                            style={{ transform: phase >= 5 ? 'scale(1)' : 'scale(0.25)', opacity: phase >= 5 ? 0.5 : 0 }}
                        />

                        {/* Main logo circle */}
                        <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-2xl shadow-blue-500/30">
                            <Bus className="text-white w-10 h-10 sm:w-12 sm:h-12" />
                        </div>

                        {/* Orbiting icons */}
                        {phase >= 4 && (
                            <>
                                <div className="absolute top-[-8px] left-[-8px] sm:top-[-10px] sm:left-[-10px] p-1.5 sm:p-2 bg-purple-500/20 rounded-lg sm:rounded-xl border border-purple-500/30 animate-[spin-slow_8s_linear_infinite]">
                                    <Shield size={12} className="sm:w-4 sm:h-4 text-purple-400" />
                                </div>
                                <div className="absolute top-[-8px] right-[-8px] sm:top-[-10px] sm:right-[-10px] p-1.5 sm:p-2 bg-emerald-500/20 rounded-lg sm:rounded-xl border border-emerald-500/30 animate-[spin-slow_10s_linear_infinite_reverse]">
                                    <GraduationCap size={12} className="sm:w-4 sm:h-4 text-emerald-400" />
                                </div>
                                <div className="absolute bottom-[-8px] left-[-8px] sm:bottom-[-10px] sm:left-[-10px] p-1.5 sm:p-2 bg-amber-500/20 rounded-lg sm:rounded-xl border border-amber-500/30 animate-[spin-slow_12s_linear_infinite]">
                                    <MapPin size={12} className="sm:w-4 sm:h-4 text-amber-400" />
                                </div>
                                <div className="absolute bottom-[-8px] right-[-8px] sm:bottom-[-10px] sm:right-[-10px] p-1.5 sm:p-2 bg-cyan-500/20 rounded-lg sm:rounded-xl border border-cyan-500/30 animate-[spin-slow_8s_linear_infinite_reverse]">
                                    <Navigation size={12} className="sm:w-4 sm:h-4 text-cyan-400" />
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Title */}
                <div
                    className="mt-6 sm:mt-8 md:mt-10 transition-all duration-700 ease-out"
                    style={{
                        opacity: phase >= 2 ? 1 : 0,
                        transform: phase >= 2 ? 'translateY(0)' : 'translateY(32px)',
                    }}
                >
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight">
                        <span className="bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">Via</span>
                        <span className="bg-gradient-to-r from-blue-400 to-blue-300 bg-clip-text text-transparent">Kids</span>
                    </h1>
                </div>

                {/* Tagline */}
                <div
                    className="mt-2 sm:mt-3 transition-all duration-700 ease-out"
                    style={{
                        opacity: phase >= 3 ? 1 : 0,
                        transform: phase >= 3 ? 'translateY(0)' : 'translateY(16px)',
                    }}
                >
                    <p className="text-slate-400 text-xs sm:text-sm md:text-base tracking-wide text-center">
                        Transporte Escolar <span className="text-blue-400 font-semibold">Seguro</span>
                    </p>
                </div>

                {/* Feature pills */}
                <div
                    className="mt-4 sm:mt-6 flex flex-wrap justify-center gap-1.5 sm:gap-2 md:gap-3 transition-all duration-700 ease-out"
                    style={{
                        opacity: phase >= 4 ? 1 : 0,
                        transform: phase >= 4 ? 'translateY(0)' : 'translateY(16px)',
                    }}
                >
                    {[
                        { icon: <MapPin size={10} />, text: 'Tracking en Vivo' },
                        { icon: <Shield size={10} />, text: 'Seguridad QR' },
                        { icon: <Bell size={10} />, text: 'Alertas Instantáneas' },
                    ].map((item, i) => (
                        <div
                            key={i}
                            className="flex items-center gap-1 sm:gap-1.5 bg-white/5 border border-white/10 rounded-full px-2 py-1 sm:px-3 sm:py-1.5 text-[10px] sm:text-xs text-slate-300"
                            style={{ animationDelay: `${i * 0.15}s` }}
                        >
                            <span className="text-blue-400">{item.icon}</span>
                            {item.text}
                        </div>
                    ))}
                </div>

                {/* Loading bar */}
                <div
                    className="mt-8 sm:mt-10 md:mt-12 w-40 sm:w-48 md:w-56 transition-all duration-500"
                    style={{ opacity: phase >= 2 ? 1 : 0 }}
                >
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-300 ease-out"
                            style={{
                                width: phase === 2 ? '20%' : phase === 3 ? '40%' : phase === 4 ? '65%' : phase >= 5 ? '100%' : '0%',
                            }}
                        />
                    </div>
                    <p className="text-center text-slate-500 text-[10px] sm:text-xs mt-2 sm:mt-3 animate-pulse">
                        {phase <= 2 ? 'Cargando sistema' : phase <= 4 ? 'Verificando servicios' : '¡Listo!'}
                    </p>
                </div>
            </div>

            {/* Bottom brand */}
            <div
                className="absolute bottom-4 sm:bottom-6 md:bottom-8 transition-all duration-500"
                style={{ opacity: phase >= 3 ? 1 : 0 }}
            >
                <p className="text-slate-600 text-[10px] sm:text-xs tracking-wider text-center">© 2026 ViaKids — Todos los derechos reservados</p>
            </div>

            {/* Skip button */}
            <button
                onClick={handleSkip}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 md:top-6 md:right-6 px-3 py-1.5 sm:px-4 sm:py-2 bg-white/5 border border-white/10 rounded-lg sm:rounded-xl text-slate-400 text-[10px] sm:text-xs hover:bg-white/10 hover:text-white transition-all"
                style={{ opacity: phase >= 1 ? 1 : 0 }}
            >
                Saltar
            </button>
        </div>
    );
};
