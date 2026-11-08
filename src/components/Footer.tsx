import { Link } from "react-router-dom";
import { MessageCircle, Instagram, Youtube } from "lucide-react";

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.71a8.21 8.21 0 0 0 4.76 1.52v-3.4a4.85 4.85 0 0 1-1-.14z" />
  </svg>
);

const Footer = () => (
  <footer className="bg-primary text-primary-foreground py-12">
    <div className="container">
      <div className="grid md:grid-cols-3 gap-8">
        <div>
          <Link to="/" className="flex items-center gap-2 mb-3">
            <MessageCircle className="w-5 h-5 text-secondary" />
            <span className="font-display text-lg font-semibold tracking-tight text-secondary">
              ChatWithSteve
            </span>
          </Link>
          <p className="text-sm text-primary-foreground/60 max-w-xs">
            Documenting the journey of building a business — one lesson at a time.
          </p>
        </div>
        <div>
          <h4 className="font-display font-semibold mb-3">Links</h4>
          <nav className="flex flex-col gap-2 text-sm text-primary-foreground/60">
            <Link to="/" className="hover:text-accent transition-colors">Home</Link>
            <Link to="/blog" className="hover:text-accent transition-colors">Blog</Link>
            <Link to="/about" className="hover:text-accent transition-colors">About</Link>
          </nav>
        </div>
        <div>
          <h4 className="font-display font-semibold mb-3">Socials</h4>
          <nav className="flex flex-col gap-2 text-sm text-primary-foreground/60">
            <a href="https://instagram.com/chat.with.steve" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-accent transition-colors">
              <Instagram className="w-4 h-4" /> @chat.with.steve
            </a>
            <a href="https://tiktok.com/@chat.with.steve" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-accent transition-colors">
              <TikTokIcon className="w-4 h-4" /> @chat.with.steve
            </a>
            <a href="https://youtube.com/@chatwithsteveofficial" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-accent transition-colors">
              <Youtube className="w-4 h-4" /> @chatwithsteveofficial
            </a>
          </nav>
        </div>
      </div>
      <div className="mt-10 pt-6 border-t border-primary-foreground/10 text-center text-xs text-primary-foreground/40">
        © {new Date().getFullYear()} Chat with Steve. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;
