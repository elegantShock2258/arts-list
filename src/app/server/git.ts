import { execSync } from "child_process";
import path from "path";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || "";

export function fetchPosts() {
  try {
    execSync(`git submodule update --remote`, {
      stdio: "pipe",
    });
  } catch (error: any) {
    process.exit(1);
  }
}
export async function pushSubmoduleWithToken(
  commitMessage: string,
  branch: string = "master",
): Promise<{ success: boolean; message: string }> {
  try {
    const rootDir = process.cwd();
    const submoduleDir = path.join(rootDir, "public", "posts");

    const runCmd = (cmd: string, cwd: string) => {
      return execSync(cmd, { cwd, encoding: "utf8", stdio: "pipe" });
    };

    const getAuthenticatedUrl = (cwd: string): string => {
      const rawUrl = runCmd("git remote get-url origin", cwd).trim();

      let cleanUrl = rawUrl;
      if (rawUrl.startsWith("git@github.com:")) {
        cleanUrl = rawUrl.replace("git@github.com:", "https://github.com/");
      }

      return cleanUrl.replace(
        "https://",
        `https://x-access-token:${GITHUB_TOKEN}@`,
      );
    };

    runCmd(`git checkout ${branch}`, submoduleDir);
    runCmd("git add .", submoduleDir);

    try {
      runCmd(`git commit -m "${commitMessage}"`, submoduleDir);
    } catch {
      console.log("No new changes to commit in the submodule.");
    }

    const submoduleAuthUrl = getAuthenticatedUrl(submoduleDir);
    runCmd(`git push ${submoduleAuthUrl} ${branch}`, submoduleDir);
    console.log("Submodule pushed successfully.");

    console.log(` Updating parent repository: ${rootDir}`);
    runCmd("git add public/posts", rootDir);

    try {
      runCmd(`git commit -m "chore(posts): ${commitMessage}"`, rootDir);
    } catch {
      console.log("Parent repo pointer is already up to date.");
    }

    const parentAuthUrl = getAuthenticatedUrl(rootDir);
    runCmd(`git push ${parentAuthUrl} ${branch}`, rootDir);
    console.log("Parent repository pushed successfully.");

    return {
      success: true,
      message:
        "Both submodule and parent repositories successfully pushed using token auth!",
    };
  } catch (error: any) {
    const safeError = (error.message || "").replace(
      new RegExp(GITHUB_TOKEN, "g"),
      "***TOKEN***",
    );
    console.error("Error executing authenticated git operations:", safeError);
    return {
      success: false,
      message: "An error occurred during token authentication.",
    };
  }
}
