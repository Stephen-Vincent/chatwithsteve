import { motion } from "framer-motion";
import { Instagram, Youtube } from "lucide-react";

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.71a8.21 8.21 0 0 0 4.76 1.52v-3.4a4.85 4.85 0 0 1-1-.14z" />
  </svg>
);

const socials = [
  {
    name: "Instagram",
    handle: "@chat.with.steve",
    url: "https://instagram.com/chat.with.steve",
    icon: Instagram,
  },
  {
    name: "TikTok",
    handle: "@chat.with.steve",
    url: "https://tiktok.com/@chat.with.steve",
    icon: TikTokIcon,
  },
  {
    name: "YouTube",
    handle: "@chatwithsteveofficial",
    url: "https://youtube.com/@chatwithsteveofficial",
    icon: Youtube,
  },
];

const SocialSection = () => (
  <section className="py-20">
    <div className="container max-w-3xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl md:text-4xl font-display font-bold">Follow the Journey</h2>
        <p className="text-muted-foreground mt-2">I post daily across these platforms.</p>
      </motion.div>

      <div className="flex flex-wrap justify-center gap-3">
        {socials.map((s, i) => (
          <motion.a
            key={s.name}
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="flex items-center gap-2 px-5 py-3 rounded-full border bg-card hover:border-accent/50 hover:bg-accent/5 transition-colors group"
          >
            <s.icon className="w-5 h-5 text-muted-foreground group-hover:text-accent transition-colors" />
            <span className="text-sm font-medium text-foreground group-hover:text-accent transition-colors">{s.handle}</span>
          </motion.a>
        ))}
      </div>
    </div>
  </section>
);

export default SocialSection;
