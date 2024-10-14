import { instance as ver } from "../lib/versioning";
import type {EsSidebarOptions} from "../lib/types";

export const sidebarEn: EsSidebarOptions = {
  "/getting-started/": [
    {
      text: "Introduction",
      link: "/getting-started/README.md",
      group: "Getting Started (DRAFT)",
    },
    {
      text: "Quickstart",
      group: "Getting Started (DRAFT)",
      children: [
        "/getting-started/quickstart/README.md"
      ],
    },
    {
      text: "Concept",
      group: "Getting Started (DRAFT)",
      children: [
        "/getting-started/concept/architecture.md",
        "/getting-started/concept/key-benefit.md",
        "/getting-started/concept/business-process.md",
      ],
    },
  ],
  "/clients/grpc/": "structure",
  "/cloud/": "structure",
  // ...ver.getSidebars(),
  "/server/v24.10 Preview 1/": "structure",
  "/server/v24.6/": "structure",
  "/server/v23.10/": "structure",
  "/server/v22.10/": "structure",
  "/server/v5/": "structure",
  "/http-api/v24.6/": "structure",
  "/http-api/v23.10/": "structure",
  "/http-api/v22.10/": "structure",
  "/http-api/v5/": "structure",
  "/clients/tcp/dotnet/21.2/": "structure",
};
