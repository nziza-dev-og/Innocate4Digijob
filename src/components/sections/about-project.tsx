import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Lightbulb, Share2, Target, Users } from 'lucide-react';

const objectives = [
  { icon: Target, text: "Promote digital skills among students." },
  { icon: Lightbulb, text: "Stimulate self-employment through innovation." },
  { icon: Share2, text: "Facilitate knowledge sharing between students and teachers." },
  { icon: Users, text: "Solve community problems using local talent and technology." },
];

export function AboutProject() {
  return (
    <section id="about" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-primary">
            What is Innovate4DigiJob?
          </h2>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              Innovate4DigiJob is a transformative initiative launched at College Baptiste Gacuba II, designed to empower students with digital skills, innovation capabilities, and entrepreneurial mindsets.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              By fostering a culture of problem-solving through ICT, the project aims to boost employment and digital entrepreneurship among youth in Rubavu District.
            </p>
          </div>
          
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-primary">Key Objectives</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {objectives.map((objective, index) => (
                  <li key={index} className="flex items-start">
                    <objective.icon className="h-6 w-6 text-accent mr-3 mt-1 flex-shrink-0" />
                    <span className="text-muted-foreground">{objective.text}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
