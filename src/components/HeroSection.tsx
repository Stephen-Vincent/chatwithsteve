import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { BookOpen, User } from "lucide-react";
import FadeImage from "@/components/FadeImage";
import steveSitting from "@/assets/steve-sitting.webp";

const HeroSection = () => (
  <section className="relative min-h-screen flex items-stretch overflow-hidden bg-secondary">
    <div className="container flex relative z-10">
      <div className="flex flex-col md:flex-row items-center flex-1">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="flex flex-col justify-center items-center text-center md:items-start md:text-left pt-24 pb-4 md:pb-12 max-w-2xl md:flex-1"
        >
          <span className="inline-block px-3 py-1 rounded bg-white text-primary text-xs font-semibold tracking-wide uppercase mb-6 w-fit">
            Building in public
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-tight mb-5 font-display font-bold text-primary">
            I'm building a business and documenting <span className="text-accent">everything</span> I learn.
          </h1>

          {/* Mobile image */}
          <div className="flex justify-center md:hidden">
            <FadeImage src={steveSitting} alt="Steve" loading="eager" fetchPriority="high" width={350} height={350} className="max-h-[350px] object-contain" />
          </div>

          <p className="text-base sm:text-lg text-primary/80 max-w-xl mb-3 leading-relaxed">
            Chat with Steve is my journey as a professional dancer starting a dance studio from scratch.
          </p>
          <p className="text-base sm:text-lg text-primary/80 max-w-xl mb-8 leading-relaxed">
            Sharing the wins, the failures, and the lessons along the way through blog posts, videos, and social content.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button size="lg" asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Link to="/blog">
                <BookOpen className="mr-2 w-4 h-4" /> Read the Blog
              </Link>
            </Button>
            <Button size="lg" asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Link to="/about">
                <User className="mr-2 w-4 h-4" /> About Steve
              </Link>
            </Button>
          </div>
        </motion.div>

        {/* Desktop/tablet image */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="hidden md:flex items-end justify-center flex-1"
        >
          <FadeImage src={steveSitting} alt="Steve" loading="eager" fetchPriority="high" width={600} height={800} className="max-h-[85vh] md:max-h-[90vh] object-contain md:scale-110 lg:scale-100" />
        </motion.div>
      </div>
    </div>
  </section>
);

export default HeroSection;
