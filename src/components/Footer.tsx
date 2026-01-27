import { Crown, Instagram, Facebook, Youtube } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const TikTokIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
);

const Footer = () => {
  const { t } = useLanguage();

  const socialLinks = [
    { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
    { icon: Facebook, href: 'https://facebook.com', label: 'Facebook' },
    { icon: TikTokIcon, href: 'https://tiktok.com', label: 'TikTok' },
    { icon: Youtube, href: 'https://youtube.com', label: 'YouTube' },
  ];

  const legalLinks = [
    { label: t('footer.legal'), href: '#' },
    { label: t('footer.privacy'), href: '#' },
    { label: t('footer.cookies'), href: '#' },
  ];

  return (
    <footer className="bg-card border-t border-border">
      <div className="container-royal py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-center">
          {/* Logo */}
          <div className="text-center md:text-left">
            <a href="#" className="inline-flex items-center gap-2">
              <Crown className="w-6 h-6 text-primary" />
              <div className="flex flex-col">
                <span className="font-serif text-lg tracking-wider text-foreground">
                  ROYAL STUDIO
                </span>
                <span className="text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
                  Multi Space Experience
                </span>
              </div>
            </a>
          </div>

          {/* Social Links */}
          <div className="flex justify-center gap-6">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 flex items-center justify-center border border-border text-muted-foreground transition-all duration-300 hover:border-primary hover:text-primary"
                aria-label={social.label}
              >
                <social.icon />
              </a>
            ))}
          </div>

          {/* Legal Links */}
          <div className="flex justify-center md:justify-end gap-6 text-sm">
            {legalLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-muted-foreground hover:text-primary transition-colors duration-300"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Royal Studio. {t('footer.rights')}.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
