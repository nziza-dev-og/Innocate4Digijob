import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const teamMembers = [
  {
    name: "Jean Claude Tuyizere",
    role: "Project Lead",
    bio: "With over 10 years of experience in software development and ICT training, Jean Claude brings leadership, creativity, and commitment to youth empowerment. He’s also the Managing Director of CR.ARICENT Technology.",
    imageSrc: "https://picsum.photos/300/300?random=1",
    dataAiHint: "professional portrait"
  },
  // Placeholder for additional team members
  {
    name: "Team Member 2",
    role: "ICT Trainer",
    bio: "Passionate about digital education and empowering the next generation of innovators.",
    imageSrc: "https://picsum.photos/300/300?random=2",
    dataAiHint: "educator profile"
  },
  {
    name: "Team Member 3",
    role: "Community Liaison",
    bio: "Dedicated to connecting the project with local needs and opportunities.",
    imageSrc: "https://picsum.photos/300/300?random=3",
    dataAiHint: "community leader"
  },
];

export function Team() {
  return (
    <section id="team" className="py-16 md:py-24 bg-secondary">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-primary">
            Our Leadership
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {teamMembers.map((member, index) => (
            <Card key={index} className="flex flex-col text-center items-center shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="items-center">
                <div className="relative h-32 w-32 rounded-full overflow-hidden mb-4 shadow-md">
                  <Image
                    src={member.imageSrc}
                    alt={member.name}
                    layout="fill"
                    objectFit="cover"
                    className="bg-muted"
                    data-ai-hint={member.dataAiHint}
                  />
                </div>
                <CardTitle className="text-xl text-primary">{member.name}</CardTitle>
                <CardDescription className="text-accent font-semibold">{member.role}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground">{member.bio}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        {/* 
        Could add a section for "Additional Team Members" if there's more varied content
        <div className="mt-12 text-center">
          <h3 className="text-2xl font-semibold text-primary mb-4">Additional Team Members</h3>
          <p className="text-muted-foreground">
            Our dedicated team also includes trainers, mentors, and support staff committed to the success of Innovate4DigiJob.
          </p>
        </div> 
        */}
      </div>
    </section>
  );
}
