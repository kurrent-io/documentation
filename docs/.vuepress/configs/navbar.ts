import type { NavbarOptions } from "vuepress-theme-hope";
import { instance as ver } from "../lib/versioning";

export const navbarEn: NavbarOptions = [
  {
    text: "Getting Started",
    link: "/getting-started/introduction.html",
  },
  {
    text: "Kurrent Cloud",
    link: "/cloud/introduction",
  },
  {
    text: "KurrentDB",
    children: [
      { text: "Current", children: ver.linksFor("server", false) },
      { text: "Deprecated", children: ver.linksFor("server", true) },
      {
        text: "Kubernetes Operator",
        children: ver.linksFor("kubernetes-operator", false),
      },
    ],
  },
  {
    text: "Clients & APIs",
    children: [
      {
        text: "Clients",
        children: [
          { text: ".NET", link: `/clients/grpc/dotnet/` },
          { text: "Python", link: "/clients/grpc/python/getting-started.html" },
          { text: "Node.js", link: "/clients/grpc/nodejs/getting-started.html" },
          { text: "Java", link: "/clients/grpc/java/getting-started.html" },
          { text: "Go", link: "/clients/grpc/go/getting-started.html" },
          { text: "Rust", link: "/clients/grpc/rust/getting-started.html" },
        ],
      },
      { text: "HTTP API", children: ver.linksFor("http-api", false) },
      {
        text: "Deprecated",
        children: [{ text: "Legacy TCP clients", link: "/clients/tcp/" }],
      },
    ],
  },

  {
    text: "Developer Resources",
    children: [
      {
        text: "Tutorials & Use cases",
        link: "/dev-center/",
      },
      { text: "Community forum", link: "https://discuss.kurrent.io/" },
      { text: "Community Discord ", link: "https://discord.gg/Phn9pmCw3t" },
      { text: "Blogs", link: "https://www.kurrent.io/blog" },
      { text: "Webinars", link: "https://www.kurrent.io/webinars" },
      { text: "Kurrent Academy", link: "https://academy.kurrent.io" },
    ],
  },
];
