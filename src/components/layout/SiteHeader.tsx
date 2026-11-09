'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LogoLockup } from '@/components/brand/LogoLockup';
import { Container } from '@/components/layout/Container';
import { ButtonLink } from '@/components/ui/Button';
import { primaryNav } from '@/lib/site';

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Note: the mobile panel is closed by an explicit click handler on each link
  // rather than an effect, so navigation never leaves a stale open panel and no
  // setState-in-effect cascade is required.

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Lock body scroll and allow Escape to close while the mobile panel is open.
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = original;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header
      className={[
        'sticky top-0 z-50 border-b bg-white/95 backdrop-blur-sm transition-shadow duration-200',
        scrolled ? 'border-charcoal/10 shadow-[0_1px_20px_rgba(17,17,17,0.06)]' : 'border-transparent',
      ].join(' ')}
    >
      <Container>
        <div className="flex h-[4.5rem] items-center justify-between gap-6 lg:h-[5rem]">
          <Link
            href="/"
            aria-label="Obsidixz Real Estate home"
            className="shrink-0 leading-none"
          >
            <LogoLockup />
          </Link>

          {/* Desktop navigation */}
          <nav aria-label="Primary" className="hidden xl:block">
            <ul className="flex items-center gap-7">
              {primaryNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive(item.href) ? 'page' : undefined}
                    className={[
                      'relative py-2 text-[0.92rem] font-semibold transition-colors duration-150',
                      isActive(item.href)
                        ? 'text-royal'
                        : 'text-charcoal/80 hover:text-royal',
                    ].join(' ')}
                  >
                    {item.label}
                    <span
                      aria-hidden="true"
                      className={[
                        'absolute -bottom-0.5 left-0 h-[2px] w-full bg-gold transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]',
                        isActive(item.href) ? 'scale-x-100' : 'scale-x-0',
                      ].join(' ')}
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="hidden xl:block">
            <ButtonLink href="/contact" variant="primary" size="md">
              Discuss Your Requirements
            </ButtonLink>
          </div>

          {/* Mobile toggle */}
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center border border-charcoal/15 text-ink transition-colors hover:border-royal hover:text-royal xl:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((value) => !value)}
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="square"
            >
              {open ? (
                <path d="M5 5l14 14M19 5L5 19" />
              ) : (
                <>
                  <path d="M4 7h16" />
                  <path d="M4 12h16" />
                  <path d="M4 17h16" />
                </>
              )}
            </svg>
          </button>
        </div>
      </Container>

      {/* Mobile navigation panel */}
      <div
        id="mobile-nav"
        hidden={!open}
        className="absolute inset-x-0 top-full max-h-[calc(100vh-4.5rem)] overflow-y-auto border-b border-charcoal/10 bg-white shadow-lg xl:hidden"
      >
        <Container>
          <nav aria-label="Primary mobile" className="py-4">
            <ul className="flex flex-col">
              {primaryNav.map((item) => (
                <li key={item.href} className="border-b border-charcoal/8 last:border-0">
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    aria-current={isActive(item.href) ? 'page' : undefined}
                    className={[
                      'flex items-center justify-between py-4 text-[1.02rem] font-semibold',
                      isActive(item.href) ? 'text-royal' : 'text-charcoal',
                    ].join(' ')}
                  >
                    {item.label}
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 20 20"
                      className="h-4 w-4 text-charcoal/30"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                    >
                      <path d="M7 4l6 6-6 6" />
                    </svg>
                  </Link>
                </li>
              ))}
            </ul>
            <div className="py-5">
              <ButtonLink
                href="/contact"
                variant="primary"
                size="lg"
                className="w-full"
                onClick={() => setOpen(false)}
              >
                Discuss Your Requirements
              </ButtonLink>
            </div>
          </nav>
        </Container>
      </div>
    </header>
  );
}
