"use client";

import { useEffect, useRef } from "react";

export default function Hero() {
    const statsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const animate = () => {
            document.querySelectorAll<HTMLSpanElement>("[data-count]").forEach((el) => {
                const target = parseInt(el.dataset.count || "0");
                const duration = 2200;
                const start = performance.now();
                const tick = (now: number) => {
                    const t = Math.min((now - start) / duration, 1);
                    const eased = 1 - Math.pow(1 - t, 4);
                    el.textContent = Math.floor(eased * target).toString();
                    if (t < 1) requestAnimationFrame(tick);
                };
                requestAnimationFrame(tick);
            });
        };

        const obs = new IntersectionObserver(
            (entries) => {
                entries.forEach((e) => {
                    if (e.isIntersecting) {
                        animate();
                        obs.disconnect();
                    }
                });
            },
            { threshold: 0.5 }
        );

        if (statsRef.current) obs.observe(statsRef.current);
        return () => obs.disconnect();
    }, []);

    return (
        <header className="hero" id="hero">
            <div className="hero-grid-bg" />
            <div className="hero-content">
                <h1 className="hero-title">
                    <span className="text-reveal-line"><span>We build websites</span></span>
                    <span className="text-reveal-line" style={{ transitionDelay: "0.12s" }}>
                        <span>that <span className="hero-title-dim">actually work.</span></span>
                    </span>
                </h1>

                <p className="hero-desc reveal reveal-delay-2">
                    Clean design. Solid code. Real results. We partner with ambitious
                    brands to create digital experiences people remember.
                </p>

                <div className="hero-actions reveal reveal-delay-3">
                    <a href="#contact" className="btn-main">
                        Start a Project
                        <svg className="btn-arrow" width="18" height="18" viewBox="0 0 20 20" fill="none">
                            <path d="M4 10h12m0 0l-4-4m4 4l-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </a>
                    <a href="#work" className="btn-secondary">See Our Work</a>
                </div>
            </div>

            <div className="hero-bottom">
                <div className="hero-stats reveal reveal-delay-4" ref={statsRef}>
                    <div>
                        <div className="hero-stat-val"><span data-count="50">0</span>+</div>
                        <div className="hero-stat-label">Projects</div>
                    </div>
                    <div>
                        <div className="hero-stat-val"><span data-count="98">0</span>%</div>
                        <div className="hero-stat-label">Satisfaction</div>
                    </div>
                    <div>
                        <div className="hero-stat-val"><span data-count="5">0</span>.0</div>
                        <div className="hero-stat-label">Rating</div>
                    </div>
                </div>
                <div className="hero-scroll">
                    <div className="hero-scroll-line" />
                    Scroll
                </div>
            </div>
        </header>
    );
}
