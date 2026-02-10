"use client";

import { FormEvent, useState } from "react";

export default function Contact() {
    const [sent, setSent] = useState(false);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setSent(true);
        setTimeout(() => setSent(false), 4000);
    };

    return (
        <section id="contact" className="contact-section">
            <div className="container">
                <div className="contact-layout">
                    <div className="reveal">
                        <div className="section-label">Contact</div>
                        <h2 className="contact-heading">
                            Let&apos;s build something<br />together.
                        </h2>
                        <p className="contact-desc">
                            Tell us about your project and we&apos;ll get back to you within 24 hours.
                        </p>
                    </div>

                    <div className="reveal reveal-delay-2">
                        {sent ? (
                            <div className="form-success">
                                <div style={{ fontSize: "2rem" }}>✓</div>
                                <h3>Message sent</h3>
                                <p>We&apos;ll be in touch soon.</p>
                            </div>
                        ) : (
                            <form className="contact-form" onSubmit={handleSubmit}>
                                <div className="form-row">
                                    <input className="form-input" type="text" placeholder="Name" required />
                                    <input className="form-input" type="email" placeholder="Email" required />
                                </div>
                                <input className="form-input" type="text" placeholder="Company / Project" />
                                <textarea className="form-input" placeholder="Tell us about your project..." rows={5} required />
                                <button type="submit" className="btn-submit">
                                    Send Message
                                    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                                        <path d="M4 10h12m0 0l-4-4m4 4l-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
