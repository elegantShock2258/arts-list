"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "./MarkdownArticle.sass";

type MarkdownArticleProps = {
  postId: string;
};

export default function MarkdownArticle({
  postId,
}: MarkdownArticleProps) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [articleHeight, setArticleHeight] = useState(0);

  const articleRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadPost() {
      setLoading(true);
      setError(null);
      setContent("");

      try {
        const response = await fetch(
          `/posts/${(postId)}/CONTENT.md`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error(
            response.status === 404
              ? "Article not found."
              : "Failed to load article."
          );
        }

        setContent(await response.text());
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }

        setError(
          err instanceof Error ? err.message : "Something went wrong."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadPost();

    return () => controller.abort();
  }, [postId]);

  useEffect(() => {
    const article = articleRef.current;
    if (!article || loading || error) return;

    const updateHeight = () => {
      setArticleHeight(article.scrollHeight);
    };

    updateHeight();

    const observer = new ResizeObserver(updateHeight);
    observer.observe(article);

    return () => observer.disconnect();
  }, [content, loading, error]);

  if (loading) {
    return (
      <div className="article-status" role="status">
        Loading article...
      </div>
    );
  }

  if (error) {
    return (
      <div className="article-status article-error" role="alert">
        {error}
      </div>
    );
  }

  return (
    <article ref={articleRef} className="markdown-article">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children, ...props }) => (
            <h1 className="article-heading article-title" {...props}>
              {children}
            </h1>
          ),
          h2: ({ children, ...props }) => (
            <h2 className="article-heading" {...props}>
              {children}
            </h2>
          ),
          h3: ({ children, ...props }) => (
            <h3 className="article-heading" {...props}>
              {children}
            </h3>
          ),
          img: ({ src, alt, ...props }) => (
            <img
              src={src?.toString().replace('.', `/posts/${postId}`)}
              alt={src?.toString().replace('.', `/posts/${postId}`)}
              className="article-image"
              loading="lazy"
              {...props}
            />
          ),
          a: ({ children, ...props }) => (
            <a {...props} target="_blank" rel="noreferrer">
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
}
