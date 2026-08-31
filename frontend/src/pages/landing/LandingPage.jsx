import Navbar from "../../components/landing/Navbar";
import Home from "../../components/landing/Home";
import HowItWorks from "../../components/landing/HowItWorks";
import Features from "../../components/landing/Features";
import About from "../../components/landing/About";
import Footer from "../../components/landing/Footer";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main>
        <Home />
        <HowItWorks />
        <Features />
        <About />
        <Footer />
        

        <section id="features"></section>
        <section id="about"></section>
        <section id="contact"></section>
      </main>

      {/* Footer will be added later */}
    </div>
  );
};

export default LandingPage;