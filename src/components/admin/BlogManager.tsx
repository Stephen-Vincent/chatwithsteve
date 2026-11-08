import { useState, useEffect, useRef } from "react";
import { Plus, Pencil, Trash2, Eye, EyeOff, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  read_time: string;
  published: boolean;
  cover_image_url: string | null;
  created_at: string;
}

const BlogManager = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const emptyPost: Omit<BlogPost, "id" | "created_at"> = {
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    category: "General",
    read_time: "3 min",
    published: false,
    cover_image_url: null,
  };

  const [form, setForm] = useState(emptyPost);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const { data } = await supabase
      .from("blog_posts")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setPosts(data as BlogPost[]);
  };

  const generateSlug = (title: string) =>
    title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const startNew = () => {
    setForm(emptyPost);
    setIsNew(true);
    setEditing(null);
  };

  const startEdit = (post: BlogPost) => {
    setForm({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      category: post.category,
      read_time: post.read_time,
      published: post.published,
      cover_image_url: post.cover_image_url,
    });
    setEditing(post);
    setIsNew(false);
  };

  const cancel = () => {
    setEditing(null);
    setIsNew(false);
  };

  const uploadImage = async (file: File) => {
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `covers/${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from("blog-images")
      .upload(path, file, { cacheControl: "3600", upsert: false });

    if (error) {
      toast.error("Upload failed: " + error.message);
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("blog-images")
      .getPublicUrl(path);

    setForm((f) => ({ ...f, cover_image_url: urlData.publicUrl }));
    setUploading(false);
    toast.success("Image uploaded");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image must be under 5MB");
        return;
      }
      uploadImage(file);
    }
  };

  const removeImage = () => {
    setForm((f) => ({ ...f, cover_image_url: null }));
  };

  const save = async () => {
    if (!form.title.trim() || !form.slug.trim()) {
      toast.error("Title and slug are required");
      return;
    }

    if (isNew) {
      const { error } = await supabase.from("blog_posts").insert(form);
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("Post created");
    } else if (editing) {
      const { error } = await supabase
        .from("blog_posts")
        .update(form)
        .eq("id", editing.id);
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("Post updated");
    }
    cancel();
    fetchPosts();
  };

  const deletePost = async (id: string) => {
    const { error } = await supabase.from("blog_posts").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Post deleted");
      fetchPosts();
    }
  };

  const togglePublish = async (post: BlogPost) => {
    await supabase
      .from("blog_posts")
      .update({ published: !post.published })
      .eq("id", post.id);
    fetchPosts();
  };

  // Show form
  if (isNew || editing) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-display font-semibold">
          {isNew ? "New Post" : "Edit Post"}
        </h3>

        {/* Cover Image Upload */}
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Cover Image</label>
          {form.cover_image_url ? (
            <div className="relative rounded-lg overflow-hidden border bg-muted">
              <img
                src={form.cover_image_url}
                alt="Cover preview"
                className="w-full h-48 object-cover"
              />
              <button
                onClick={removeImage}
                className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm rounded-full p-1.5 hover:bg-destructive hover:text-destructive-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full h-32 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-accent hover:text-accent transition-colors"
            >
              <Upload className="w-5 h-5" />
              <span className="text-sm">{uploading ? "Uploading..." : "Click to upload cover image"}</span>
              <span className="text-xs text-muted-foreground/60">Recommended: 1200 × 630px (16:9)</span>
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Title</label>
          <Input
            value={form.title}
            onChange={(e) => {
              const title = e.target.value;
              setForm((f) => ({
                ...f,
                title,
                slug: isNew ? generateSlug(title) : f.slug,
              }));
            }}
            placeholder="Post title"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Slug</label>
          <Input
            value={form.slug}
            onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
            placeholder="post-url-slug"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Category</label>
            <Input
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Read Time</label>
            <Input
              value={form.read_time}
              onChange={(e) => setForm((f) => ({ ...f, read_time: e.target.value }))}
              placeholder="5 min"
            />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Excerpt</label>
          <Textarea
            value={form.excerpt}
            onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
            rows={2}
            placeholder="Short description..."
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Content</label>
          <Textarea
            value={form.content}
            onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
            rows={12}
            placeholder="Write your post content here. Use double line breaks for paragraphs."
          />
        </div>
        <div className="flex items-center gap-2">
          <Switch
            checked={form.published}
            onCheckedChange={(checked) => setForm((f) => ({ ...f, published: checked }))}
          />
          <span className="text-sm text-foreground">
            {form.published ? "Published" : "Draft"}
          </span>
        </div>
        <div className="flex gap-2">
          <Button onClick={save} size="sm">Save</Button>
          <Button onClick={cancel} variant="ghost" size="sm">Cancel</Button>
        </div>
      </div>
    );
  }

  // Show list
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          Manage your blog posts. Toggle publish status or edit content.
        </p>
        <Button onClick={startNew} size="sm">
          <Plus className="w-4 h-4 mr-1" /> New Post
        </Button>
      </div>

      {posts.length === 0 ? (
        <p className="text-sm text-muted-foreground">No blog posts yet.</p>
      ) : (
        <div className="space-y-2">
          {posts.map((post) => (
            <div
              key={post.id}
              className="flex items-center justify-between p-3 rounded-lg border bg-background"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {post.cover_image_url && (
                  <img
                    src={post.cover_image_url}
                    alt=""
                    className="w-10 h-10 rounded object-cover flex-shrink-0"
                  />
                )}
                <button
                  onClick={() => togglePublish(post)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  title={post.published ? "Unpublish" : "Publish"}
                >
                  {post.published ? (
                    <Eye className="w-4 h-4 text-accent" />
                  ) : (
                    <EyeOff className="w-4 h-4" />
                  )}
                </button>
                <div className="min-w-0">
                  <span className="text-sm font-medium text-foreground block truncate">
                    {post.title}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {post.category} · {post.read_time} · {post.created_at.split("T")[0]}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => startEdit(post)}
                  className="text-muted-foreground hover:text-foreground transition-colors p-1"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deletePost(post.id)}
                  className="text-muted-foreground hover:text-destructive transition-colors p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BlogManager;
