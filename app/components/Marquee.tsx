export default function Marquee() {
    const items = ["Web Design", "Development", "Branding", "E-Commerce", "UI/UX", "SEO", "Motion"];
    const doubled = [...items, ...items];

    return (
        <div className="marquee-wrap">
            <div className="marquee-track">
                {doubled.map((item, i) => (
                    <span key={i}>
                        {i > 0 && <span className="dot" />}
                        {item}
                    </span>
                ))}
            </div>
        </div>
    );
}
