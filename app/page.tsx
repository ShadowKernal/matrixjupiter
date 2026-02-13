import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import HeroPlanet from "./components/HeroPlanet";
import Marquee from "./components/Marquee";
import Services from "./components/Services";
import Work from "./components/Work";
import About from "./components/About";
import Process from "./components/Process";
import Testimonials from "./components/Testimonials";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import ScrollReveal from "./components/ScrollReveal";

export default function Home() {
  return (
    <>
      <ScrollReveal />
      <div className="noise-overlay" />
      <Navbar />
      <HeroPlanet />
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
