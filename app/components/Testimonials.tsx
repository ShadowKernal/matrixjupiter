"use client";

import { useRef, useCallback } from "react";

const testimonials = [
    {
        quote: "MatrixJupiter transformed our online presence. The new site loads in under 2 seconds and conversions jumped 60%.",
        name: "James Turner",
        role: "CEO, Luxe Fashion",
        initials: "JT",
    },
    {
        quote: "It felt like having a world-class design team in-house. They understood our vision instantly and shipped beyond expectations.",
        name: "Sarah Kim",
        role: "Founder, CloudSync Pro",
        initials: "SK",
    },
    {
        quote: "Every interaction, every animation, every page feels cohesive and premium. The attention to detail is remarkable.",
        name: "Marco Rossi",
        role: "Owner, Ember Kitchen",
        initials: "MR",
    },
];

export default function Testimonials() {
    const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

    const handleMouseMove = useCallback((e: React.MouseEvent, i: number) => {
        const card = cardsRef.current[i];
        if (!card) return;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -6;
        const rotateY = ((x - centerX) / centerX) * 6;
        card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
    }, []);

    const handleMouseLeave = useCallback((i: number) => {
        const card = cardsRef.current[i];
        if (!card) return;
        card.style.transform = "perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)";
    }, []);

    return (
        <section id="testimonials" className="testimonials-section">
            <div className="container">
                <div className="testimonials-header reveal">
                    <div className="section-label">Testimonials</div>
                    <h2 className="section-heading">What clients say</h2>
                </div>
                <div className="testimonials-grid">
                    {testimonials.map((t, i) => (
                        <div
                            key={i}
                            className={`testimonial-card reveal reveal-delay-${i + 1}`}
                            ref={(el) => { cardsRef.current[i] = el; }}
                            onMouseMove={(e) => handleMouseMove(e, i)}
                            onMouseLeave={() => handleMouseLeave(i)}
                        >
                            <p className="testimonial-quote">&ldquo;{t.quote}&rdquo;</p>
                            <div className="testimonial-author">
                                <div className="testimonial-avatar">{t.initials}</div>
                                <div>
                                    <div className="testimonial-name">{t.name}</div>
                                    <div className="testimonial-role">{t.role}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
