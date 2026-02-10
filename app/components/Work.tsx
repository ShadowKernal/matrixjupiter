"use client";

import { useRef, useCallback, useEffect } from "react";

const projects = [
    {
        tag: "E-Commerce",
        title: "Luxe Fashion",
        desc: "Premium fashion platform — 40% conversion lift.",
        bg: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
        num: "01",
    },
    {
        tag: "SaaS",
        title: "CloudSync Pro",
        desc: "B2B dashboard redesign with real-time analytics.",
        bg: "linear-gradient(135deg, #0d1b2a 0%, #1b2838 50%, #1a3a4a 100%)",
        num: "02",
    },
    {
        tag: "Restaurant",
        title: "Ember Kitchen",
        desc: "Brand identity and site for upscale dining.",
        bg: "linear-gradient(135deg, #1a1110 0%, #2d1f1f 50%, #3a2020 100%)",
        num: "03",
    },
    {
        tag: "Fintech",
        title: "NovaPay",
        desc: "Landing page with interactive product demos.",
        bg: "linear-gradient(135deg, #0a0a1a 0%, #151530 50%, #1a1a40 100%)",
        num: "04",
    },
    {
        tag: "Healthcare",
        title: "MediConnect",
        desc: "Patient portal with scheduling and telemedicine.",
        bg: "linear-gradient(135deg, #0a1a1a 0%, #102828 50%, #0f3030 100%)",
        num: "05",
    },
];

export default function Work() {
    const scrollRef = useRef<HTMLDivElement>(null);
    const isDragging = useRef(false);
    const startX = useRef(0);
    const scrollLeft = useRef(0);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        isDragging.current = true;
        startX.current = e.pageX - (scrollRef.current?.offsetLeft || 0);
        scrollLeft.current = scrollRef.current?.scrollLeft || 0;
    }, []);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (!isDragging.current) return;
        e.preventDefault();
        const x = e.pageX - (scrollRef.current?.offsetLeft || 0);
        const walk = (x - startX.current) * 1.5;
        if (scrollRef.current) scrollRef.current.scrollLeft = scrollLeft.current - walk;
    }, []);

    const handleMouseUp = useCallback(() => {
        isDragging.current = false;
    }, []);

    useEffect(() => {
        window.addEventListener("mouseup", handleMouseUp);
        return () => window.removeEventListener("mouseup", handleMouseUp);
    }, [handleMouseUp]);

    return (
        <section id="work" className="work-section">
            <div className="work-header reveal">
                <div className="section-label">Selected Work</div>
                <h2 className="section-heading">Projects</h2>
                <p className="section-desc">Drag to explore our recent work across industries.</p>
            </div>
            <div
                ref={scrollRef}
                className="work-scroll reveal reveal-delay-2"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                {projects.map((p) => (
                    <div key={p.num} className="work-card">
                        <div className="work-card-bg" style={{ background: p.bg }} />
                        <div className="work-card-overlay" />
                        <div className="work-card-number">{p.num}</div>
                        <div className="work-card-info">
                            <div className="work-card-tag">{p.tag}</div>
                            <h3>{p.title}</h3>
                            <p>{p.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
