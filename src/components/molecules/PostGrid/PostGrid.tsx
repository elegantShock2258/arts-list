
"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import FeaturedCard from "../FeaturedCard/FeaturedCard";
import styles from "./post-grid.module.sass";
import { getAllPosts } from "@/app/server/actions/FileCRUD";

type Post = {
  title: string;
  link: string;
  thumbnail: string;
};

function MasonryColumn({
  posts,
  columnIndex,
  scrollRef,
  onHeightChange,
}: {
  posts: Post[];
  columnIndex: number;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  onHeightChange: (index: number, height: number) => void;
}) {
  const getScrollElement = useCallback(
    () => scrollRef.current,
    [scrollRef]
  );

  const virtualizer = useVirtualizer({
    count: posts.length,
    getScrollElement,
    estimateSize: () => 440,
    overscan: 3,
    gap: 24,
    getItemKey: (index) => posts[index].link,
  });

  const totalSize = virtualizer.getTotalSize();

  useEffect(() => {
    onHeightChange(columnIndex, totalSize);
  }, [columnIndex, totalSize, onHeightChange]);

  return (
    <div
      className={styles.column}
      style={{ height: totalSize }}
    >
      {virtualizer.getVirtualItems().map((item) => (
        <div
          key={item.key}
          data-index={item.index}
          ref={virtualizer.measureElement}
          className={styles.cardItem}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            transform: `translateY(${item.start}px)`,
          }}
        >
          <FeaturedCard
            title={posts[item.index].title}
            link={posts[item.index].link}
            thumbnail={posts[item.index].thumbnail}
          />
        </div>
      ))}
    </div>
  );
}

export default function PostsGrid() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [columns, setColumns] = useState(3);
  const [columnHeights, setColumnHeights] = useState<number[]>([]);

  const scrollRef = useRef<HTMLDivElement>(null);

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
            err instanceof Error
              ? err.message
              : "Failed to load posts."
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

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;

    const updateColumns = () => {
      const width = element.clientWidth;

      setColumns(
        width < 480 ? 1 : width < 760 ? 2 : 3
      );
    };

    updateColumns();

    const observer = new ResizeObserver(updateColumns);
    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  const masonryColumns = useMemo(() => {
    const result: Post[][] = Array.from(
      { length: columns },
      () => []
    );

    // Assign posts to the currently shortest column,
    // estimating card heights from their text and image.
    const estimatedHeights = Array(columns).fill(0);

    for (const post of posts) {
      let shortest = 0;

      for (let i = 1; i < columns; i++) {
        if (estimatedHeights[i] < estimatedHeights[shortest]) {
          shortest = i;
        }
      }

      result[shortest].push(post);

      const titleHeight = Math.max(
        48,
        Math.ceil(post.title.length / 22) * 28
      );

      estimatedHeights[shortest] += 300 + titleHeight + 80;
    }

    return result;
  }, [posts, columns]);

  const handleHeightChange = useCallback(
    (index: number, height: number) => {
      setColumnHeights((previous) => {
        if (previous[index] === height) return previous;

        const next = [...previous];
        next[index] = height;
        return next;
      });
    },
    []
  );

  useEffect(() => {
    setColumnHeights(Array(columns).fill(0));
  }, [columns]);

  if (loading) {
    return (
      <div className={styles.status} role="status">
        Loading techniques...
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.error} role="alert">
        {error}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className={styles.status}>
        No techniques found.
      </div>
    );
  }

  const canvasHeight = Math.max(
    0,
    ...columnHeights,
    ...masonryColumns.map((column) => column.length * 440)
  );

  return (
    <div ref={scrollRef} className={styles.gridViewport}>
      <div
        className={styles.masonryCanvas}
        style={{
          height: canvasHeight,
          gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        }}
      >
        {masonryColumns.map((columnPosts, index) => (
          <MasonryColumn
            key={columns + "-" + index}
            posts={columnPosts}
            columnIndex={index}
            scrollRef={scrollRef}
            onHeightChange={handleHeightChange}
          />
        ))}
      </div>
    </div>
  );
}
