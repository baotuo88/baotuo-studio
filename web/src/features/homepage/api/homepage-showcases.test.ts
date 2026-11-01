import assert from "node:assert/strict";
import test from "node:test";
import { existsSync } from "node:fs";
import { getHomepageCreationHref, readHomepageShowcasePage, type HomepageVideoShowcase } from "./showcase-content";

const sample: HomepageVideoShowcase = {
    id: 1, title: "Example", description: "Example", category: "Demo", creatorName: "Example",
    mediaType: "video", mediaUrl: "https://example.invalid/video.mp4", thumbnailUrl: "", targetType: "video",
    targetPath: "/video", promptContent: "A paper boat", sortOrder: 1, status: 1,
};

test("fresh installations show an empty catalog without bundled demo media", () => {
    assert.deepEqual(readHomepageShowcasePage({ items: [], total: 0 }), { items: [], total: 0, categories: [] });
    assert.equal(existsSync(new URL("../../../../public/homepage/originals", import.meta.url)), false);
});

test("empty category results remain empty and preserve the server categories", () => {
    assert.deepEqual(readHomepageShowcasePage({ items: [], total: 0, categories: ["My work"] }), { items: [], total: 0, categories: ["My work"] });
});

test("administrator content and pagination metadata are preserved", () => {
    const page = { items: [sample], total: 30, categories: ["Demo", "Other"] };
    assert.deepEqual(readHomepageShowcasePage(page), page);
});

test("invalid showcase media and external navigation targets are rejected", () => {
    for (const item of [{ ...sample, mediaUrl: "" }, { ...sample, targetPath: "//external.invalid" }]) {
        assert.throws(() => readHomepageShowcasePage({ items: [item], total: 1 }), /无效/);
    }
});

test("configured showcase links preserve the administrator's prompt", () => {
    const url = new URL(getHomepageCreationHref(sample), "https://example.invalid");
    assert.equal(url.pathname, "/video");
    assert.equal(url.searchParams.get("initialPrompt"), sample.promptContent);
});
