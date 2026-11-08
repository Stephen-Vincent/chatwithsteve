import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import LatestPostsSection from "@/components/LatestPostsSection";
import SocialSection from "@/components/SocialSection";
import NewsletterCTA from "@/components/NewsletterCTA";

const Index = () => (
  <div className="min-h-screen bg-background">
    <Header />
    <main className="pt-14">
      <HeroSection />
      <LatestPostsSection />
      <SocialSection />
      <NewsletterCTA />
    </main>
    <Footer />
  </div>
);

export default Index;
