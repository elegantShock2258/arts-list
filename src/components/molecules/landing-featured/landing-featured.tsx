import {
  Carousel,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import styles from "./landing-featured.module.sass";
import { getFeatured } from "@/app/server/actions/getFeatured";
import FeaturedCard from "../FeaturedCard/FeaturedCard";

export default async function LandingFeatured() {
  // get featured posts from github
  // we get: thumbnail,title,link
  let featured = await getFeatured();
  return (
    <div
      className={`w-[100vw] h-[100vh] flex flex-col items-center justify-around pt-10 gap-2 overflow-hidden`}
    >
      <div className={styles.featured}>Featured</div>

      <Carousel>
        <CarouselPrevious />
        {featured.map((post, i) => {
          return (
            <div key={i}>
              <FeaturedCard
                title={post.title}
                link={post.link}
                thumbnail={post.thumbnail}
              />
            </div>
          );
        })}
        <CarouselNext />
      </Carousel>
    </div>
  );
}
