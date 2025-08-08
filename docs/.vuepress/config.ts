/* eslint-disable import/no-named-as-default */

import {dl} from "@mdit/plugin-dl";
import viteBundler from "@vuepress/bundler-vite";
import dotenv from "dotenv"
import vueDevTools from 'vite-plugin-vue-devtools'
import {defineUserConfig} from "vuepress";
import {path} from 'vuepress/utils';
import {hopeTheme} from "vuepress-theme-hope";
import {themeOptions} from "./configs/theme";
import {projectionSamplesPath, resolveMultiSamplesPath} from "./lib/samples";
import {instance as ver} from "./lib/versioning";
import {linkCheckPlugin} from "./markdown/linkCheck";
import {replaceLinkPlugin} from "./markdown/replaceLink";
import {importCodePlugin} from "./markdown/xode/importCodePlugin";

dotenv.config({path: path.join(__dirname, '..', '..', '.algolia', '.env')});

// noinspection JSUnusedGlobalSymbols
export default defineUserConfig({
    base: "/",
    dest: "public",
    bundler: viteBundler({viteOptions: {plugins: [vueDevTools(),],}}),
    title: "Kurrent Docs",
    description: "The stream database built for Event Sourcing",
    define: {
        __VERSIONS__: {
            latest: ver.latest,
            selected: ver.latest,
            all: ver.all
        },
    },
    extendsPage: (page) => {
        page.data.versions = {
            latest: ver.latest,
            all: ver.all
        }
    },
    markdown: {
        importCode: false,
        headers: {level: [2, 3]},
    },
    pagePatterns: [
      '**/*.md',
      '!**/v*/README.md',
      '!.vuepress',
      '!node_modules'
    ],
    extendsMarkdown: md => {
        md.use(replaceLinkPlugin, {
            replaceLink: (link: string, _) => link
                .replace("@server/", "/server/{version}/")
                .replace("@clients/grpc/", "/clients/grpc/")
                .replace("@client/dotnet/5.0/", "/clients/tcp/dotnet/21.2/")
                .replace("@httpapi/data/", projectionSamplesPath)
                .replace("@httpapi/", "/server/v5/http-api/")
                // Add tutorial and use case redirects
                .replace(/^\/tutorials\/(.*)/, "/dev-center/tutorials/$1")
                .replace(/^\/getting-started\/use-cases\/(.*)\/tutorial-([1-5])\.(md|html)/, "/dev-center/use-cases/$1/tutorial/tutorial-$2.$3")
                .replace(/^\/getting-started\/use-cases\/(.*)/, "/dev-center/use-cases/$1")
        });
        md.use(importCodePlugin, {
            handleImportPath: s => resolveMultiSamplesPath(s)
        });
        md.use(linkCheckPlugin);
        // @ts-ignore
        md.use(dl);

        const originalHighlight = md.options.highlight || ((code, lang, attrs) => code);

        md.options.highlight = (code, lang, attrs) => {
        if (lang === "env") {
            lang = "bash";
        }
        return originalHighlight(code, lang, attrs);
        };
    },
    theme: hopeTheme(themeOptions,{custom: true}),
    head: [
        // Business Institution 247, before the user accepts cookie
        ['script', {
            type: 'text/javascript',
            src: 'https://secure.businessintuition247.com/js/264384.js',
          }],
          ['noscript', {},
            '<img alt="" src="https://secure.businessintuition247.com/264384.png" style="display:none;" />'
          ],
      
          // Cookiebot banner 
          ['script', {
            id: 'Cookiebot',
            src: 'https://consent.cookiebot.com/uc.js',
            'data-cbid': 'ee971b30-e872-46e8-b421-706ef26d9dcc',
            'data-blockingmode': 'auto',
            type: 'text/javascript',
          }],
      
          // Cookiebot declaration
          ['script', {
            id: 'CookieDeclaration',
            src: 'https://consent.cookiebot.com/ee971b30-e872-46e8-b421-706ef26d9dcc/cd.js',
            type: 'text/javascript',
            async: true,
          }],

          ['script', { src: '/js/snippet.js' }],
      
          // Business Institution 247 “consent‑only” loader 
          ['script', {
            type: 'text/plain',
            'data-cookiecategory': 'marketing',
            src: 'https://secure.businessintuition247.com/js/sc/264384.js',
          }],

          // Kapa helper widget
          ['script', {
            src: 'https://widget.kapa.ai/kapa-widget.bundle.js',
            'data-website-id': '9ff147dd-2c68-495d-9859-de159901d8c5',
            'data-project-name': 'Kurrent',
            'data-project-color': '#631B3A',
            'data-project-logo': '/logo-white.png'
        }],

        // Reo.Dev
        ['script', { src: "/js/reoDev.js"}],

        // CSS override to hide the modal mask and wrapper entirely
        ['style', {}, `
          .redirect-modal-mask,
          .redirect-modal-wrapper {
            display: none !important;
          }
        `],
    ],   
    // add our own components for blog theme (Tutorials & Guides)
    alias: {
        "@theme-hope/components/BreadCrumb": path.resolve(__dirname, "./components/breadCrumb.ts"),
        "@theme-hope/modules/info/components/TOC": path.resolve(__dirname, "./components/TocWithFeedback.ts"),
    }
});