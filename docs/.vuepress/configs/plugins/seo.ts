import type { SeoPluginOptions } from "@vuepress/plugin-seo";
import { match } from "ts-pattern";
import type { App, HeadConfig, Page } from "vuepress";
import { hostname } from "./shared";
import { instance as versioning } from "../../lib/versioning";

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

/**
 * Finds the version group for a given section path.
 * @param section The section path (e.g., "server", "clients/dotnet", "server/kubernetes-operator").
 * @returns The version group or null if not found.
 */
const findVersionGroup = (section: string): typeof versioning.all[0] | null => {
  // Special case for kubernetes-operator
  if (section === "server/kubernetes-operator") {
    return versioning.all.find((v) => v.id === "kubernetes-operator") || null;
  }

  // Try to find by basePath match
  const byBasePath = versioning.all.find((v) => v.basePath === section);
  if (byBasePath) {
    return byBasePath;
  }

  // Try to match client sections to their version group IDs
  const clientMatch = section.match(/^clients\/(\w+)/);
  if (clientMatch) {
    const clientName = clientMatch[1];
    const clientId = `${clientName}-client`;
    return versioning.all.find((v) => v.id === clientId) || null;
  }

  return null;
};

/**
 * Gets the latest version string for a given section.
 * @param section The section path.
 * @returns The latest version string, or null if not found.
 */
const getLatestVersionForSection = (section: string): string | null => {
  const versionGroup = findVersionGroup(section);
  if (!versionGroup?.versions?.length) {
    return null;
  }

  // Find the first non-preview, non-excluded version (which is the latest)
  const excludedVersions = EXCLUDED_VERSIONS[section] || [];
  const latestVersion = versionGroup.versions.find(
    v => v.version && !v.preview && !excludedVersions.includes(v.version)
  );

  return latestVersion?.version || null;
};

/**
 * Gets the docsearch:version content for a page.
 * @param section The section path.
 * @param currentVersion The current version string from the path.
 * @returns The version content string (e.g., "v1.2,latest" or "v1.1" or "v1.0,legacy").
 */
const getDocSearchVersionContent = (section: string, currentVersion: string | null): string | null => {
  if (!currentVersion) {
    return null;
  }

  const parts: string[] = [currentVersion];
  const latestVersion = getLatestVersionForSection(section);
  
  if (latestVersion && currentVersion === latestVersion) {
    parts.push("latest");
  }

  if (section.includes("legacy")) {
    parts.push("legacy");
  }

  return parts.join(",");
};

/**
 * Maps a section path to a docsearch product name.
 * @param section The section path (e.g., "clients/dotnet", "server").
 * @returns The product name for docsearch (e.g., "dotnet_sdk", "js_sdk", "server") or null if not in the list.
 */
const getDocSearchProduct = (section: string): string | null => {
  return match(section)
    .with("clients/dotnet", () => "dotnet_sdk")
    .with("clients/golang", () => "golang_sdk")
    .with("clients/java", () => "java_sdk")
    .with("clients/node", () => "js_sdk")
    .with("clients/python", () => "python_sdk")
    .with("clients/rust", () => "rust_sdk")
    .with("clients/dotnet/legacy", () => "dotnet_sdk")
    .with("clients/golang/legacy", () => "golang_sdk")
    .with("clients/java/legacy", () => "java_sdk")
    .with("clients/node/legacy", () => "js_sdk")
    .with("clients/python/legacy", () => "python_sdk")
    .with("clients/rust/legacy", () => "rust_sdk")
    .with("clients/tcp/dotnet", () => "dotnet_sdk_tcp")
    .with("cloud", () => "cloud")
    .with("server/kubernetes-operator", () => "kubernetes_operator")
    .with("server", () => "server")
    .otherwise(() => null);
};

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
   *      <meta name="docsearch:version" content="v1.0,v1.1,v1.2" />
   *      <meta name="docsearch:language" content="en" />
   *      <meta name="docsearch:product" content="dotnet_sdk" />
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

    // Add DocSearch meta tags
    // Add language tag (defaulting to "en")
    head.push(["meta", { name: "docsearch:language", content: "en" }]);

    // Add product tag (only if section is in the list)
    const product = getDocSearchProduct(section);
    if (product) {
      head.push(["meta", { name: "docsearch:product", content: product }]);
    }

    // Add version tag with current version
    const docSearchVersion = getDocSearchVersionContent(section, version);
    if (docSearchVersion) {
      head.push(["meta", { name: "docsearch:version", content: docSearchVersion }]);
    }
  }
};
