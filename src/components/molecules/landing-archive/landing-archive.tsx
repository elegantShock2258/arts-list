import PostsGrid from "../PostGrid/PostGrid";
import styles from "./landing-archive.module.sass";

export default function LandingArchive() {
  return (
    <div className="w-[100vw] overflow-hidden flex flex-col pt-40 gap-4">
      <div className={styles.title}>Archive</div>
      <div className="flex flex-col flex-1 min-w-0 min-h-0">
        <div className={styles.explore}>
          Explore Indian Textiles through the process and methods that bring
          them to life.
        </div>

        <div className={`${styles.techniquesList} flex-1 min-h-0 p-5`}>
          <PostsGrid />
        </div>
      </div>
    </div>
  );
}
