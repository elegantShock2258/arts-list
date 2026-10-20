import { execSync } from "child_process";

const githubToken = process.env.GITHUB_TOKEN;

export function fetchPosts() {
  try {
    execSync(`git submodule update --remote`, {
      stdio: "pipe",
    });
  } catch (error: any) {
    process.exit(1);
  }
}
