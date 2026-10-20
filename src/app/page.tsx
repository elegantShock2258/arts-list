import LandingHero from "@/components/molecules/landing-hero/landing-hero";
import styles from "./home.module.sass";
import { links } from "./vals/values";
import Image from "next/image";
import LandingFeatured from "@/components/molecules/landing-featured/landing-featured";

export default function Page() {
  return (
    <div className="w-full overflow-x-hidden h-full">
      <LandingHero />
      <LandingFeatured />
    </div>
  );
}
