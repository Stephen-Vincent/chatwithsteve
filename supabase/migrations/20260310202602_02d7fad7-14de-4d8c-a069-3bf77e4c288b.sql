CREATE TABLE public.blog_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'General',
  read_time TEXT NOT NULL DEFAULT '3 min',
  published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published posts" ON public.blog_posts
  FOR SELECT USING (published = true);

CREATE POLICY "Admins can view all posts" ON public.blog_posts
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert posts" ON public.blog_posts
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update posts" ON public.blog_posts
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete posts" ON public.blog_posts
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed existing blog posts
INSERT INTO public.blog_posts (title, slug, excerpt, content, category, read_time, published, created_at) VALUES
('Why I Decided to Build in Public', 'why-i-decided-to-build-in-public', 'Most people build behind closed doors. I chose to share everything — here''s why that matters.', 'Most people build behind closed doors. I chose to share everything — here''s why that matters.

When I started this journey, I had two options: build quietly and reveal the finished product, or document every step along the way. I chose the latter because I believe the process is just as valuable as the outcome.

Building in public keeps me accountable. When you tell people what you''re doing, you can''t quietly quit. Every post, every video, every article is a commitment to keep going.

It also helps others. The biggest breakthroughs I''ve had came from reading about other people''s real experiences — not polished case studies, but raw, honest accounts of what actually happened.

That''s what Chat with Steve is about. No filters, no guru energy. Just a guy building something and sharing what he learns along the way.', 'Journey', '4 min', true, '2026-03-05'),
('5 Things I Learned in My First Month of Business', 'first-month-lessons', 'Month one is a reality check. Here are the five biggest lessons that changed how I think about building.', 'Month one is a reality check. Here are the five biggest lessons that changed how I think about building.

1. Speed beats perfection. I spent weeks perfecting things nobody cared about. Ship fast, learn faster.

2. Talk to real people. The best insights don''t come from books or courses — they come from conversations with people who''ve done it.

3. Your first idea probably isn''t it. And that''s fine. The point is to start, not to get it right immediately.

4. Consistency compounds. One post, one video, one conversation at a time. It feels slow until it doesn''t.

5. Mindset is everything. The hardest part of building a business isn''t the tactics — it''s managing the doubt, fear, and uncertainty that come with it.

Month two starts now. Let''s see what happens.', 'Lessons', '5 min', true, '2026-02-22'),
('My Simple Content Strategy (That Actually Works)', 'content-strategy-for-beginners', 'You don''t need a 50-page playbook. Here''s the straightforward approach I use to create content across platforms.', 'You don''t need a 50-page playbook. Here''s the straightforward approach I use to create content across platforms.

I post on three platforms: Instagram, TikTok, and YouTube. Each serves a different purpose but they all feed into the same brand.

Instagram is for community. Stories, behind-the-scenes, quick updates. It''s where people get to know me.

TikTok is for reach. Short, punchy videos that teach something in 60 seconds or less. This is where new people discover me.

YouTube is for depth. Longer videos where I can really break down a topic. This is where trust is built.

The key? I don''t create separate content for each platform. I take one idea and adapt it. A YouTube video becomes a TikTok clip which becomes an Instagram carousel. One idea, three formats.

Keep it simple. Stay consistent. That''s the strategy.', 'Strategy', '4 min', true, '2026-02-12');