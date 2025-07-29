import {logger, path} from 'vuepress/utils';
import {type ResolvedImport} from "../markdown/xode/types";
import version from "./version";
import * as fs from 'fs';

const base = "../../samples";

export function resolveMultiSamplesPath(src: string): ResolvedImport[] {
    const split = src.split(':');
    const cat = split.length < 2 ? undefined : split[0];
    const paths = split.length === 1 ? src : split[1];
    return paths.split(';')
        .filter(x => x.trim() !== '') // Filter out empty strings
        .map(x => {
            const r = resolveSamplesPath(x, cat);
            return {label: r.label, importPath: r.path};
        })
}

export function resolveSamplesPath(src: string, srcCat: string | undefined) {
    const def = (s: string) => {
        return {label: "", path: s}
    };

    // Handle empty src
    if (!src || src.trim() === '') {
        console.warn(`Empty source path provided, srcCat: "${srcCat}"`);
        return def(src);
    }

    const srcParts = src.split('.');
    const ext = srcParts.length > 1 ? srcParts.pop()! : '';
    const pseudo = src.split('/');
    const includesCat = pseudo[0].startsWith('@');
    
    if (!includesCat && srcCat === undefined) return def(src);

    const cats: Record<string, Record<string, {path: string, version?: string, subPath?: string, label?: string}>> = {
        "@samples": {
            "default": {
                path: "server",
                version: "{version}"
            }
        },
        "@httpapi": {
            "default": {
                path: "server/v5/http-api",
            }
        },
        "@grpc": {
            "js": {
                label: "JavaScript",
                path: "clients/node/6.2.1"
            },
            "ts": {
                label: "TypeScript",
                path: "clients/node/6.2.1"
            },
            "cs": {
                label: "C#",
                path: "clients/dotnet/1.0.0"
            },
            "go": {
                label: "Go",
                path: "clients/go/1.0.0"
            },
            "rs": {
                label: "Rust",
                path: "clients/rust/4.0.1"
            },
            "py": {
                label: "Python",
                path: "clients/python/1.0.17"
            },
            "java": {
                label: "Java",
                path: "clients/java/5.4.5"
            },
        }
    };

    const isVersion = pseudo.length > 1 && version.isVersion(pseudo[1]);
    const catName: string = includesCat ? pseudo[0] : srcCat!;
    const cat = cats[catName];
    if (cat === undefined) {
        logger.warn(`Unknown placeholder: ${pseudo[0]}`);
        return def(src);
    }

    let lang = cat[ext] ?? cat["default"];
    if (lang === undefined) {
        // If no extension match and no default, try to find by partial match or return default
        logger.warn(`Unknown extension "${ext}" in category "${catName}". Available extensions: ${Object.keys(cat).join(', ')}`);
        return def(src);
    }

    // If we don't have an extension but we have a default, use it
    if (ext === '' && cat["default"]) {
        lang = cat["default"];
    }

    const samplesVersion = isVersion ? pseudo[1] : lang.version;
    const langPath = samplesVersion !== undefined ? `${lang.path}/${samplesVersion}` : lang.path;
    const toReplace = isVersion ? `${pseudo[0]}/${pseudo[1]}` : `${pseudo[0]}`;    

    const p = includesCat ? src.replace(toReplace, `${base}/${langPath}`) : `${base}/${langPath}/${src}`;
    const resolvedPath = path.resolve(__dirname, p);

    // Check if the resolved path is a directory, and if so, warn and return the original src
    try {
        const stat = fs.statSync(resolvedPath);
        if (stat.isDirectory()) {
            logger.warn(`Resolved path is a directory, not a file: ${resolvedPath}`);
            return def(src);
        }
    } catch (error) {
        // File doesn't exist, which is handled elsewhere
    }

    return {label: lang.label, path: resolvedPath};
}

export const projectionSamplesPath = "https://raw.githubusercontent.com/kurrent-io/KurrentDB/53f84e55ea56ccfb981aff0e432581d72c23fbf6/samples/http-api/data/";