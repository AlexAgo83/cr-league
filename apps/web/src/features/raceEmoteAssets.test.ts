import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { EMOTE_IDS } from "@cr-league/shared";

const publicDir = join(process.cwd(), "apps", "web", "public");
// RIFF container magic plus the WEBP fourcc at offset 8.
const riffMagic = [0x52, 0x49, 0x46, 0x46];
const webpFourCC = [0x57, 0x45, 0x42, 0x50];

describe("race emote assets", () => {
  it.each(EMOTE_IDS)("ships a webp asset for %s", (emote) => {
    // The map resolves /assets/crl/emotes/<id>.webp at runtime, so a declared emote with no file
    // behind it would only surface as a broken image during a replay.
    const asset = readFileSync(join(publicDir, "assets", "crl", "emotes", `${emote}.webp`));

    expect([...asset.subarray(0, 4)]).toEqual(riffMagic);
    expect([...asset.subarray(8, 12)]).toEqual(webpFourCC);
  });
});
