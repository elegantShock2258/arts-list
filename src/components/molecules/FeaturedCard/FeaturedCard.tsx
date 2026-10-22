"use client";
import Image from "next/image";
import styles from "./FeaturedCard.module.sass";
import { redirect } from "next/navigation";

export default function FeaturedCard(props: {
  title: string;
  link: string;
  thumbnail: string;
}) {
  return (
    <div
      className="flex flex-col"
      onClick={() => {
        redirect(props.link);
      }}
    >
      <Image
        alt="thumbnail"
        src={props.thumbnail}
        width={100}
        height={300}
        objectFit="fill"
      />
      <div className={styles.title}>{props.title}</div>
    </div>
  );
}
