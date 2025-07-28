import {defineClientConfig, useRoute} from 'vuepress/client';
import "iconify-icon";
import {onMounted} from "vue";
import type {RouteLocationNormalized, Router} from "vue-router";
import CloudBanner from "./components/CloudBanner.vue";
import KapaWidget from './components/KapaWidget.vue';
import UserFeedback from './components/TocWithFeedback';
import {usePostHog} from "./lib/usePosthog";
import SidebarLayout from "./layouts/SidebarLayout.vue";

declare const __VERSIONS__: { 
    latest: string, 
    selected: string, 
    all: {
        id: string,
        group: string,
        basePath: string,
        versions: {
            version: string,
            path: string,
            startPage: string,
            preview?: boolean,
            deprecated?: boolean,
            hide?: boolean
        }[]
    }[]
}

const storageKey = "VUEPRESS_TAB_STORE";

const findMetaKey = (record: any[], key: string) => {
    if (record[0] !== "meta") return null;
    const data = record[1];
    return data.name === key ? data.content : null;
}

const findMeta = (head, key) => {
    return head.map(x => findMetaKey(x, key)).find(x => x !== null);
}

const findEsMeta = (route) => {
    const head = route.meta?._pageChunk?.data?.frontmatter?.head;
    if (head === undefined) return;
    return {
        version: findMeta(head, "es:version"),
        category: findMeta(head, "es:category"),
    }
}

const removeHtml = (path: string) => path.replace(".html", "");

const reload = () => {
    if (typeof window !== "undefined") {
        setTimeout(() => {
            window.location.reload()
        }, 200);
    }
}

const leave = (to: RouteLocationNormalized, from: RouteLocationNormalized) => {
    if (from.path !== to.path && typeof window !== "undefined") {
        posthog.capture('$pageleave');
    }
}

const {posthog} = usePostHog();

export default defineClientConfig({
    layouts: {
        Layout: SidebarLayout
    },
    enhance({app, router, _}) {
        app.component("CloudBanner", CloudBanner);
        app.component("KapaWidget", KapaWidget);
        app.component("UserFeedback", UserFeedback);
        const addFixedRoute = (from: string, to: string) => router.addRoute({
            path: from, redirect: _ => {
                reload();
                return to;
            }
        });
        const addDynamicRoute = (from: string, calc: ((to: RouteLocationNormalized) => string)) =>
            router.addRoute({
                path: from,
                redirect: to => {
                    reload();
                    return calc(to);
                }
            });

        // Router configuration
        addFixedRoute("/server/http-api/", `/${__VERSIONS__.latest}/http-api/introduction`);
        addFixedRoute("/cloud/", `/cloud/introduction.html`);
        router.afterEach(() => {
            setTimeout(() => { // to ensure this runs after DOM updates
                try {
                    const {code} = JSON.parse(localStorage.getItem('VUEPRESS_TAB_STORE')!);
                    if (code) { // If a valid 'code' is found in localStorage
                        Array.from(document.querySelectorAll('.vp-tab-nav'))
                            .forEach((button: HTMLButtonElement) => {
                                if (button.textContent!.trim() === code) {
                                    button.click(); // click the button to switch the tab
                                }
                            });
                    }
                } catch (_error) {
                    // Error is ignored
                }
            }, 0);
        });
        const operatorLatest = __VERSIONS__.all.filter(x => x.id === 'kubernetes-operator')[0].versions[0].version;
        addDynamicRoute("/server/kubernetes-operator", to => `/server/kubernetes-operator/${operatorLatest}/getting-started/`);
        addDynamicRoute("/server/kubernetes-operator/:version", to => `/server/kubernetes-operator/${to.params.version}/getting-started/`);

        addDynamicRoute('/clients/:lang(dotnet|golang|java|node|python|rust)/legacy/:version', to => {
          const version = to.params.version;
          const latestVersion = __VERSIONS__.all.find(x => x.id === `${to.params.lang}-client`)?.versions.find(v => v.path === `legacy/${version}`)
          return `/clients/${to.params.lang}/legacy/${to.params.version}/${latestVersion?.startPage}`;
        });
        addDynamicRoute('/clients/:lang(dotnet|golang|java|node|python|rust)/legacy', to => {
          const latestVersion = __VERSIONS__.all.find(x => x.id === `${to.params.lang}-client`)?.versions.find(v => v.path.startsWith('legacy/'))
          return `/clients/${to.params.lang}/${latestVersion?.path}/${latestVersion?.startPage}`;
        })

        addDynamicRoute('/clients/:lang(dotnet|golang|java|node|python|rust)/:version', to => {
          const version = to.params.version;
          const latestVersion = __VERSIONS__.all.find(x => x.id === `${to.params.lang}-client`)?.versions.find(v => v.path === version)
          return `/clients/${to.params.lang}/${version}/${latestVersion?.startPage}`;
        });
        addDynamicRoute('/clients/:lang(dotnet|golang|java|node|python|rust)', to => {
          const latestVersion = __VERSIONS__.all.find(x => x.id === `${to.params.lang}-client`)?.versions[0]
          return `/clients/${to.params.lang}/${latestVersion?.path}/${latestVersion?.startPage}`;
        })


        // Add fixed routes for server versions because they don't use the same sidebar structure as the other versions
        addFixedRoute("/server/v22.10", "/server/v22.10/introduction.html");
        addFixedRoute("/server/v5", "/server/v5/introduction.html");

        addDynamicRoute("/server/:version", to => `/server/${to.params.version}/quick-start/`);
        addDynamicRoute('/latest/:pathMatch(.*)*', to => to.path.replace(/^\/latest/, `/${__VERSIONS__.latest}`));
        addFixedRoute("/server/latest", `/${__VERSIONS__.latest}/quick-start/`);
        addFixedRoute("/latest", `/${__VERSIONS__.latest}/quick-start/`);
        addFixedRoute("/latest.html", `/${__VERSIONS__.latest}/quick-start/`);

        router.afterEach((to, from) => {
            if (typeof window === "undefined" || to.path === from.path || removeHtml(to.path) === removeHtml(from.path)) return;
            const esData = findEsMeta(to);
            posthog.capture('$pageview', {
                site: "docs",
                version: esData?.version,
                category: esData?.category,
            });
            const a = window.analytics;
            if (a) {
                setTimeout(() => {
                    a.page({
                        site: "docs",
                        url: window.location.origin + to.fullPath,
                        title: to.meta.t,
                        version: esData?.version,
                        category: esData?.category,
                    });
                }, 1000);
            }

            // Check for 404 page after navigation completes
            setTimeout(() => {
                // Check for the specific elements with classes error-code and error-hint
                const errorCodeElement = document.querySelector('p.error-code');
                const errorHintElement = document.querySelector('p.error-hint');

                // If both elements exist, we're on a 404 page
                if (errorCodeElement && errorHintElement) {
                    // Capture the 404 event in PostHog
                    if (window && window.posthog) {
                        window.posthog.capture("page_not_found", {
                            url: window.location.href,
                            referrer: document.referrer,
                            path: to.path,
                            attemptedPath: to.path.replace('.html', '')
                        });
                    }
                }
            }, 50);
        });
        router.beforeEach((to, from) => leave(to, from));
    },
    setup() {
        onMounted(() => {
            const route = useRoute();
            if (route.path !== "/") ;
        });

    },
});