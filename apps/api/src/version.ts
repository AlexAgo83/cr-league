import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

export const APP_VERSION = (require("../../../package.json") as { version: string }).version;
export const APP_COMMIT = process.env.RENDER_GIT_COMMIT ?? process.env.GITHUB_SHA ?? "dev";
