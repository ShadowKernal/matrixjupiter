import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Marquee from "./components/Marquee";
import Services from "./components/Services";
import Work from "./components/Work";
import About from "./components/About";
import Process from "./components/Process";
import Testimonials from "./components/Testimonials";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import CustomCursor from "./components/CustomCursor";
import ScrollReveal from "./components/ScrollReveal";
import SmoothScroll from "./components/SmoothScroll";

export default function Home() {
  return (
    <>
      <SmoothScroll />
      <CustomCursor />
      <ScrollReveal />
      <div className="noise-overlay" />
      <Navbar />
      <Hero />
      <Marquee />
      <Services />
      <Work />
      <About />
      <Process />
      <Testimonials />
      <Contact />
      <Footer />
    </>
  );
}
