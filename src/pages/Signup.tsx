import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Signup = () => {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newsletter, setNewsletter] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setSubmitting(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
        emailRedirectTo: window.location.origin,
      },
    });

    if (error) {
      toast.error(error.message);
      setSubmitting(false);
      return;
    }

    if (data.user) {
      // Update profile
      await supabase
        .from("profiles")
        .update({ newsletter_opt_in: newsletter, display_name: displayName })
        .eq("id", data.user.id);

      // Add to subscribers table if newsletter opted in
      if (newsletter) {
        await supabase
          .from("subscribers" as any)
          .insert([{ email: email.trim() }]);
      }
    }

    toast.success("Check your email to verify your account!");
    setSubmitting(false);
    navigate("/blog");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-14">
        <section className="py-20">
          <div className="container max-w-sm">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="text-2xl font-display font-bold mb-2 text-center">Create Account</h1>
              <p className="text-sm text-muted-foreground text-center mb-6">
                Join the conversation — comment on posts and stay in the loop.
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Display Name</label>
                  <Input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your name"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Email</label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Password</label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
                <div className="flex items-start gap-2 pt-1">
                  <Checkbox
                    id="newsletter"
                    checked={newsletter}
                    onCheckedChange={(checked) => setNewsletter(checked === true)}
                    className="mt-0.5"
                  />
                  <label htmlFor="newsletter" className="text-sm text-muted-foreground cursor-pointer leading-tight">
                    Subscribe to the newsletter — get new posts and updates in your inbox.
                  </label>
                </div>
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? "Creating account..." : "Sign Up"}
                </Button>
              </form>
              <p className="text-sm text-muted-foreground text-center mt-4">
                Already have an account?{" "}
                <Link to="/login" className="text-accent hover:underline">Sign in</Link>
              </p>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Signup;
