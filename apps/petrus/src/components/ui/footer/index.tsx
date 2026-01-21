'use client';
import { motion } from 'motion/react';
import { Heart, Github, Twitter } from 'lucide-react';
import Image from 'next/image';
export const Footer = () => {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.6 }}
      className="w-full items-center content-center mt-16 pb-8"
    >
      {/* Divider */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent mb-8" />

      <div className="flex flex-col items-center gap-6">
        {/* Programmer Icon with Animation */}
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: 'spring', stiffness: 400, damping: 10 }}
          className="relative"
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border-2 border-primary/50 shadow-[var(--shadow-glow)]">
            <Image
              alt="Programmer"
              src="https://cdn.discordapp.com/avatars/562455535497117707/21c4f7dd1c97e58e6c39c5d4cdbd49b2.webp?size=80"
              width={60}
              height={60}
              style={{ borderRadius: 50 }}
            />
          </div>
        </motion.div>

        {/* Main Footer Content */}
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground flex items-center justify-center gap-2 flex-wrap">
            Desenvolvido com
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
              className="inline-block"
            >
              <Heart className="text-primary fill-primary" size={16} />
            </motion.span>
            por P3dr0 A.B
          </p>

          <p className="text-xs text-muted-foreground">
            © 2025 Petrus Bot. Todos os direitos reservados.
          </p>
        </div>

        {/* Social Links */}
        <div className="flex items-center gap-4">
          <motion.a
            href={process.env.NEXT_PUBLIC_GITHUB_LINK}
            whileHover={{ scale: 1.1, y: -2 }}
            className="w-10 h-10 rounded-full bg-card border border-border hover:border-primary/50 flex items-center justify-center transition-colors group"
            aria-label="GitHub"
          >
            <Github
              className="text-muted-foreground group-hover:text-primary transition-colors"
              size={18}
            />
          </motion.a>

          <motion.a
            href={process.env.NEXT_PUBLIC_TWITTER_LINK}
            whileHover={{ scale: 1.1, y: -2 }}
            className="w-10 h-10 rounded-full bg-card border border-border hover:border-primary/50 flex items-center justify-center transition-colors group"
            aria-label="Twitter"
          >
            <Twitter
              className="text-muted-foreground group-hover:text-primary transition-colors"
              size={18}
            />
          </motion.a>
        </div>

        {/* Tech Badge */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20"
        >
          <p className="text-xs font-medium text-foreground">
            Powered by Discord & React
          </p>
        </motion.div>
      </div>
    </motion.footer>
  );
};
