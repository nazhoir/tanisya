import "@tanisya/env/web";
import "@tanisya/env/server";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	typedRoutes: true,
	reactCompiler: true,
};

export default nextConfig;
