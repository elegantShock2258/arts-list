import LandingHero from "@/components/molecules/landing-hero/landing-hero";
import styles from "./home.module.sass";
import Image from "next/image";
import LandingFeatured from "@/components/molecules/landing-featured/landing-featured";
import LandingTechniques from "@/components/molecules/landing-techniques/landing-techniques";
import LandingArchive from "@/components/molecules/landing-archive/landing-archive";

export default function Page() {
  return (
    <div className="w-full overflow-x-hidden h-full">
      <LandingHero />
      <LandingFeatured />
      {/*<LandingTechniques />*/}
      <LandingArchive />
    </div>
  );
}
