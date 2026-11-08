import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  read_time: string;
  published: boolean;
  cover_image_url: string | null;
  created_at: string;
}

export const useBlogPosts = () => {
  return useQuery({
    queryKey: ["blog_posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("published", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as BlogPost[];
    },
  });
};

export const useBlogPost = (slug: string | undefined) => {
  return useQuery({
    queryKey: ["blog_post", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", slug!)
        .eq("published", true)
        .single();
      if (error) throw error;
      return data as BlogPost;
    },
    enabled: !!slug,
  });
};
