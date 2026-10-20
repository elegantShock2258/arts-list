import {
  Carousel,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import styles from "./landing-featured.module.sass";

export default function LandingFeatured() {
  // get featured posts from github
  // we get: thumbnail,title,link
  //
  return (
    <div
      className={`w-[100vw] h-[100vh] flex flex-col items-center justify-around pt-10 gap-2 overflow-hidden`}
    >
      <div className={styles.featured}>Featured</div>

      <Carousel>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
}
