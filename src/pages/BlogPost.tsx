import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BlogActions from "@/components/blog/BlogActions";
import BlogComments from "@/components/blog/BlogComments";
import { useBlogPost } from "@/hooks/useBlogPosts";

const BlogPost = () => {
  const { slug } = useParams();
  const { data: post, isLoading } = useBlogPost(slug);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-14 py-20 container text-center">
          <p className="text-muted-foreground">Loading...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-14 py-20 container text-center">
          <h1 className="text-3xl font-display font-bold mb-4">Post not found</h1>
          <Link to="/blog" className="text-accent hover:underline">Back to blog</Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-14">
        <article className="py-20">
          <div className="container max-w-3xl">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Link
                to="/blog"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors mb-8"
              >
                <ArrowLeft className="w-4 h-4" /> Back to blog
              </Link>

              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs font-medium text-accent">{post.category}</span>
                <span className="text-xs text-muted-foreground">
                  {post.created_at.split("T")[0]} · {post.read_time}
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl font-display font-bold mb-8">{post.title}</h1>

              {post.cover_image_url && (
                <div className="rounded-xl overflow-hidden mb-8">
                  <img
                    src={post.cover_image_url}
                    alt={post.title}
                    className="w-full h-auto object-cover max-h-[480px]"
                  />
                </div>
              )}

              <div className="space-y-6">
                {post.content.split("\n\n").map((paragraph, i) => (
                  <p key={i} className="text-foreground/85 leading-relaxed">{paragraph}</p>
                ))}
              </div>

              <BlogActions postId={post.id} postTitle={post.title} postSlug={post.slug} />
              <BlogComments postId={post.id} />
            </motion.div>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
};

export default BlogPost;
