import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const links = [
    { to: "/", label: "Home" },
    { to: "/blog", label: "Blog" },
    { to: "/about", label: "About" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b">
      <div className="container flex items-center justify-between h-14">
        <Link to="/" className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-primary" />
          <span className="font-display text-lg font-semibold tracking-tight text-primary">
            ChatWithSteve
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`text-sm font-medium transition-colors hover:text-accent ${
                location.pathname === link.to ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Button size="sm" asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Link to="/book">
              <span className="text-xs">Have a chat?</span>
            </Link>
          </Button>
        </nav>

        {/* Mobile toggle */}
        <button className="md:hidden text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <nav className="md:hidden border-t bg-background px-6 pb-6 pt-4 flex flex-col gap-4">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className="text-sm font-medium text-foreground"
            >
              {link.label}
            </Link>
          ))}
          <Button size="sm" asChild className="bg-primary text-primary-foreground hover:bg-primary/90 w-full">
            <Link to="/book" onClick={() => setMobileOpen(false)}>
              Have a chat?
            </Link>
          </Button>
        </nav>
      )}
    </header>
  );
};

export default Header;
