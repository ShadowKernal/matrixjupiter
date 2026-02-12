"use client";

import { useState, useEffect } from "react";

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [open, setOpen] = useState(false);

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
        if (!open || window.innerWidth > 768) return;

        const scrollY = window.scrollY;
        document.body.style.position = "fixed";
        document.body.style.top = `-${scrollY}px`;
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
            window.scrollTo(0, scrollY);
        };
    }, [open]);

    const close = () => setOpen(false);

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
                        <li><a href="#services" onClick={close}>Services</a></li>
                        <li><a href="#work" onClick={close}>Work</a></li>
                        <li><a href="#about" onClick={close}>About</a></li>
                        <li><a href="#process" onClick={close}>Process</a></li>
                        <li><a href="#contact" className="nav-cta-link" onClick={close}>Let&apos;s Talk</a></li>
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
