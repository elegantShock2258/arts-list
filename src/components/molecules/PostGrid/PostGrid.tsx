"use client";

import { useEffect, useState } from "react";
import FeaturedCard from "../FeaturedCard/FeaturedCard";
import styles from "./post-grid.module.sass";
import { getAllPosts } from "@/app/server/actions/FileCRUD";

type Post = {
  title: string;
  link: string;
  thumbnail: string;
};

export default function PostsGrid() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadPosts() {
      try {
        const result = await getAllPosts();

        if (!cancelled) {
          setPosts(result as Post[]);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load posts."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadPosts();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <div className={styles.status}>Loading articles...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  if (posts.length === 0) {
    return <div className={styles.status}>No articles found.</div>;
  }

  return (
    <div className={styles.gridViewport}>
      <div className={styles.masonry}>
        {posts.map((post) => (
          <article className={styles.card} key={post.link}>
            <FeaturedCard
              title={post.title}
              link={post.link}
              thumbnail={post.thumbnail}
            />
          </article>
        ))}
      </div>
    </div>
  );
}
