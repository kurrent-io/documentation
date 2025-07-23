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
          { text: ".NET", link: ver.linksFor("dotnet-client", false)[0]?.link || "/clients/grpc/dotnet/" },
          { text: "Python", link: ver.linksFor("python-client", false)[0]?.link || "/clients/grpc/python/" },
          { text: "Node.js", link: ver.linksFor("node-client", false)[0]?.link || "/clients/grpc/node/" },
          { text: "Java", link: ver.linksFor("java-client", false)[0]?.link || "/clients/grpc/java/" },
          { text: "Go", link: ver.linksFor("go-client", false)[0]?.link || "/clients/grpc/go/" },
          { text: "Rust", link: ver.linksFor("rust-client", false)[0]?.link || "/clients/grpc/rust/" },
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
