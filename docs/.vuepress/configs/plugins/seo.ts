import type { SeoPluginOptions } from "@vuepress/plugin-seo";
import { match } from "ts-pattern";
import type { App, HeadConfig, Page } from "vuepress";
import { hostname } from "./shared";

interface DocumentationPath {
  version: string | null;
  section: string;
};

type Section = string;
type Version = string;

const SITE = "https://docs.kurrent.io";

/**
 * Configuration for excluding specific versions from SEO indexing.
 */
const EXCLUDED_VERSIONS: Record<Section, readonly Version[]> = {
  "server": ["v5", "v24.6"],
};

/**
 * Extracts version and section from path.
 * @example
 *    parsePathInfo("/clients/dotnet/v1.0/auth") // { version: "v1.0", section: "clients/dotnet" }
 *    parsePathInfo("/cloud/introduction.html") // { version: null, section: "cloud" }
 */
const parsePathInfo = (path: string): DocumentationPath => {
  const segments = path.split("/");
  const versionIndex = segments.findIndex((s, i) => i > 1 && /^(v\d+(\.\d+)*|\d+\.\d+)$/.test(s));
  const hasVersion = versionIndex > 1;

  return {
    version: hasVersion ? segments[versionIndex] : null,
    section: segments.slice(1, hasVersion ? versionIndex : 2).join("/")
  };
}

/**
 * Checks if a specific version of a section is excluded for SEO.
 * @param section The section to check.
 * @param version The version to check.
 * @returns True if the version is excluded, false otherwise.
 */
const isExcluded = (section: Section, version: Version | null): boolean =>
  !!version && !!EXCLUDED_VERSIONS[section]?.includes(version);

/**
 * Converts kebab case to title case.
 * @param str The input string.
 * @returns The normalized string.
 * 
 * @example
 * normalize("dev-center") // "Dev Center"
 */
const normalize = (str: string): string =>
  str.split(/[-/]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

export const seoPlugin: SeoPluginOptions = {
  hostname,

  /**
   * Redirects versioned pages to their "latest" equivalent for SEO purposes:
   * - `/server/v25.0/config` -> `/server/latest/config`
   * - `/clients/dotnet/v1.0/auth` -> `/clients/dotnet/latest/auth`
   * 
   * Excludes legacy and TCP clients from redirection
   */
  canonical: ({ path }: Page) => {
    const { version, section } = parsePathInfo(path);

    const isLegacy = ["legacy", "tcp"].some(exclude => section.includes(exclude));
    const isVersionized = ["server", "clients"].some(s => section.startsWith(s))

    const fallback = `${SITE}${path}`;

    if (!version) return fallback;

    if (isExcluded(section, version))
      return null;

    // redirect to latest for server and gRPC clients
    if (isVersionized && !isLegacy)
      return `${SITE}${path.replace(`/${section}/${version}`, `/${section}/latest`)}`;

    return fallback;
  },

  /**
   * Used to set custom head tags for the page unless it's excluded for SEO.
   * Algolia will automatically pick up these tags for groupings.
   *
   * Sets the following tags:
   * e.g. <meta name="es:category" content=".NET Client" />
   *      <meta name="es:version" content="v1.0" />
   * 
   * If it's a legacy or tcp client, it will be labelled as "Legacy"
   */
  customHead: (head: HeadConfig[], { path }: Page, app: App) => {
    const { version, section } = parsePathInfo(path);

    if (isExcluded(section, version)) {
      head.push(["meta", { name: "robots", content: "noindex,nofollow" }]);
      return;
    }

    if (version)
      head.push(["meta", { name: "es:version", content: version }]);

    const category = match(section)
      .with("clients/dotnet", () => ".NET Client")
      .with("clients/golang", () => "Golang Client")
      .with("clients/java", () => "Java Client")
      .with("clients/node", () => "Node.JS Client")
      .with("clients/python", () => "Python Client")
      .with("clients/rust", () => "Rust Client")
      .with("clients/dotnet/legacy", () => "Legacy gRPC .NET Client")
      .with("clients/golang/legacy", () => "Legacy gRPC Golang Client")
      .with("clients/java/legacy", () => "Legacy gRPC Java Client")
      .with("clients/node/legacy", () => "Legacy gRPC Node.JS Client")
      .with("clients/python/legacy", () => "Legacy gRPC Python Client")
      .with("clients/rust/legacy", () => "Legacy gRPC Rust Client")
      .with("clients/tcp/dotnet", () => "Legacy TCP .NET Client")
      .with("cloud", () => "Cloud")
      .with("getting-started", () => "Getting Started")
      .with("server/kubernetes-operator", () => "Kubernetes Operator")
      .with("server", () => "Server")
      .otherwise(() => normalize(section));

    head.push(["meta", { name: "es:category", content: category }]);
  }
};
