import Image from "next/image";

export default function Footer() {
    return (
        <footer id="footer" className="site-footer">
            <div className="container">
                <div className="footer-grid">
                    <div>
                        <a href="#" className="nav-logo" style={{ marginBottom: 0 }}>
                            <div className="logo-mark">
                                <Image src="/logo.png" alt="MatrixJupiter logo" width={32} height={32} className="logo-mark-img" />
                            </div>
                            MatrixJupiter
                        </a>
                        <p className="footer-brand-text">
                            Premium web design studio crafting digital experiences that convert.
                        </p>
                    </div>
                    <div className="footer-col">
                        <h4>Company</h4>
                        <ul>
                            <li><a href="#about">About</a></li>
                            <li><a href="#services">Services</a></li>
                            <li><a href="#work">Work</a></li>
                            <li><a href="#process">Process</a></li>
                        </ul>
                    </div>
                    <div className="footer-col">
                        <h4>Services</h4>
                        <ul>
                            <li><a href="#services">Web Design</a></li>
                            <li><a href="#services">Development</a></li>
                            <li><a href="#services">Branding</a></li>
                            <li><a href="#services">E-Commerce</a></li>
                        </ul>
                    </div>
                    <div className="footer-col">
                        <h4>Connect</h4>
                        <ul>
                            <li><a href="#contact">Contact</a></li>
                            <li><a href="#">Twitter / X</a></li>
                            <li><a href="#">LinkedIn</a></li>
                            <li><a href="#">Dribbble</a></li>
                        </ul>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>&copy; 2026 MatrixJupiter. All rights reserved.</p>
                    <p>Built by MatrixJupiter</p>
                </div>
            </div>
        </footer>
    );
}
