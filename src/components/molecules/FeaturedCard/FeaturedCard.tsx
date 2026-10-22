"use client";
import Image from "next/image";
import styles from "./FeaturedCard.module.sass";
import { redirect } from "next/navigation";
import Link from "next/link";

export default function FeaturedCard(props: {
  title: string;
  link: string;
  thumbnail: string;
}) {
  return (
    <Link href={props.link}>
      <div
        className="flex flex-col justify-center items-center gap-2"
        onClick={() => {
          redirect(props.link);
        }}
      >
        <Image
          alt="thumbnail"
          src={props.thumbnail
            .split("/")
            .map((seg) => encodeURIComponent(seg))
            .join("/")}
          width={300}
          height={400}
        />
        <div className={styles.title}>{props.title}</div>
      </div>
    </Link>
  );
}
