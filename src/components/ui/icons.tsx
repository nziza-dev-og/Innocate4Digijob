import { Facebook, Twitter, Linkedin, MessageCircle, Youtube, Instagram, LucideProps } from 'lucide-react';

interface SocialIconProps extends LucideProps {
  name: 'facebook' | 'twitter' | 'linkedin' | 'whatsapp' | 'youtube' | 'instagram';
}

export function SocialIcon({ name, ...props }: SocialIconProps) {
  switch (name) {
    case 'facebook':
      return <Facebook {...props} />;
    case 'twitter':
      return <Twitter {...props} />;
    case 'linkedin':
      return <Linkedin {...props} />;
    case 'whatsapp':
      return <MessageCircle {...props} />; // Using MessageCircle as a generic WhatsApp icon
    case 'youtube':
      return <Youtube {...props} />;
    case 'instagram':
      return <Instagram {...props} />;
    default:
      return null;
  }
}
