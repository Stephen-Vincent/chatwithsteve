import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useBlogPosts } from "@/hooks/useBlogPosts";

const LatestPostsSection = () => {
  const { data: posts } = useBlogPosts();
  const latestPosts = posts?.slice(0, 3) ?? [];

  return (
    <section className="py-20 bg-card">
      <div className="container max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-end justify-between mb-12"
        >
          <div>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-card-foreground">Latest Articles</h2>
            <p className="text-muted-foreground mt-2">Lessons, insights, and real talk from the journey.</p>
          </div>
          <Link to="/blog" className="hidden md:flex items-center gap-1 text-sm text-accent font-medium hover:underline">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        <div className="flex flex-col gap-6">
          {latestPosts.map((post, i) => (
            <motion.article
              key={post.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Link
                to={`/blog/${post.slug}`}
                className="group flex items-start gap-5 py-6 border-b last:border-0 hover:pl-2 transition-all"
              >
                {post.cover_image_url && (
                  <img
                    src={post.cover_image_url}
                    alt={post.title}
                    className="w-28 h-20 rounded-lg object-cover flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-medium text-accent">{post.category}</span>
                    <span className="text-xs text-muted-foreground">{post.read_time}</span>
                  </div>
                  <h3 className="text-xl font-display font-semibold text-foreground group-hover:text-accent transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{post.excerpt}</p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap mt-1 hidden sm:block">
                  {post.created_at.split("T")[0]}
                </span>
              </Link>
            </motion.article>
          ))}
        </div>

        <Link to="/blog" className="md:hidden flex items-center gap-1 text-sm text-accent font-medium mt-6 hover:underline">
          View all articles <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
};

export default LatestPostsSection;
