import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FadeImage from "@/components/FadeImage";
import { Instagram, Youtube } from "lucide-react";
import steveAbout from "@/assets/steve-about.webp";

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.71a8.21 8.21 0 0 0 4.76 1.52v-3.4a4.85 4.85 0 0 1-1-.14z" />
  </svg>
);

const About = () => (
  <div className="min-h-screen bg-background">
    <Header />
    <main className="pt-14">
      <section className="py-20">
        <div className="container max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Mobile: title first, then image, then text */}
            <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center md:items-start">
              {/* Mobile title */}
              <h1 className="text-4xl md:hidden font-display font-bold text-center">About Me</h1>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="flex-shrink-0"
              >
                <FadeImage
                  src={steveAbout}
                  alt="Steve"
                  loading="lazy"
                  width={448}
                  height={560}
                  className="w-72 md:w-96 lg:w-[28rem] rounded-2xl object-cover"
                />
              </motion.div>

              <div>
                <h1 className="hidden md:block text-4xl md:text-5xl font-display font-bold mb-6">About Me</h1>
                <div className="space-y-6 text-foreground/85 leading-relaxed text-lg">
                  <p>
                    Hi, I'm Stephen - a professional dancer and entrepreneur documenting the real journey of starting a dance studio from the ground up.
                  </p>
                  <p>
                    Having toured internationally and performed on major stages around the world, I've spent years developing the discipline and mindset required to perform at the highest level. Most recently, you can see me as a professional dancer on Dancing With The Stars Ireland.
                  </p>
                  <p>
                    Now I'm applying that same focus and resilience to building a dance studio, sharing the process openly through Chat with Steve.
                  </p>
                  <p>
                    This platform exists to document the reality: the wins, the setbacks, the strategies that work, and the lessons that don't. No hype, no shortcuts, just honest insights from someone doing the work every day.
                  </p>
                  <p>
                    Beyond writing, I create content across Instagram, TikTok, and YouTube to help aspiring entrepreneurs move faster, avoid common mistakes, and stay consistent.
                  </p>
                  <p>
                    This is the real story of building something meaningful from scratch.
                  </p>
                </div>

                <div className="mt-12 pt-8 border-t">
                  <h2 className="font-display font-semibold text-xl mb-4">Find me online</h2>
                  <div className="flex flex-col gap-3">
                    <a
                      href="https://instagram.com/chat.with.steve"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-muted-foreground hover:text-accent transition-colors"
                    >
                      <Instagram className="w-5 h-5" /> @chat.with.steve
                    </a>
                    <a
                      href="https://tiktok.com/@chat.with.steve"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-muted-foreground hover:text-accent transition-colors"
                    >
                      <TikTokIcon className="w-5 h-5" /> @chat.with.steve
                    </a>
                    <a
                      href="https://youtube.com/@chatwithsteveofficial"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-muted-foreground hover:text-accent transition-colors"
                    >
                      <Youtube className="w-5 h-5" /> @chatwithsteveofficial
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
    <Footer />
  </div>
);

export default About;
