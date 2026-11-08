import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LogOut, FileText, Clock, MessageSquare, CalendarCheck } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import BlogManager from "@/components/admin/BlogManager";
import AvailabilityManager from "@/components/admin/AvailabilityManager";
import CommentModeration from "@/components/admin/CommentModeration";
import BookingManager from "@/components/admin/BookingManager";

type Tab = "bookings" | "blog" | "availability" | "comments";

const Admin = () => {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("bookings");

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate("/login");
    }
  }, [loading, user, isAdmin, navigate]);

  if (loading || !isAdmin) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-14">
        <section className="py-6 sm:py-12">
          <div className="container max-w-3xl px-4 sm:px-6">
            <div className="flex items-center justify-between mb-6 sm:mb-8">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl sm:text-3xl font-display font-bold"
              >
                Dashboard
              </motion.h1>
              <Button variant="ghost" size="sm" onClick={() => { signOut(); navigate("/"); }}>
                <LogOut className="w-4 h-4 mr-1" /> <span className="hidden sm:inline">Sign out</span>
              </Button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-6 sm:mb-8 p-1 bg-muted rounded-lg overflow-x-auto scrollbar-hide">
              <button
                onClick={() => setTab("bookings")}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                  tab === "bookings"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <CalendarCheck className="w-4 h-4 flex-shrink-0" /> Bookings
              </button>
              <button
                onClick={() => setTab("blog")}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                  tab === "blog"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <FileText className="w-4 h-4 flex-shrink-0" /> Blog
              </button>
              <button
                onClick={() => setTab("availability")}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                  tab === "availability"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Clock className="w-4 h-4 flex-shrink-0" /> Availability
              </button>
              <button
                onClick={() => setTab("comments")}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                  tab === "comments"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <MessageSquare className="w-4 h-4 flex-shrink-0" /> Comments
              </button>
            </div>

            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-xl border p-4 sm:p-6"
            >
              {tab === "bookings" ? <BookingManager /> : tab === "blog" ? <BlogManager /> : tab === "availability" ? <AvailabilityManager /> : <CommentModeration />}
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Admin;
