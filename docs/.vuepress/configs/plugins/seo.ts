import { SeoPluginOptions } from "@vuepress/plugin-seo";
import { App, HeadConfig, Page } from "vuepress";
import { match } from "ts-pattern";
import { hostname } from "./shared";

const LEGACY = "Legacy";
const EXCLUDED_VERSIONS = ["v5", "v24.6"];

export const seoPlugin: SeoPluginOptions = {
  hostname,

  canonical: (page: Page) => {
    const segments = page.pathInferred?.split("/") ?? [];
    const section = segments[1];
    const version = segments[2];

    if (EXCLUDED_VERSIONS.includes(version)) {
      return null;
    }

    // for cloud/tutorials sections, point to their root path
    if (section === "cloud" || section === "tutorials") {
      return `https://docs.kurrent.io/${section}${page.path.slice(section.length + 1)}`;
    }

    // otherwise use the full path (so v25 > v24, etc)
    return `https://docs.kurrent.io${page.path}`;
  },

  customHead: (head: HeadConfig[], page: Page, app: App) => {
    if (!page.pathInferred) return;

    const segments = page.pathInferred.split("/");
    let version = segments.length > 2 ? segments[2] : null;

    // drop indexing on unwanted versions
    if (version && EXCLUDED_VERSIONS.includes(version)) {
      head.push(["meta", { name: "robots", content: "noindex,nofollow" }]);
      return;
    }

    // map “tcp” to Legacy, then tag es:version if it applies
    if (version === "tcp") version = LEGACY;
    if (
      version &&
      (version === LEGACY ||
        (version.startsWith("v") && (version.includes(".") || version === "v5")))
    ) {
      head.push(["meta", { name: "es:version", content: version }]);
    }

    const category = segments[1];
    if (!category) return;
    const readable = match(category)
      .with("server", () => "Server")
      .with("clients", () => "Client")
      .with("cloud", () => "Cloud")
      .with("http-api", () => "HTTP API")
      .with("connectors", () => "Connectors")
      .with("getting-started", () => "Getting Started")
      .otherwise(() => category);

    head.push(["meta", { name: "es:category", content: readable }]);
  },
};
