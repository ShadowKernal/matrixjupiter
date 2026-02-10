const services = [
    { num: "01", title: "Web Design", desc: "Thoughtful, clean interfaces that communicate your brand and guide users toward action." },
    { num: "02", title: "Development", desc: "Modern, performant code. Built for speed, accessibility, and long-term maintainability." },
    { num: "03", title: "UI/UX Strategy", desc: "Research-driven design decisions that simplify complex workflows into clear, intuitive flows." },
    { num: "04", title: "Branding", desc: "Cohesive brand systems — logos, typography, colors — designed to scale across every touchpoint." },
    { num: "05", title: "E-Commerce", desc: "Online stores engineered for conversion with seamless checkout and inventory management." },
    { num: "06", title: "SEO & Performance", desc: "Technical and on-page optimization to get your site ranking and loading fast." },
];

export default function Services() {
    return (
        <section id="services" className="services-section">
            <div className="container">
                <div className="services-header reveal">
                    <div className="section-label">What We Do</div>
                    <h2 className="section-heading">Services</h2>
                    <p className="section-desc">
                        End-to-end capabilities to take your project from concept to a live, polished product.
                    </p>
                </div>
                <div className="services-grid reveal reveal-delay-2">
                    {services.map((s) => (
                        <div key={s.num} className="service-item">
                            <div className="service-num">{s.num}</div>
                            <h3>{s.title}</h3>
                            <p>{s.desc}</p>
                            <div className="service-arrow">↗</div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
