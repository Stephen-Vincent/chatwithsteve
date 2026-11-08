import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await signIn(email, password);
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Logged in!");

    // Check if user is admin to determine redirect
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: isAdmin } = await supabase.rpc("has_role", {
        _user_id: user.id,
        _role: "admin",
      });
      if (isAdmin) {
        navigate("/admin");
        return;
      }
    }

    // Regular user: redirect to returnTo or /blog
    const returnTo = searchParams.get("returnTo");
    navigate(returnTo || "/blog");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-14">
        <section className="py-20">
          <div className="container max-w-sm">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-2xl font-display font-bold mb-6 text-center">Sign In</h1>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Email</label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Password</label>
                  <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? "Signing in..." : "Sign In"}
                </Button>
              </form>
              <p className="text-sm text-muted-foreground text-center mt-4">
                Don't have an account?{" "}
                <Link to="/signup" className="text-accent hover:underline">Sign up</Link>
              </p>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Login;
