'use client';

import Link from 'next/link';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Menu, X } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Logo } from './Logo';
import { Button } from '@/components/ui/button';
import { navigationSections, socialLinks } from './navigation-data';

export const MobileMenu = () => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(navigationSections[0].key);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  const go = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  const panel = (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-navy-950/70 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <motion.aside
            key="panel"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 38 }}
            className="fixed inset-y-0 right-0 z-[70] flex w-[88%] max-w-sm flex-col border-l border-border bg-navy-900"
            role="dialog"
            aria-modal="true"
            aria-label="Site navigation"
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <Logo size="sm" />
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="grid h-10 w-10 place-items-center rounded-lg text-muted-foreground hover:bg-white/5 hover:text-foreground"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-3 py-3">
              {navigationSections.map((section) => {
                const isOpen = expanded === section.key;
                return (
                  <div key={section.key} className="border-b border-white/5 last:border-0">
                    <button
                      type="button"
                      onClick={() => setExpanded(isOpen ? null : section.key)}
                      aria-expanded={isOpen}
                      className="flex w-full items-center justify-between rounded-lg px-2 py-3.5 text-left font-display text-base font-semibold text-foreground"
                    >
                      <span className="flex items-center gap-3">
                        <section.icon className="h-4 w-4 text-gold" />
                        {section.title}
                      </span>
                      <ChevronDown className={cn('h-4 w-4 text-muted-foreground transition-transform', isOpen && 'rotate-180')} />
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.ul
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.22, ease: 'easeOut' }}
                          className="overflow-hidden pb-2"
                        >
                          {section.links.map((link) => (
                            <li key={link.href}>
                              <button
                                type="button"
                                onClick={() => go(link.href)}
                                className="flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left text-sm text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
                              >
                                <link.icon className="h-4 w-4 opacity-70" />
                                {link.label}
                              </button>
                            </li>
                          ))}
                          <li>
                            <Link
                              href={section.href}
                              onClick={() => setOpen(false)}
                              className="block px-2 py-2 text-xs font-medium text-gold"
                            >
                              All {section.title.toLowerCase()}
                            </Link>
                          </li>
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </nav>

            <div className="space-y-3 border-t border-border p-4">
              <Button className="w-full" onClick={() => go('/dashboard/interview/new')}>
                Start a mock interview
              </Button>
              <Button variant="outline" className="w-full" onClick={() => go('/auth')}>
                Sign in
              </Button>
              <div className="flex items-center justify-center gap-1 pt-1">
                {socialLinks.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground hover:text-gold"
                  >
                    <s.icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="grid h-10 w-10 place-items-center rounded-lg text-foreground hover:bg-white/5"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>
      {mounted && createPortal(panel, document.body)}
    </>
  );
};
