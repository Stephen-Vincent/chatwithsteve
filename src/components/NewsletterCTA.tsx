import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const NewsletterCTA = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("subscribers" as any)
        .insert([{ email: trimmed }]);

      if (error) {
        if (error.code === "23505") {
          toast.info("You're already subscribed!");
        } else {
          toast.error("Something went wrong. Please try again.");
        }
      } else {
        toast.success("You're in! Welcome to the journey 🎉");
        setEmail("");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-16 bg-primary">
      <div className="container max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent/20 mb-5">
            <Mail className="w-6 h-6 text-accent" />
          </div>
          <h2 className="text-2xl md:text-3xl font-display font-bold text-primary-foreground mb-3">
            Follow along behind the scenes
          </h2>
          <p className="text-primary-foreground/60 mb-8 max-w-md mx-auto">
            No spam, no fluff — just honest updates from the journey, delivered weekly.
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              maxLength={255}
              className="flex-1 bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/40 focus-visible:ring-accent"
            />
            <Button type="submit" disabled={loading} className="bg-accent text-accent-foreground hover:bg-accent/90">
              {loading ? "Joining..." : "Subscribe"} <ArrowRight className="ml-1 w-4 h-4" />
            </Button>
          </form>
        </motion.div>
      </div>
    </section>
  );
};

export default NewsletterCTA;
