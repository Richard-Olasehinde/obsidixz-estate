import Link from 'next/link';
import { Container } from '@/components/layout/Container';
import { LogoLockup } from '@/components/brand/LogoLockup';
import { businessContact, legalNav, primaryNav, siteConfig } from '@/lib/site';

const year = new Date().getFullYear();

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-ink text-[#b8c1cd]">
      <Container>
        <div className="grid gap-12 py-14 sm:py-16 lg:grid-cols-[1.4fr_1fr_1fr] lg:gap-10">
          {/* Brand column */}
          <div className="max-w-sm">
            <LogoLockup tone="light" />
            <p className="mt-5 text-[0.95rem] leading-relaxed text-[#a8b3c0]">
              {siteConfig.positioning}
            </p>
            <p className="mt-5 text-[0.82rem] leading-relaxed text-[#8d98a6]">
              An Obsidixz business. Operating remotely and serving US residential real-estate
              investors and acquisition operators.
            </p>
          </div>

          {/* Navigation column */}
          <nav aria-label="Footer" className="lg:justify-self-start">
            <h2 className="font-display text-[0.72rem] font-bold uppercase tracking-[0.18em] text-white">
              Navigate
            </h2>
            <ul className="mt-5 flex flex-col gap-3">
              {primaryNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-[0.92rem] text-[#a8b3c0] transition-colors hover:text-white"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Legal / contact column */}
          <div>
            <h2 className="font-display text-[0.72rem] font-bold uppercase tracking-[0.18em] text-white">
              Legal &amp; Contact
            </h2>
            <ul className="mt-5 flex flex-col gap-3">
              {legalNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-[0.92rem] text-[#a8b3c0] transition-colors hover:text-white"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              {businessContact.email ? (
                <li>
                  <a
                    href={`mailto:${businessContact.email}`}
                    className="text-[0.92rem] text-[#a8b3c0] transition-colors hover:text-white"
                  >
                    {businessContact.email}
                  </a>
                </li>
              ) : null}
            </ul>
            <p className="mt-6 text-[0.82rem] leading-relaxed text-[#8d98a6]">
              Enquiries are handled through the{' '}
              <Link href="/contact" className="text-white/90 underline underline-offset-2 hover:text-white">
                contact form
              </Link>
              .
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-white/10 py-6 text-[0.78rem] text-[#7d8896] sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {siteConfig.name}. All rights reserved.
          </p>
          <p>
            Research and lead generation only. Not a brokerage, property manager or investment
            adviser.
          </p>
        </div>
      </Container>
    </footer>
  );
}
