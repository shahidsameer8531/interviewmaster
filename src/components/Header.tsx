'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion';
import { Authenticated, AuthLoading, Unauthenticated } from 'convex/react';
import { ArrowUpRight, ChevronDown } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Logo } from './Logo';
import { MobileMenu } from './MobileMenu';
import { MaxWidthWrapper } from './MaxWidthWrapper';
import { Button } from '@/components/ui/button';
import { navigationSections } from './navigation-data';
import { UserButton } from '../features/auth/components/UserButton';
import { UserButtonLoading } from '../features/auth/components/UserButtonLoading';

const OPEN_DELAY = 120;
const CLOSE_DELAY = 220;

export const Header = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState<number | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const navRef = useRef<HTMLElement>(null);

  useMotionValueEvent(scrollY, 'change', (latest) => {
    const next = latest > 24;
    if (next !== scrolled) setScrolled(next);
  });

  // Close on route change, outside click and Escape.
  useEffect(() => setOpen(null), [pathname]);
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpen(null);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(null);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  const schedule = useCallback((idx: number | null) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(idx), idx === null ? CLOSE_DELAY : OPEN_DELAY);
  }, []);

  const isActiveSection = (href: string) => pathname?.startsWith(href);

  return (
    <motion.header
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,box-shadow] duration-300',
        scrolled
          ? 'surface-glass border-x-0 border-t-0 border-b-border/70 shadow-[0_10px_40px_-20px_rgba(0,0,0,0.8)]'
          : 'border-b border-transparent bg-transparent'
      )}
    >
      <MaxWidthWrapper>
        <nav ref={navRef} className="flex h-[72px] items-center gap-6" aria-label="Primary">
          <Logo className="shrink-0" />

          {/* Desktop navigation. Shown from xl: at lg widths the logo, five menu
              items and the two actions add up to about 1170px, wider than the
              960px available, so the row overflowed and the page scrolled sideways. */}
          <ul className="hidden flex-1 items-center justify-center gap-1 xl:flex" role="menubar">
            {navigationSections.map((section, idx) => {
              const active = open === idx;
              const current = isActiveSection(section.href);
              return (
                <li
                  key={section.key}
                  role="none"
                  className="relative"
                  onMouseEnter={() => schedule(idx)}
                  onMouseLeave={() => schedule(null)}
                >
                  <button
                    type="button"
                    role="menuitem"
                    aria-haspopup="true"
                    aria-expanded={active}
                    onClick={() => setOpen(active ? null : idx)}
                    className={cn(
                      'relative flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-[0.925rem] font-medium transition-colors',
                      active || current ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {section.title}
                    <ChevronDown
                      className={cn('h-3.5 w-3.5 opacity-60 transition-transform duration-200', active && 'rotate-180 opacity-100')}
                    />
                    {(active || current) && (
                      <motion.span
                        layoutId="nav-underline"
                        className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-gold"
                        transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                      />
                    )}
                  </button>

                  <AnimatePresence>
                    {active && (
                      <motion.div
                        role="menu"
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.98 }}
                        transition={{ duration: 0.18, ease: 'easeOut' }}
                        className="absolute left-1/2 top-full z-50 mt-3 w-[560px] -translate-x-1/2"
                      >
                        <div className="surface-glass overflow-hidden rounded-2xl shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)]">
                          <div className="flex items-center justify-between border-b border-white/5 px-5 py-3">
                            <span className="eyebrow">{section.eyebrow}</span>
                            <Link
                              href={section.href}
                              role="menuitem"
                              className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-gold"
                            >
                              All {section.title.toLowerCase()} <ArrowUpRight className="h-3.5 w-3.5" />
                            </Link>
                          </div>
                          <div className="grid grid-cols-2 gap-1 p-2">
                            {section.links
                              .filter((l) => !l.indexOnly)
                              .map((link, i) => (
                                <motion.div
                                  key={link.href}
                                  initial={{ opacity: 0, y: 4 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.03 * i }}
                                >
                                  <Link
                                    href={link.href}
                                    role="menuitem"
                                    className="group/item flex items-start gap-3 rounded-xl p-3 transition-colors hover:bg-white/[0.04]"
                                  >
                                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gold/10 text-gold ring-1 ring-gold/15 transition-all group-hover/item:bg-gold group-hover/item:text-navy-950">
                                      <link.icon className="h-4 w-4" />
                                    </span>
                                    <span className="min-w-0">
                                      <span className="block text-sm font-semibold text-foreground">{link.label}</span>
                                      <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">{link.description}</span>
                                    </span>
                                  </Link>
                                </motion.div>
                              ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
              );
            })}
          </ul>

          {/* Actions */}
          <div className="ml-auto hidden items-center gap-2 xl:flex">
            <AuthLoading>
              <UserButtonLoading />
            </AuthLoading>
            <Unauthenticated>
              <Button variant="ghost" size="sm" onClick={() => router.push('/auth')}>
                Sign in
              </Button>
              <Button size="sm" onClick={() => router.push('/products/mock-interviews')}>
                Start a mock interview
              </Button>
            </Unauthenticated>
            <Authenticated>
              <Button size="sm" variant="outline" onClick={() => router.push('/products/mock-interviews')}>
                Practise
              </Button>
              <UserButton />
            </Authenticated>
          </div>

          <div className="ml-auto flex items-center gap-2 xl:hidden">
            <Authenticated>
              <UserButton />
            </Authenticated>
            <MobileMenu />
          </div>
        </nav>
      </MaxWidthWrapper>
    </motion.header>
  );
};
