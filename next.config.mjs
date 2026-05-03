/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  images: { unoptimized: true },
  // En GitHub Pages la app vive en /mis-finanzas, localmente en /
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || "",
};
export default nextConfig;
