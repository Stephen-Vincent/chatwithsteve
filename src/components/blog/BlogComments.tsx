import { useState, useEffect } from "react";
import { MessageSquare, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Link, useLocation } from "react-router-dom";
import { toast } from "sonner";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles?: { display_name: string } | null;
}

const BlogComments = ({ postId }: { postId: string }) => {
  const { user, isAdmin } = useAuth();
  const location = useLocation();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchComments = async () => {
    const { data } = await supabase
      .from("comments")
      .select("*")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });
    if (!data) return;

    // Fetch display names for comment authors
    const userIds = [...new Set(data.map((c) => c.user_id))];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, display_name")
      .in("id", userIds);

    const profileMap = new Map(profiles?.map((p) => [p.id, p.display_name]) || []);

    setComments(
      data.map((c) => ({
        ...c,
        profiles: { display_name: profileMap.get(c.user_id) || "" },
      }))
    );
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const submitComment = async () => {
    if (!newComment.trim() || !user) return;
    setSubmitting(true);
    const { error } = await supabase.from("comments").insert({
      post_id: postId,
      user_id: user.id,
      content: newComment.trim(),
    });
    if (error) {
      toast.error(error.message);
    } else {
      setNewComment("");
      toast.success("Comment submitted — it will appear after approval.");
      fetchComments();
    }
    setSubmitting(false);
  };

  const deleteComment = async (id: string) => {
    await supabase.from("comments").delete().eq("id", id);
    fetchComments();
  };

  return (
    <div className="mt-12 pt-8 border-t">
      <h3 className="text-lg font-display font-semibold mb-6 flex items-center gap-2">
        <MessageSquare className="w-5 h-5" />
        Comments ({comments.length})
      </h3>

      {user ? (
        <div className="mb-6">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Leave a comment..."
            rows={3}
            className="mb-2"
          />
          <Button size="sm" onClick={submitComment} disabled={submitting || !newComment.trim()}>
            {submitting ? "Posting..." : "Post Comment"}
          </Button>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground mb-6">
          <Link to={`/signup?returnTo=${encodeURIComponent(location.pathname)}`} className="text-accent hover:underline">Sign up</Link>
          {" "}or{" "}
          <Link to={`/login?returnTo=${encodeURIComponent(location.pathname)}`} className="text-accent hover:underline">log in</Link>
          {" "}to leave a comment.
        </p>
      )}

      {comments.length === 0 ? (
        <p className="text-sm text-muted-foreground">No comments yet. Be the first!</p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="p-4 rounded-lg bg-card border">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">
                    {comment.profiles?.display_name || "Anonymous"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(comment.created_at).toLocaleDateString()}
                  </span>
                </div>
                {(user?.id === comment.user_id || isAdmin) && (
                  <button
                    onClick={() => deleteComment(comment.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <p className="text-sm text-foreground/85 leading-relaxed">{comment.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BlogComments;
