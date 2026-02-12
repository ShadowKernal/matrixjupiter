"use client";

import { MouseEvent, useEffect, useRef, useState } from "react";

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [open, setOpen] = useState(false);
    const lockScrollYRef = useRef(0);
    const pendingHashRef = useRef<string | null>(null);

    const isMobile = () => window.innerWidth <= 768;
    const isReducedMotion = () =>
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const scrollToHash = (hash: string) => {
        const target = document.querySelector<HTMLElement>(hash);
        if (!target) return;
        target.scrollIntoView({
            behavior: isReducedMotion() ? "auto" : "smooth",
            block: "start",
        });
        if (window.location.hash !== hash) {
            window.history.pushState(null, "", hash);
        }
    };

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    useEffect(() => {
        const onResize = () => {
            if (window.innerWidth > 768) {
                setOpen(false);
            }
        };
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);

    useEffect(() => {
        if (!open || !isMobile()) return;

        lockScrollYRef.current = window.scrollY;
        document.body.style.position = "fixed";
        document.body.style.top = `-${lockScrollYRef.current}px`;
        document.body.style.left = "0";
        document.body.style.right = "0";
        document.body.style.width = "100%";
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.position = "";
            document.body.style.top = "";
            document.body.style.left = "";
            document.body.style.right = "";
            document.body.style.width = "";
            document.body.style.overflow = "";

            const pendingHash = pendingHashRef.current;
            pendingHashRef.current = null;
            if (pendingHash) {
                scrollToHash(pendingHash);
            } else {
                window.scrollTo(0, lockScrollYRef.current);
            }
        };
    }, [open]);

    const close = () => setOpen(false);
    const onNavClick = (hash: string) => (event: MouseEvent<HTMLAnchorElement>) => {
        if (!open || !isMobile()) {
            close();
            return;
        }
        event.preventDefault();
        pendingHashRef.current = hash;
        setOpen(false);
    };

    return (
        <nav className={`navbar${scrolled ? " scrolled" : ""}${open ? " menu-open" : ""}`}>
            <div className="container">
                <div className="nav-inner">
                    <a href="#" className="nav-logo">
                        <div className="logo-mark">
                            <span /><span /><span /><span />
                        </div>
                        MatrixJupiter
                    </a>

                    <ul className={`nav-links${open ? " open" : ""}`}>
                        <li><a href="#services" onClick={onNavClick("#services")}>Services</a></li>
                        <li><a href="#work" onClick={onNavClick("#work")}>Work</a></li>
                        <li><a href="#about" onClick={onNavClick("#about")}>About</a></li>
                        <li><a href="#process" onClick={onNavClick("#process")}>Process</a></li>
                        <li><a href="#contact" className="nav-cta-link" onClick={onNavClick("#contact")}>Let&apos;s Talk</a></li>
                    </ul>

                    <button
                        className={`nav-toggle${open ? " active" : ""}`}
                        onClick={() => setOpen(!open)}
                        aria-label="Toggle menu"
                    >
                        <span /><span /><span />
                    </button>
                </div>
            </div>
        </nav>
    );
}
