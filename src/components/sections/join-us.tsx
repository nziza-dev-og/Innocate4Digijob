import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Handshake, UserPlus, School, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const involvementWays = [
  {
    icon: UserPlus,
    title: "Volunteer",
    description: "Become a mentor or trainer and share your expertise with eager students."
  },
  {
    icon: Handshake,
    title: "Partner With Us",
    description: "Support our mission through equipment donations or sponsorship opportunities."
  },
  {
    icon: School,
    title: "Enroll Your School",
    description: "Bring the Innovate4DigiJob program to your students in our next training cohort."
  },
];

export function JoinUs() {
  return (
    <section id="join" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-primary">
            Be Part of the Innovation
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {involvementWays.map((way, index) => (
            <Card key={index} className="text-center shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="items-center">
                 <div className="p-3 bg-primary/10 rounded-full mb-3">
                  <way.icon className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl text-primary">{way.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{way.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <Link href="#contact">
              Get Involved <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
