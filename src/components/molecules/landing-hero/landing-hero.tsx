import styles from "./landing-hero.module.sass";
import blouse from "../../../assets/blouse-illustration.svg";
import Image from "next/image";

export default function LandingHero() {
  return (
    <div
      className={`w-[100vw] h-[100vh] flex flex-col items-center pt-10 gap-2`}
    >
      <div className={`${styles.title}`}>The Textile Index</div>
      <div className={`${styles.navBar}`}>
        {["TECHNIQUES", "ARCHIVE", "ABOUT"].map((ele, key) => {
          return (
            <div key={key} className={styles.navButtons}>
              {ele}
            </div>
          );
        })}
      </div>
      <div className={styles.parent}>
        <div className={styles.bg}>
          <div className={styles.leftBlouse}>
            <Image src={blouse} fill alt="blouse" />
          </div>

          <div className={styles.rightBlouse}>
            <Image src={blouse} fill alt="blouse" />
          </div>
        </div>
        <div className={styles.fg}>
          <div className={styles.content}>
            <div className={`${styles.title} ${styles.heroTitle}`}>
              The Textile Index
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
