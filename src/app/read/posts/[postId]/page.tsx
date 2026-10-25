import MarkdownArticle from "@/components/molecules/MarkdownArticle/MarkdownArticle";

type PageProps = {
  params: Promise<{
    postId: string;
  }>;
};

export default async function PostPage({ params }: PageProps) {
  const { postId } = await params;

  return (
    <main className="overflow-x-hidden">
      <MarkdownArticle postId={postId} />
    </main>
  );
}
