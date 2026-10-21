/** @type {import('next').NextConfig} */
const nextConfig = {
  // better-sqlite3 はネイティブモジュールのためバンドルしない
  serverExternalPackages: ["better-sqlite3"],
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
