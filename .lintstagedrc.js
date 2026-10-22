module.exports = {
  // Type check TypeScript files
  "**/*.(ts|tsx)": () => "pnpm tsc",

  // Compile sass files
  "**/*.(sass|scss)": (filenames) => [
    `sass ${filenames
      .map((e) => {
        return `${e}:${e.replaceAll("sass", "css")}`;
      })
      .join(" ")}`,
  ],
  // Build docker files
  "docker-compose.example.yml": (filenames) => [
    "cp docker-compose.example.yml docker-compose.yml",
    "docker compose build",
  ],
  Dockerfile: (filenames) => [
    "cp docker-compose.example.yml docker-compose.yml",
    "docker compose build",
  ],
  ".dockerignore": (filenames) => [
    "cp docker-compose.example.yml docker-compose.yml",
    "docker compose build",
  ],
  // Prettify only Markdown and JSON files
  "**/*.(md|json)": (filenames) =>
    `pnpm prettier --write ${filenames.join(" ")}`,
};
