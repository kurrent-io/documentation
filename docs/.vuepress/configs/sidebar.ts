import type {EsSidebarOptions} from "../lib/types";
import { instance as ver } from "../lib/versioning";

export const sidebarEn: EsSidebarOptions = {
  "/getting-started/": [
    {
      text: "Quickstart",
      link: "/getting-started/quickstart/",
      group: "Getting Started",
    },
    {
      text: "Introduction",
      link: "/getting-started/introduction.md",
      group: "Getting Started",
    },
    {
      text: "Concepts",
      link: "/getting-started/concepts.md",
      group: "Getting Started",
    },
    {
      text: "Features",
      link: "/getting-started/features.md",
      group: "Getting Started",
    },    
    {
      text: "Use Cases",
      collapsible: true,
      expanded: false,
      group: "Use Cases",
      children: [
        {
          text: "Mix-and-Match Database",
          collapsible: true,
          expanded: false,
          group: "Mix-and-Match Database",
          children: [
            "/getting-started/use-cases/mix-and-match-database/introduction.md",
            {
              text: "Tutorial",
              collapsible: true,
              expanded: false,
              group: "Mix-and-Match Database Tutorial",
              children: [                
                "/getting-started/use-cases/mix-and-match-database/tutorial-intro.md",
                "/getting-started/use-cases/mix-and-match-database/tutorial-1.md",
                "/getting-started/use-cases/mix-and-match-database/tutorial-2.md",
                "/getting-started/use-cases/mix-and-match-database/tutorial-3.md",
                "/getting-started/use-cases/mix-and-match-database/tutorial-4.md"
              ]
            }
          ]
        }
      ]
    },
    {
      text: "Evaluate",
      collapsible: true,
      expanded: false,
      group: "Getting Started",
      children: [
        "/getting-started/evaluate/business-process-support.md",
        "/getting-started/evaluate/state-vs-event-based-data-model.md",
        "/getting-started/evaluate/data-pipeline.md",
      ]
    },
  ],
  "/clients/grpc/": "structure",
  "/cloud/": "structure",
  ...ver.getSidebars(),
  "/clients/tcp/dotnet/21.2/": "structure",
};
