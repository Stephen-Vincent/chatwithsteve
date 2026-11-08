export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  readTime: string;
  category: string;
}

export const blogPosts: BlogPost[] = [
  {
    slug: "why-i-decided-to-build-in-public",
    title: "Why I Decided to Build in Public",
    excerpt:
      "Most people build behind closed doors. I chose to share everything — here's why that matters.",
    content: `Most people build behind closed doors. I chose to share everything — here's why that matters.\n\nWhen I started this journey, I had two options: build quietly and reveal the finished product, or document every step along the way. I chose the latter because I believe the process is just as valuable as the outcome.\n\nBuilding in public keeps me accountable. When you tell people what you're doing, you can't quietly quit. Every post, every video, every article is a commitment to keep going.\n\nIt also helps others. The biggest breakthroughs I've had came from reading about other people's real experiences — not polished case studies, but raw, honest accounts of what actually happened.\n\nThat's what Chat with Steve is about. No filters, no guru energy. Just a guy building something and sharing what he learns along the way.`,
    date: "2026-03-05",
    readTime: "4 min",
    category: "Journey",
  },
  {
    slug: "first-month-lessons",
    title: "5 Things I Learned in My First Month of Business",
    excerpt:
      "Month one is a reality check. Here are the five biggest lessons that changed how I think about building.",
    content: `Month one is a reality check. Here are the five biggest lessons that changed how I think about building.\n\n1. Speed beats perfection. I spent weeks perfecting things nobody cared about. Ship fast, learn faster.\n\n2. Talk to real people. The best insights don't come from books or courses — they come from conversations with people who've done it.\n\n3. Your first idea probably isn't it. And that's fine. The point is to start, not to get it right immediately.\n\n4. Consistency compounds. One post, one video, one conversation at a time. It feels slow until it doesn't.\n\n5. Mindset is everything. The hardest part of building a business isn't the tactics — it's managing the doubt, fear, and uncertainty that come with it.\n\nMonth two starts now. Let's see what happens.`,
    date: "2026-02-22",
    readTime: "5 min",
    category: "Lessons",
  },
  {
    slug: "content-strategy-for-beginners",
    title: "My Simple Content Strategy (That Actually Works)",
    excerpt:
      "You don't need a 50-page playbook. Here's the straightforward approach I use to create content across platforms.",
    content: `You don't need a 50-page playbook. Here's the straightforward approach I use to create content across platforms.\n\nI post on three platforms: Instagram, TikTok, and YouTube. Each serves a different purpose but they all feed into the same brand.\n\nInstagram is for community. Stories, behind-the-scenes, quick updates. It's where people get to know me.\n\nTikTok is for reach. Short, punchy videos that teach something in 60 seconds or less. This is where new people discover me.\n\nYouTube is for depth. Longer videos where I can really break down a topic. This is where trust is built.\n\nThe key? I don't create separate content for each platform. I take one idea and adapt it. A YouTube video becomes a TikTok clip which becomes an Instagram carousel. One idea, three formats.\n\nKeep it simple. Stay consistent. That's the strategy.`,
    date: "2026-02-12",
    readTime: "4 min",
    category: "Strategy",
  },
];
