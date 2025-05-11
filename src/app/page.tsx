import { HomeHero } from '@/components/sections/home-hero';
import { AboutProject } from '@/components/sections/about-project';
import { Activities } from '@/components/sections/activities';
import { Impact } from '@/components/sections/impact';
import { Team } from '@/components/sections/team';
import { JoinUs } from '@/components/sections/join-us';
import { Contact } from '@/components/sections/contact';

export default function HomePage() {
  return (
    <>
      <HomeHero />
      <AboutProject />
      <Activities />
      <Impact />
      <Team />
      <JoinUs />
      <Contact />
    </>
  );
}
