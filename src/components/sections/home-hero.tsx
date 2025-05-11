import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Briefcase, Mail } from 'lucide-react';

export function HomeHero() {
  return (
    <section id="home" className="relative bg-secondary py-20 md:py-32">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl md:text-6xl">
          CBG II Innovate4DigiJob
        </h1>
        <p className="mt-6 text-2xl md:text-3xl font-semibold leading-8 text-foreground">
          Empowering Youth Through Digital Innovation
        </p>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
          Transforming education and job creation with technology and creativity in Rubavu, Rwanda.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <Link href="#join">
              Join the Movement <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="#activities">
              Our Projects <Briefcase className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="#contact">
              Contact Us <Mail className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
      <div className="mt-16 sm:mt-20 md:mt-24 lg:mt-32 relative aspect-[16/9] max-w-5xl mx-auto rounded-xl overflow-hidden shadow-2xl">
        <Image
          src="https://picsum.photos/1200/675"
          alt="Students engaged in digital learning"
          layout="fill"
          objectFit="cover"
          className="bg-muted"
          data-ai-hint="students digital learning"
        />
      </div>
    </section>
  );
}
