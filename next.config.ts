import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  serverExternalPackages: ["pdfkit"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "qsbckliglejhyzeoymym.supabase.co",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/aviso-privacidad.html",
        destination: "/aviso-privacidad",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
