import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Rocket, CheckCircle, Quote } from 'lucide-react';
import { TestimonialGenerator } from '@/components/ai/testimonial-generator';

const stats = [
  { icon: Users, value: "100+", label: "Students Trained" },
  { icon: Rocket, value: "10+", label: "Student-led Projects Launched" },
  { icon: CheckCircle, value: "3+", label: "Community Issues Addressed" },
];

const testimonials = [
  {
    quote: "Innovate4DigiJob has completely changed my perspective on technology. I now feel empowered to create solutions for my community.",
    author: "K. David",
    role: "Student",
  },
  {
    quote: "The practical skills learned here are invaluable. This project is a beacon of hope for youth employment in Rubavu.",
    author: "M. Grace",
    role: "Teacher",
  },
];

export function Impact() {
  return (
    <section id="impact" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-primary">
            Real Change, Real Impact
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center shadow-lg">
              <CardHeader className="items-center">
                <stat.icon className="h-12 w-12 text-accent mb-2" />
                <p className="text-4xl font-bold text-primary">{stat.value}</p>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <h3 className="text-2xl md:text-3xl font-semibold text-primary text-center mb-10">
          What People Are Saying
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="shadow-lg">
              <CardContent className="pt-6">
                <Quote className="h-8 w-8 text-primary/50 mb-4" />
                <blockquote className="italic text-muted-foreground mb-4">
                  "{testimonial.quote}"
                </blockquote>
                <p className="font-semibold text-primary">{testimonial.author}</p>
                <p className="text-sm text-muted-foreground">{testimonial.role}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <TestimonialGenerator />
      </div>
    </section>
  );
}
