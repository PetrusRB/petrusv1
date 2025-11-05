'use client';
import { useState, useEffect, useCallback } from 'react';
import { Menu, X, Bot, Book, LogIn } from 'lucide-react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button/Button';
import { ThemeToggle } from '@/components/ui/themeToggle';
import Image from 'next/image';

const NAV_ITEMS = [
  {
    label: 'Adicionar Bot',
    href: process.env.NEXT_PUBLIC_INVITE_LINK || '#',
    icon: Bot,
    external: true,
    highlight: false,
  },
  {
    label: 'Comandos',
    href: '/commands',
    icon: Book,
    external: false,
    highlight: false,
  },
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LogIn,
    external: false,
    highlight: true,
  },
] as const;

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useRouter();
  const pathName = usePathname();

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const toggleMenu = useCallback(() => setIsOpen((prev) => !prev), []);

  const closeMenu = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    closeMenu();
  }, [pathName, closeMenu]);

  const handleNavClick = (href: string, external: boolean) => {
    if (external) {
      window.open(href, '_blank', 'noopener,noreferrer');
    } else {
      navigate.push(href);
    }
    closeMenu();
  };

  return (
    <>
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{
          opacity: isVisible ? 1 : 0,
          y: isVisible ? 0 : -20,
        }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="fixed top-4 left-0 right-0 mx-auto  w-[95%] max-w-6xl z-50"
      >
        <div className="relative bg-card/80 backdrop-blur-xl border border-primary/20 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12),var(--shadow-glow)] px-4 py-3 sm:px-6">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-3 group"
              onClick={closeMenu}
            >
              <motion.div
                whileHover={{ scale: 1.05, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                className="relative w-30 h-12 sm:w-30 sm:h-12"
              >
                <Image alt="Logo" src="/Petrus.png" width={90} height={90} />
              </motion.div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-2">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.href}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant={item.highlight ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => handleNavClick(item.href, item.external)}
                      className="gap-2"
                    >
                      <Icon size={16} />
                      {item.label}
                    </Button>
                  </motion.div>
                );
              })}
              <div className="ml-2">
                <ThemeToggle />
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center gap-2 md:hidden">
              <ThemeToggle />
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={toggleMenu}
                className="p-2 rounded-lg bg-primary/10 hover:bg-primary/20 border border-primary/20 transition-colors"
                aria-label="Toggle menu"
              >
                <AnimatePresence mode="wait">
                  {isOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <X className="w-6 h-6 text-primary" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Menu className="w-6 h-6 text-primary" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="md:hidden overflow-hidden"
              >
                <div className="pt-4 pb-2 space-y-2 border-t border-primary/10 mt-3">
                  {NAV_ITEMS.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <motion.div
                        key={item.href}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Button
                          variant={item.highlight ? 'default' : 'ghost'}
                          size="lg"
                          onClick={() =>
                            handleNavClick(item.href, item.external)
                          }
                          className="w-full justify-start gap-3"
                        >
                          <Icon size={18} />
                          {item.label}
                        </Button>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.nav>

      {/* Backdrop for mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
            onClick={closeMenu}
          />
        )}
      </AnimatePresence>
    </>
  );
}
