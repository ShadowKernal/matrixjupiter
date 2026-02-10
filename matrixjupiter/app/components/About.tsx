const values = [
    { icon: "✦", text: "Fully custom — no templates, no shortcuts" },
    { icon: "◎", text: "Performance-first architecture" },
    { icon: "◈", text: "Transparent, async-friendly communication" },
    { icon: "△", text: "Ongoing support and iteration post-launch" },
];

export default function About() {
    return (
        <section id="about" className="about-section">
            <div className="container">
                <div className="about-layout">
                    <div className="about-left reveal">
                        <div className="section-label">About</div>
                        <h2 className="section-heading">
                            We obsess<br />over the details.
                        </h2>
                    </div>
                    <div className="about-right">
                        <p className="reveal reveal-delay-1">
                            MatrixJupiter exists because every business deserves a website that
                            works as hard as they do. We combine sharp design instincts with
                            engineering precision to build things that look incredible and perform.
                        </p>
                        <p className="reveal reveal-delay-2">
                            Our small team means you work directly with the people building your
                            site. No layers. No hand-offs. No lost-in-translation moments.
                        </p>
                        <div className="about-values reveal reveal-delay-3">
                            {values.map((v, i) => (
                                <div key={i} className="about-value">
                                    <div className="about-value-icon">{v.icon}</div>
                                    <span>{v.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
