const steps = [
    { num: "01", title: "Discovery", desc: "We learn your goals, audience, and landscape to define a clear project strategy." },
    { num: "02", title: "Design", desc: "Wireframes become high-fidelity mockups. We iterate together until every detail is right." },
    { num: "03", title: "Develop", desc: "Designs become responsive, accessible, production-ready code — built to last." },
    { num: "04", title: "Launch & Grow", desc: "We deploy, optimize, and continue iterating so your site evolves with your business." },
];

export default function Process() {
    return (
        <section id="process" className="process-section">
            <div className="container">
                <div className="process-header reveal">
                    <div className="section-label">How We Work</div>
                    <h2 className="section-heading">Process</h2>
                    <p className="section-desc">
                        A clear, collaborative workflow with no surprises.
                    </p>
                </div>
                <div className="process-steps">
                    {steps.map((s, i) => (
                        <div key={s.num} className={`process-step reveal reveal-delay-${i + 1}`}>
                            <div className="process-num">{s.num}</div>
                            <div>
                                <h3>{s.title}</h3>
                                <p>{s.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
