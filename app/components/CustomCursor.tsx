"use client";

import { useEffect, useRef, useCallback } from "react";

export default function CustomCursor() {
    const cursorRef = useRef<HTMLDivElement>(null);
    const glowRef = useRef<HTMLDivElement>(null);
    const pos = useRef({ x: 0, y: 0 });
    const target = useRef({ x: 0, y: 0 });

    const animate = useCallback(() => {
        pos.current.x += (target.current.x - pos.current.x) * 0.15;
        pos.current.y += (target.current.y - pos.current.y) * 0.15;

        if (cursorRef.current) {
            cursorRef.current.style.left = `${pos.current.x}px`;
            cursorRef.current.style.top = `${pos.current.y}px`;
        }
        if (glowRef.current) {
            glowRef.current.style.left = `${pos.current.x}px`;
            glowRef.current.style.top = `${pos.current.y}px`;
        }

        requestAnimationFrame(animate);
    }, []);

    useEffect(() => {
        const handleMove = (e: MouseEvent) => {
            target.current = { x: e.clientX, y: e.clientY };
        };

        const handleOver = (e: MouseEvent) => {
            const el = e.target as HTMLElement;
            if (
                el.tagName === "A" ||
                el.tagName === "BUTTON" ||
                el.closest("a") ||
                el.closest("button") ||
                el.closest(".work-card") ||
                el.closest(".service-item") ||
                el.closest(".testimonial-card")
            ) {
                cursorRef.current?.classList.add("hovering");
            }
        };

        const handleOut = () => {
            cursorRef.current?.classList.remove("hovering");
        };

        window.addEventListener("mousemove", handleMove);
        document.addEventListener("mouseover", handleOver);
        document.addEventListener("mouseout", handleOut);
        requestAnimationFrame(animate);

        return () => {
            window.removeEventListener("mousemove", handleMove);
            document.removeEventListener("mouseover", handleOver);
            document.removeEventListener("mouseout", handleOut);
        };
    }, [animate]);

    return (
        <>
            <div ref={glowRef} className="cursor-glow" />
            <div ref={cursorRef} className="cursor" />
        </>
    );
}
