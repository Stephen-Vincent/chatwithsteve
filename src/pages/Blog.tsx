import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useBlogPosts } from "@/hooks/useBlogPosts";

const Blog = () => {
  const { data: posts, isLoading } = useBlogPosts();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-14">
        <section className="py-20">
          <div className="container max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-12"
            >
              <h1 className="text-4xl md:text-5xl font-display font-bold mb-3">Blog</h1>
              <p className="text-muted-foreground">
                Lessons learned building a business from scratch.
              </p>
            </motion.div>

            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading posts...</p>
            ) : !posts?.length ? (
              <p className="text-sm text-muted-foreground">No posts yet. Check back soon!</p>
            ) : (
              <div className="flex flex-col">
                {posts.map((post, i) => (
                  <motion.article
                    key={post.slug}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                  >
                    <Link
                      to={`/blog/${post.slug}`}
                      className="group flex items-start gap-5 py-6 border-b hover:pl-2 transition-all"
                    >
                      {post.cover_image_url && (
                        <img
                          src={post.cover_image_url}
                          alt={post.title}
                          className="w-28 h-20 rounded-lg object-cover flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1.5">
                          <span className="text-xs font-medium text-accent">{post.category}</span>
                          <span className="text-xs text-muted-foreground">{post.read_time}</span>
                        </div>
                        <h2 className="text-xl font-display font-semibold text-foreground group-hover:text-accent transition-colors">
                          {post.title}
                        </h2>
                        <p className="text-sm text-muted-foreground mt-1">{post.excerpt}</p>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap mt-1 hidden sm:block">
                        {post.created_at.split("T")[0]}
                      </span>
                    </Link>
                  </motion.article>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Blog;
