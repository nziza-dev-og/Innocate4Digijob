import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Phone, MapPin } from 'lucide-react';
import { SocialIcon } from '@/components/ui/icons';
import Link from 'next/link';

const contactDetails = [
  { icon: Mail, text: "info@innovate4digijob.rw", href: "mailto:info@innovate4digijob.rw" },
  { icon: Phone, text: "+250 7XX XXX XXX", href: "tel:+2507XXXXXXXX" },
  { icon: MapPin, text: "College Baptiste Gacuba II, Rubavu District, Rwanda", href: "#" },
];

const socialMediaLinks = [
  { name: 'facebook', label: 'Facebook', href: '#' },
  { name: 'twitter', label: 'Twitter', href: '#' },
  { name: 'linkedin', label: 'LinkedIn', href: '#' },
  { name: 'whatsapp', label: 'WhatsApp', href: 'https://wa.me/2507XXXXXXXX' }, // Replace with actual WhatsApp link/number
] as const;


export function Contact() {
  return (
    <section id="contact" className="py-16 md:py-24 bg-secondary">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-primary">
            Reach Out
          </h2>
        </div>
        
        <div className="max-w-3xl mx-auto">
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl text-center text-primary">Get in Touch</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-6 mb-8">
                {contactDetails.map((detail, index) => (
                  <li key={index} className="flex items-center">
                    <detail.icon className="h-6 w-6 text-accent mr-4 flex-shrink-0" />
                    {detail.href !== "#" ? (
                       <a href={detail.href} className="text-muted-foreground hover:text-primary transition-colors break-all">{detail.text}</a>
                    ) : (
                       <span className="text-muted-foreground">{detail.text}</span>
                    )}
                  </li>
                ))}
              </ul>

              <div className="text-center">
                <h4 className="text-lg font-semibold text-primary mb-4">Connect with us on Social Media:</h4>
                <div className="flex justify-center gap-6">
                  {socialMediaLinks.map((social) => (
                    <Link key={social.name} href={social.href} target="_blank" rel="noopener noreferrer"
                          className="flex flex-col items-center text-muted-foreground hover:text-primary transition-colors">
                      <SocialIcon name={social.name} className="h-8 w-8 mb-1" />
                      <span className="text-xs">{social.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
