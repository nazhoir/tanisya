let config: any = {};

try {
  const moduleName = "@opennextjs/cloudflare";
  const runtimeRequire = new Function("name", "return require(name)") as (
    name: string,
  ) => { defineCloudflareConfig: (config: Record<string, unknown>) => unknown };

  const { defineCloudflareConfig } = runtimeRequire(moduleName);
  config = defineCloudflareConfig({
    // optional custom config
  });
} catch {
  // @opennextjs/cloudflare is optional and may not be available during build
}

export default config;
