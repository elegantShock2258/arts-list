import { randomUUID } from "node:crypto";
import { auth } from "../../../../auth";
import { mkdir, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { pushSubmoduleWithToken } from "@/app/server/git";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_MARKDOWN_BYTES = 5 * 1024 * 1024;
const MAX_IMAGE_BYTES = 12 * 1024 * 1024;
const MAX_TOTAL_IMAGE_BYTES = 48 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
]);

function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100)
    .replace(/-+$/g, "");
}

function safeImageName(originalName: string): string {
  const extension = path.extname(originalName).toLowerCase();
  const allowedExtensions = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif"]);
  const base = path
    .basename(originalName, extension)
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "image";

  if (!allowedExtensions.has(extension)) {
    throw new Error(`Unsupported image extension for ${originalName}.`);
  }

  return `${base}${extension}`;
}

function isPng(bytes: Buffer): boolean {
  return bytes.length >= 8 && bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
}

export async function POST(request: Request) {
  const session = await auth();
  const allowedEmail = process.env.UPLOAD_ALLOWED_EMAIL?.trim().toLowerCase();
  const signedInEmail = session?.user?.email?.trim().toLowerCase();

  if (!allowedEmail || !signedInEmail || signedInEmail !== allowedEmail) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  let temporaryDirectory: string | undefined;

  try {
    const formData = await request.formData();
    const titleValue = formData.get("title");
    const markdownValue = formData.get("markdown");
    const thumbnailValue = formData.get("thumbnail");
    const tagsValue = formData.get("tags");

    if (typeof titleValue !== "string" || !titleValue.trim()) {
      return NextResponse.json({ message: "Article title is required." }, { status: 400 });
    }
    if (!(markdownValue instanceof File) || markdownValue.size === 0) {
      return NextResponse.json({ message: "Choose a Markdown file." }, { status: 400 });
    }
    if (!(thumbnailValue instanceof File) || thumbnailValue.size === 0) {
      return NextResponse.json({ message: "Choose a PNG thumbnail." }, { status: 400 });
    }
    if (typeof tagsValue !== "string" || !tagsValue.trim()) {
      return NextResponse.json({ message: "Enter at least one technique tag." }, { status: 400 });
    }
    if (markdownValue.size > MAX_MARKDOWN_BYTES) {
      return NextResponse.json({ message: "Markdown file exceeds the 5 MB limit." }, { status: 413 });
    }
    if (!/\.(md|markdown)$/i.test(markdownValue.name)) {
      return NextResponse.json({ message: "The article file must have an .md or .markdown extension." }, { status: 400 });
    }
    if (thumbnailValue.type !== "image/png" || thumbnailValue.size > MAX_IMAGE_BYTES) {
      return NextResponse.json({ message: "Thumbnail must be a PNG no larger than 12 MB." }, { status: 400 });
    }

    const title = titleValue.trim();
    const slug = slugify(title);
    if (!slug) {
      return NextResponse.json({ message: "Title must contain at least one letter or number." }, { status: 400 });
    }

    const markdown = await markdownValue.text();
    const thumbnailBytes = Buffer.from(await thumbnailValue.arrayBuffer());
    if (!isPng(thumbnailBytes)) {
      return NextResponse.json({ message: "The thumbnail file is not a valid PNG." }, { status: 400 });
    }

    const tags = [...new Set(tagsValue.split(",").map((tag) => tag.trim()).filter(Boolean))];
    if (tags.length === 0 || tags.length > 30 || tags.some((tag) => tag.length > 60)) {
      return NextResponse.json({ message: "Provide 1–30 tags, each no longer than 60 characters." }, { status: 400 });
    }

    const images = formData.getAll("images").filter((entry): entry is File => entry instanceof File && entry.size > 0);
    let totalImageBytes = 0;
    const savedImages: Array<{ name: string; bytes: Buffer }> = [];
    const usedNames = new Set<string>();

    for (const imageFile of images) {
      if (!ALLOWED_IMAGE_TYPES.has(imageFile.type)) {
        return NextResponse.json({ message: `Unsupported image type: ${imageFile.name}` }, { status: 400 });
      }
      if (imageFile.size > MAX_IMAGE_BYTES) {
        return NextResponse.json({ message: `${imageFile.name} exceeds the 12 MB image limit.` }, { status: 413 });
      }
      totalImageBytes += imageFile.size;
      if (totalImageBytes > MAX_TOTAL_IMAGE_BYTES) {
        return NextResponse.json({ message: "Combined article images exceed the 48 MB limit." }, { status: 413 });
      }

      const bytes = Buffer.from(await imageFile.arrayBuffer());
      const name = safeImageName(imageFile.name);
      const extension = path.extname(name);
      const base = path.basename(name, extension);
      let uniqueName = name;
      let suffix = 2;
      while (usedNames.has(uniqueName.toLowerCase())) {
        uniqueName = `${base}-${suffix++}${extension}`;
      }
      usedNames.add(uniqueName.toLowerCase());
      savedImages.push({ name: uniqueName, bytes });
    }

    const postsDirectory = path.join(process.cwd(), "public", "posts");
    const destination = path.join(postsDirectory, slug);
    await mkdir(postsDirectory, { recursive: true });

    // Refuse to overwrite an existing article.
    const tempPath = path.join(postsDirectory, `.upload-${slug}-${randomUUID()}`);
    temporaryDirectory = tempPath;
    await mkdir(tempPath, { recursive: false });
    await mkdir(path.join(tempPath, "images"), { recursive: true });
    await writeFile(path.join(tempPath, "CONTENT.md"), markdown, { flag: "wx" });
    await writeFile(path.join(tempPath, "thumbnail.png"), thumbnailBytes, { flag: "wx" });
    await writeFile(path.join(tempPath, "metadata.json"), JSON.stringify(tags, null, 2) + "\n", { flag: "wx" });

    for (const image of savedImages) {
      await writeFile(path.join(tempPath, "images", image.name), image.bytes, { flag: "wx" });
    }

    // rename fails if the destination already exists on the same filesystem.
    await rename(tempPath, destination);
    temporaryDirectory = undefined;

    pushSubmoduleWithToken(`upload article: ${titleValue}`)
    return NextResponse.json({ message: "Article uploaded.", folder: `public/posts/${slug}` });
  } catch (error) {
    if (temporaryDirectory) {
      await rm(temporaryDirectory, { recursive: true, force: true }).catch(() => undefined);
    }
    const message = error instanceof Error ? error.message : "Upload failed.";
    if (message.includes("EEXIST") || message.includes("ENOTEMPTY")) {
      return NextResponse.json({ message: "An article folder with this title already exists. Choose a different title." }, { status: 409 });
    }
    console.error("Article upload failed:", error);
    return NextResponse.json({ message: "Upload failed. Check the server logs." }, { status: 500 });
  }

}
