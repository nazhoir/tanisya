let config: any = {};

try {
  const { defineCloudflareConfig } = require("@opennextjs/cloudflare");
  config = defineCloudflareConfig({
    // optional custom config
  });
} catch {
  // @opennextjs/cloudflare is optional and may not be available during build
}

export default config;