import "iconify-icon";
import {onMounted} from "vue";
import type {RouteLocation, RouteLocationNormalized} from "vue-router";
import {defineClientConfig} from 'vuepress/client';
import CloudBanner from "./components/CloudBanner.vue";
import ClientsGrid from "./components/ClientsGrid.vue";
import KapaWidget from './components/KapaWidget.vue';
import UserFeedback from './components/TocWithFeedback';
import SidebarLayout from "./layouts/SidebarLayout.vue";
import {usePostHog} from "./lib/usePosthog";
import { useReoDev } from "./lib/useReoDev";

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

const clients = ":lang(dotnet|golang|java|node|python|rust)"

const findMetaKey = (record: any[], key: string) => {
    if (record[0] !== "meta") return null;
    const data = record[1];
    return data.name === key ? data.content : null;
}

const findMeta = (head: any[], key: string) => {
    return head.map(x => findMetaKey(x, key)).find(x => x !== null);
}

const findEsMeta = (route: RouteLocationNormalized) => {
    const head = (route.meta as any)?._pageChunk?.data?.frontmatter?.head;
    if (head === undefined) return;
    return {
        version: findMeta(head, "es:version"),
        category: findMeta(head, "es:category"),
    }
}

const removeHtml = (path: string) => path.replace(".html", "");

let usercentricsConsentListenerRegistered = false;


export default defineClientConfig({
    layouts: {
        Layout: SidebarLayout
    },
    enhance({app, router}) {
        const { hasConsent, posthog } = usePostHog();
        useReoDev();

        const captureEvent = async (event: string, properties?: Record<string, any>) => {
            if (!await hasConsent()) return;
            try {
                posthog.capture(event, properties);
            } catch (error) {
                console.error("Failed to capture PostHog event: ", event, error instanceof Error ? error.message : "Unknown error");
            }
        };

        const handlePageLeave = (to: RouteLocationNormalized, from: RouteLocationNormalized) => {
            if (from.path !== to.path) captureEvent("$pageleave");
        };

        const handlePageView = (to: RouteLocationNormalized, from: RouteLocationNormalized) => {
            if (to.path === from.path || removeHtml(to.path) === removeHtml(from.path)) return;

            const esData = findEsMeta(to);
            captureEvent("$pageview", {
                site: "docs",
                version: esData?.version,
                category: esData?.category,
            });
        };

        const track404Page = (path: string) => {
            if (typeof window === "undefined" || typeof document === "undefined") return;
            setTimeout(() => {
                if (typeof document === "undefined") return;
                const errorCodeElement = document.querySelector("p.error-code");
                const errorHintElement = document.querySelector("p.error-hint");
                if (errorCodeElement && errorHintElement) {
                captureEvent("page_not_found", {
                    url: window.location.href,
                    referrer: document.referrer,
                    path,
                    attemptedPath: path.replace(".html", ""),
                });
                }
            }, 50);
        };

        router.afterEach((to, from) => {
            if (typeof window === "undefined") return;
            handlePageView(to, from);
            track404Page(to.path);
        });

        router.beforeEach((to, from) => {
            if (typeof window === "undefined") return;
            handlePageLeave(to, from)
        });

        // Capture first pageview when consent is given (UC_CONSENT) or when CMP is ready with existing consent (UC_UI_INITIALIZED)
        if (typeof window !== "undefined" && !usercentricsConsentListenerRegistered) {
            usercentricsConsentListenerRegistered = true;
            const capturePageViewOnConsent = async () => {
                if (!await hasConsent()) return;
                const to = router.currentRoute.value;
                const esData = findEsMeta(to);
                captureEvent("$pageview", {
                    site: "docs",
                    version: esData?.version,
                    category: esData?.category,
                });
            };
            window.addEventListener("UC_CONSENT", capturePageViewOnConsent);
            window.addEventListener("UC_UI_INITIALIZED", capturePageViewOnConsent);
        }

    
        app.component("CloudBanner", CloudBanner);
        app.component("ClientsGrid", ClientsGrid);
        app.component("KapaWidget", KapaWidget);
        app.component("UserFeedback", UserFeedback);
        const addFixedRoute = (from: string, to: string) => router.addRoute({
            path: from, redirect: to
        });
        const addDynamicRoute = (from: string, calc: ((to: RouteLocation) => string)) =>
            router.addRoute({
                path: from,
                redirect: to => calc(to)
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
        addDynamicRoute("/server/kubernetes-operator/latest/:pathMatch(.*)*", to => to.path.replace(/^\/server\/kubernetes-operator\/latest/, `/server/kubernetes-operator/${operatorLatest}`));
        addDynamicRoute("/server/kubernetes-operator/:version", to => `/server/kubernetes-operator/${to.params.version}/getting-started/`);

        // Clients routes
        addFixedRoute(`/clients/grpc/:pathMatch(.*)*`, "/clients/");

        addDynamicRoute(`/clients/${clients}/latest/:pathMatch(.*)*`, to => {
          const latestVersion = __VERSIONS__.all.find(x => x.id === `${to.params.lang}-client`)?.versions[0]
          return `/clients/${to.params.lang}/${latestVersion?.version}/${to.params.pathMatch}`;
        });
        addDynamicRoute(`/clients/${clients}/latest`, to => {
          const latestVersion = __VERSIONS__.all.find(x => x.id === `${to.params.lang}-client`)?.versions[0]
          return `/clients/${to.params.lang}/${latestVersion?.version}/${latestVersion?.startPage}`;
        });
        addDynamicRoute(`/clients/${clients}/legacy/:version`, to => {
          const version = to.params.version;
          const latestVersion = __VERSIONS__.all.find(x => x.id === `${to.params.lang}-client`)?.versions.find(v => v.path === `legacy/${version}`)
          return `/clients/${to.params.lang}/legacy/${to.params.version}/${latestVersion?.startPage}`;
        });
        addDynamicRoute(`/clients/${clients}/legacy`, to => {
          const latestVersion = __VERSIONS__.all.find(x => x.id === `${to.params.lang}-client`)?.versions.find(v => v.path.startsWith('legacy/'))
          return `/clients/${to.params.lang}/${latestVersion?.path}/${latestVersion?.startPage}`;
        })
        addDynamicRoute(`/clients/${clients}/:version`, to => {
          const version = to.params.version;
          const latestVersion = __VERSIONS__.all.find(x => x.id === `${to.params.lang}-client`)?.versions.find(v => v.path === version)
          return `/clients/${to.params.lang}/${version}/${latestVersion?.startPage}`;
        });
        addDynamicRoute(`/clients/${clients}`, to => {
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
    },
    
    setup() {
        onMounted(() => {});

    },
});
