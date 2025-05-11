import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Code2, FlaskConical, UsersRound, Trophy, Laptop } from 'lucide-react';

const activities = [
  {
    icon: Laptop, // Changed from Code2 for "Digital Skills Bootcamps"
    title: "Digital Skills Bootcamps",
    description: "Training students in coding, design, and digital marketing.",
    dataAiHint: "students coding"
  },
  {
    icon: FlaskConical,
    title: "Innovator’s Lab",
    description: "A physical and virtual space for students to prototype tech-based solutions.",
    dataAiHint: "science lab"
  },
  {
    icon: UsersRound,
    title: "Mentorship Sessions",
    description: "Connecting students with experienced IT professionals.",
    dataAiHint: "professionals meeting"
  },
  {
    icon: Trophy,
    title: "School Innovation Contests",
    description: "Showcasing the best ideas that solve real community problems.",
    dataAiHint: "students award"
  },
];

export function Activities() {
  return (
    <section id="activities" className="py-16 md:py-24 bg-secondary">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-primary">
            What We Do
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {activities.map((activity, index) => (
            <Card key={index} className="flex flex-col text-center shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="items-center">
                <div className="p-4 bg-primary/10 rounded-full mb-4">
                  <activity.icon className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="text-xl text-primary">{activity.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-muted-foreground">{activity.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
