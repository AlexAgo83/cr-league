import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

export const APP_VERSION = (require("../../../package.json") as { version: string }).version;
