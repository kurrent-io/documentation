import type {RedirectPluginOptions} from "@vuepress/plugin-redirect";

export const redirect: RedirectPluginOptions = {
    // Tutorial and Use Case Redirects
    config: {
        // Tutorial files moved from tutorials/ to dev-center/tutorials/
        "/tutorials/(.*)": "/dev-center/tutorials/$1",
        
        // Use case tutorial-N.md files moved into /tutorial/ subfolder
        "/getting-started/use-cases/(.*)/tutorial-1.md": "/dev-center/use-cases/$1/tutorial/tutorial-1.md",
        "/getting-started/use-cases/(.*)/tutorial-1.html": "/dev-center/use-cases/$1/tutorial/tutorial-1.html",
        "/getting-started/use-cases/(.*)/tutorial-2.md": "/dev-center/use-cases/$1/tutorial/tutorial-2.md",
        "/getting-started/use-cases/(.*)/tutorial-2.html": "/dev-center/use-cases/$1/tutorial/tutorial-2.html",
        "/getting-started/use-cases/(.*)/tutorial-3.md": "/dev-center/use-cases/$1/tutorial/tutorial-3.md",
        "/getting-started/use-cases/(.*)/tutorial-3.html": "/dev-center/use-cases/$1/tutorial/tutorial-3.html",
        "/getting-started/use-cases/(.*)/tutorial-4.md": "/dev-center/use-cases/$1/tutorial/tutorial-4.md",
        "/getting-started/use-cases/(.*)/tutorial-4.html": "/dev-center/use-cases/$1/tutorial/tutorial-4.html",
        "/getting-started/use-cases/(.*)/tutorial-5.md": "/dev-center/use-cases/$1/tutorial/tutorial-5.md",
        "/getting-started/use-cases/(.*)/tutorial-5.html": "/dev-center/use-cases/$1/tutorial/tutorial-5.html",
        "/getting-started/use-cases/(.*)": "/dev-center/use-cases/$1",
    },
    defaultBehavior: "homepage",
    defaultLocale: "/",
    switchLocale: "modal",
};