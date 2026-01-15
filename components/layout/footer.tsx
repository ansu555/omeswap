'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Github, HelpCircle, BookOpen, FileText, Users } from 'lucide-react';

const exploreLinks = [
  {
    icon: HelpCircle,
    title: 'Help center',
    description: 'Browse FAQs and get support from our support team',
    href: '#',
    external: true,
  },
  {
    icon: BookOpen,
    title: 'Blog',
    description: 'Catch up on the latest company news, product features and more',
    href: '#',
    external: true,
  },
  {
    icon: FileText,
    title: 'Docs',
    description: 'Explore our library of developer docs to get started building with Omeswap',
    href: '#',
    external: true,
  },
  {
    icon: Users,
    title: 'Socials',
    description: 'Follow Omeswap on X, Discord, and Telegram',
    href: '#',
    external: false,
    socialLinks: [
      { name: 'X', href: '#' },
      { name: 'Discord', href: '#' },
      { name: 'Telegram', href: '#' },
    ],
  },
];

const footerLinks = {
  Products: [
    { name: 'Swap', href: '/trade' },
    { name: 'Explore', href: '/explore' },
    { name: 'Portfolio', href: '/portfolio' },
    { name: 'API', href: '#' },
  ],
  Protocol: [
    { name: 'Governance', href: '#' },
    { name: 'Developers', href: '#' },
  ],
  Company: [
    { name: 'About', href: '#' },
    { name: 'Careers', href: '#' },
    { name: 'Blog', href: '#' },
    { name: 'Brand assets', href: '#' },
  ],
  'Need help?': [
    { name: 'Help center', href: '#' },
    { name: 'Contact us', href: '#' },
  ],
};

const socialIcons = [
  { icon: Github, href: '#', label: 'GitHub' },
  {
    icon: () => (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    href: '#',
    label: 'X',
  },
  {
    icon: () => (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9460 2.4189-2.1568 2.4189z" />
      </svg>
    ),
    href: '#',
    label: 'Discord',
  },
];

export function Footer() {
  return (
    <footer className="relative w-full bg-transparent">
      {/* Explore Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-4xl md:text-5xl font-light text-foreground mb-12">
          Explore the <span className="font-semibold">OMEverse</span>
        </h2>

        <div className="space-y-0">
          {exploreLinks.map((link) => (
            <Link
              key={link.title}
              href={link.href}
              className="group flex items-center justify-between py-6 border-b border-border/30 hover:border-border transition-colors"
            >
              <div className="flex items-start gap-6">
                <link.icon className="w-6 h-6 text-muted-foreground mt-1" />
                <div>
                  <h3 className="text-xl md:text-2xl font-medium text-foreground mb-1">
                    {link.title}
                  </h3>
                  <p className="text-muted-foreground text-sm md:text-base max-w-xl">
                    {link.socialLinks ? (
                      <>
                        Follow Omeswap on{' '}
                        {link.socialLinks.map((social, idx) => (
                          <span key={social.name}>
                            <span className="text-foreground hover:underline">
                              {social.name}
                            </span>
                            {idx < link.socialLinks!.length - 1 && (
                              <span>{idx === link.socialLinks!.length - 2 ? ', and ' : ', '}</span>
                            )}
                          </span>
                        ))}
                      </>
                    ) : (
                      link.description
                    )}
                  </p>
                </div>
              </div>
              {link.external && (
                <svg
                  className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 17L17 7M17 7H7M17 7V17"
                  />
                </svg>
              )}
            </Link>
          ))}
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="relative z-10 border-t border-border/30">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="flex flex-col lg:flex-row justify-between gap-10">
            {/* Social Icons */}
            <div className="flex items-center gap-4">
              {socialIcons.map((social) => (
                <Link
                  key={social.label}
                  href={social.href}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </Link>
              ))}
            </div>

            {/* Link Columns */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-16">
              {Object.entries(footerLinks).map(([category, links]) => (
                <div key={category}>
                  <h4 className="text-sm font-medium text-foreground mb-4">{category}</h4>
                  <ul className="space-y-3">
                    {links.map((link) => (
                      <li key={link.name}>
                        <Link
                          href={link.href}
                          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-border/30">
          <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Image src="/logo.png" alt="Omeswap" width={20} height={20} />
              <span>&copy; {new Date().getFullYear()} - Omeswap</span>
            </div>
            <div className="flex items-center gap-6">
              <Link
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
