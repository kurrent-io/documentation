import type {EsSidebarOptions} from "../lib/types";
import { instance as ver } from "../lib/versioning";

export const sidebarEn: EsSidebarOptions = {
  "/getting-started/": [

    {
      text: "Welcome",
      link: "/getting-started/introduction.md",
      group: "Getting Started",
    },
    {
      text: "The Kurrent Ecosystem",
      link: "/getting-started/kurrent-ecosystem.md",
      group: "Getting Started",
    },
    {
      text: "Why Kurrent?",
      link: "/getting-started/kurrent-why.md",
      group: "Getting Started",
    },
    {
      text: "Kurrent Concepts",
      link: "/getting-started/concepts.md",
      group: "Getting Started",
    },
    {
      text: "Self-Guided Demo",
      link: "/getting-started/quickstart/",
      group: "Getting Started",
    }, 
    {
      text: "Going Further",
      link: "/getting-started/going-further.md",
      group: "Getting Started",
    }, 
    
  ],
  "/clients/grpc/": "structure",
  "/cloud/": "structure",
  ...ver.getSidebars(),
  "/clients/tcp/dotnet/21.2/": "structure",
};
