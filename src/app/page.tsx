"use client";
import LandingHero from "@/components/molecules/landing-hero/landing-hero";
import styles from "./home.module.sass";
import { links } from "./vals/values";
import Image from "next/image";

export default function Page() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <LandingHero />
    </div>
  );
}
