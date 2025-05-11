import Link from 'next/link';
import { SocialIcon } from '@/components/ui/icons';

const socialLinks = [
  { name: 'facebook', href: '#' },
  { name: 'twitter', href: '#' },
  { name: 'linkedin', href: '#' },
  { name: 'whatsapp', href: '#' },
] as const;


export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row max-w-screen-2xl">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} DigiSpark. All rights reserved.
        </p>
        <div className="flex gap-4">
          {socialLinks.map((social) => (
            <Link key={social.name} href={social.href} target="_blank" rel="noopener noreferrer">
              <SocialIcon name={social.name} className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" />
              <span className="sr-only">{social.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
