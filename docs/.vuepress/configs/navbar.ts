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
          { text: "KurrentDB clients", link: "/clients/grpc/getting-started" },
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
