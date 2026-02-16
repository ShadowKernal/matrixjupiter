"use client";

import { FormEvent, useState } from "react";

export default function Contact() {
    const [sent, setSent] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        const form = e.currentTarget;
        const formData = new FormData(form);
        const payload = {
            name: String(formData.get("name") ?? "").trim(),
            email: String(formData.get("email") ?? "").trim(),
            company: String(formData.get("company") ?? "").trim(),
            message: String(formData.get("message") ?? "").trim(),
        };

        try {
            const response = await fetch("/api/contact", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const data = (await response.json().catch(() => null)) as { error?: string } | null;
                throw new Error(data?.error || "Could not send message.");
            }

            form.reset();
            setSent(true);
            setTimeout(() => setSent(false), 4000);
        } catch (submitError) {
            setError(submitError instanceof Error ? submitError.message : "Could not send message.");
        } finally {
            setIsSubmitting(false);
        }
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
                                <div style={{ fontSize: "2rem" }}>OK</div>
                                <h3>Message sent</h3>
                                <p>We&apos;ll be in touch soon.</p>
                            </div>
                        ) : (
                            <form className="contact-form" onSubmit={handleSubmit}>
                                <div className="form-row">
                                    <input className="form-input" type="text" name="name" placeholder="Name" required />
                                    <input className="form-input" type="email" name="email" placeholder="Email" required />
                                </div>
                                <input className="form-input" type="text" name="company" placeholder="Company / Project" />
                                <textarea className="form-input" name="message" placeholder="Tell us about your project..." rows={5} required />
                                {error ? <p style={{ color: "#ff6b6b", marginTop: "0.5rem" }}>{error}</p> : null}
                                <button type="submit" className="btn-submit" disabled={isSubmitting}>
                                    {isSubmitting ? "Sending..." : "Send Message"}
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
