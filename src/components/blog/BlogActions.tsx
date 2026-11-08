import { useState, useEffect } from "react";
import { Heart, Share2, Twitter, Linkedin, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const BlogActions = ({ postId, postTitle, postSlug }: { postId: string; postTitle: string; postSlug: string }) => {
  const { user } = useAuth();
  const [likeCount, setLikeCount] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [showShare, setShowShare] = useState(false);

  const fetchLikes = async () => {
    const { count } = await supabase
      .from("post_likes")
      .select("*", { count: "exact", head: true })
      .eq("post_id", postId);
    setLikeCount(count || 0);

    if (user) {
      const { data } = await supabase
        .from("post_likes")
        .select("id")
        .eq("post_id", postId)
        .eq("user_id", user.id)
        .maybeSingle();
      setHasLiked(!!data);
    }
  };

  useEffect(() => {
    fetchLikes();
  }, [postId, user]);

  const toggleLike = async () => {
    if (!user) {
      toast.error("Sign in to like posts");
      return;
    }
    if (hasLiked) {
      await supabase
        .from("post_likes")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", user.id);
    } else {
      await supabase
        .from("post_likes")
        .insert({ post_id: postId, user_id: user.id });
    }
    fetchLikes();
  };

  const postUrl = `${window.location.origin}/blog/${postSlug}`;

  const shareLinks = [
    {
      icon: Twitter,
      label: "X / Twitter",
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(postTitle)}&url=${encodeURIComponent(postUrl)}`,
    },
    {
      icon: Linkedin,
      label: "LinkedIn",
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`,
    },
  ];

  const copyLink = () => {
    navigator.clipboard.writeText(postUrl);
    toast.success("Link copied!");
    setShowShare(false);
  };

  return (
    <div className="flex items-center gap-3 mt-8 pt-6 border-t">
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleLike}
        className={`gap-2 ${hasLiked ? "text-red-500 hover:text-red-600" : "text-muted-foreground"}`}
      >
        <Heart className={`w-4 h-4 ${hasLiked ? "fill-current" : ""}`} />
        {likeCount > 0 && <span>{likeCount}</span>}
      </Button>

      <div className="relative">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowShare(!showShare)}
          className="gap-2 text-muted-foreground"
        >
          <Share2 className="w-4 h-4" /> Share
        </Button>
        {showShare && (
          <div className="absolute bottom-full left-0 mb-2 bg-card border rounded-lg shadow-lg p-2 min-w-[160px] z-10">
            {shareLinks.map(({ icon: Icon, label, url }) => (
              <a
                key={label}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted rounded transition-colors"
                onClick={() => setShowShare(false)}
              >
                <Icon className="w-4 h-4" /> {label}
              </a>
            ))}
            <button
              onClick={copyLink}
              className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted rounded transition-colors w-full"
            >
              <LinkIcon className="w-4 h-4" /> Copy link
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogActions;
