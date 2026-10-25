import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import styles from "./landing-featured.module.sass";
import { getFeatured } from "@/app/server/actions/FileCRUD";
import FeaturedCard from "../FeaturedCard/FeaturedCard";

export default async function LandingFeatured() {
  // get featured posts from github
  // we get: thumbnail,title,link
  let featured = await getFeatured();
  return (
    <div
      className={`w-[100vw] h-[100vh] flex flex-col items-center justify-center pt-10 gap-2 overflow-hidden`}
    >
      <div className={styles.featured}>Featured</div>
      <Carousel

        className="w-full max-w-[80vw]"
        opts={{
            align: "start",
            loop: true,
          }}
      >
        <CarouselPrevious />
        <CarouselContent>
          {featured.map((post, i) => {
            return (
              <CarouselItem key={i} className="basis-1/4">
                <div>
                  <FeaturedCard
                    title={post.title}
                    link={`/read/${post.link}`}
                    thumbnail={post.thumbnail}
                  />
                </div>
              </CarouselItem>
            );
          })}
        </CarouselContent>
        <CarouselNext />
      </Carousel>
    </div>
  );
}
