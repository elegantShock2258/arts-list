"use server";

import { fetchPosts } from "../git";
import * as fs from "fs";
import * as path from "path";

interface FolderItem {
  name: string;
  absolutePath: string;
  lastEdited: Date;
}

function getTopRecentFolders(targetDir: string = "./posts"): FolderItem[] {
  try {
    const entries = fs.readdirSync(targetDir, { withFileTypes: true });

    const folders: FolderItem[] = entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => {
        const fullPath = path.join(targetDir, entry.name);
        const stats = fs.statSync(fullPath);
        return {
          name: entry.name,
          absolutePath: fullPath.replace("public/", ""),
          lastEdited: stats.mtime,
        };
      });

    return folders
      .filter((a) => !a.name.includes("."))
      .sort((a, b) => b.lastEdited.getTime() - a.lastEdited.getTime())
      .slice(0, 10);
  } catch (error) {
    console.error(`Error reading directory at ${targetDir}:`, error);
    return [];
  }
}

export async function getFeatured() {
  // fetch from git
  fetchPosts();
  const topFolders = getTopRecentFolders("./public/posts");

  return topFolders.map((folder, key) => {
    return {
      thumbnail: `/${folder.absolutePath}/thumbnail.png`,
      title: folder.name,
      link: `/${folder.absolutePath}`,
    };
  });
}
