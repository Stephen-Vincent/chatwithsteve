import { useState, useEffect } from "react";
import { Check, X, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PendingComment {
  id: string;
  content: string;
  created_at: string;
  post_id: string;
  user_id: string;
  approved: boolean;
  post_title?: string;
  author_name?: string;
}

const CommentModeration = () => {
  const [comments, setComments] = useState<PendingComment[]>([]);

  const fetchComments = async () => {
    const { data } = await supabase
      .from("comments")
      .select("*")
      .order("created_at", { ascending: false });
    if (!data) return;

    // Fetch post titles and author names
    const postIds = [...new Set(data.map((c) => c.post_id))];
    const userIds = [...new Set(data.map((c) => c.user_id))];

    const [{ data: posts }, { data: profiles }] = await Promise.all([
      supabase.from("blog_posts").select("id, title").in("id", postIds),
      supabase.from("profiles").select("id, display_name").in("id", userIds),
    ]);

    const postMap = new Map(posts?.map((p) => [p.id, p.title]) || []);
    const profileMap = new Map(profiles?.map((p) => [p.id, p.display_name]) || []);

    setComments(
      data.map((c) => ({
        ...c,
        post_title: postMap.get(c.post_id) || "Unknown post",
        author_name: profileMap.get(c.user_id) || "Anonymous",
      }))
    );
  };

  useEffect(() => {
    fetchComments();
  }, []);

  const approveComment = async (id: string) => {
    const { error } = await supabase.from("comments").update({ approved: true }).eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Comment approved");
      fetchComments();
    }
  };

  const rejectComment = async (id: string) => {
    const { error } = await supabase.from("comments").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Comment deleted");
      fetchComments();
    }
  };

  const pending = comments.filter((c) => !c.approved);
  const approved = comments.filter((c) => c.approved);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium text-foreground mb-3">
          Pending Approval ({pending.length})
        </h3>
        {pending.length === 0 ? (
          <p className="text-sm text-muted-foreground">No comments awaiting approval.</p>
        ) : (
          <div className="space-y-2">
            {pending.map((c) => (
              <div key={c.id} className="p-3 rounded-lg border bg-background">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground mb-1">{c.content}</p>
                    <p className="text-xs text-muted-foreground">
                      {c.author_name} · on "{c.post_title}" · {new Date(c.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={() => approveComment(c.id)}
                      className="p-1.5 rounded hover:bg-accent/10 text-accent transition-colors"
                      title="Approve"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => rejectComment(c.id)}
                      className="p-1.5 rounded hover:bg-destructive/10 text-destructive transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="text-sm font-medium text-foreground mb-3">
          Approved ({approved.length})
        </h3>
        {approved.length === 0 ? (
          <p className="text-sm text-muted-foreground">No approved comments yet.</p>
        ) : (
          <div className="space-y-2">
            {approved.map((c) => (
              <div key={c.id} className="p-3 rounded-lg border bg-background">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground mb-1">{c.content}</p>
                    <p className="text-xs text-muted-foreground">
                      {c.author_name} · on "{c.post_title}" · {new Date(c.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => rejectComment(c.id)}
                    className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentModeration;
