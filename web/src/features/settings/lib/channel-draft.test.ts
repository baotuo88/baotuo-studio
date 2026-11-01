import assert from "node:assert/strict";
import test from "node:test";
import { normalizeChannelDraft } from "./channel-draft";
const draft = { name: " 自定义接口 ", baseUrl: "https://api.example.test/v1/", apiKey: " test-key ", models: [" model-a ", "model-a", "model-b"] };
test("custom channels retain version paths and normalize duplicate models", () => {
    assert.deepEqual(normalizeChannelDraft(draft), { name: "自定义接口", baseUrl: "https://api.example.test/v1", apiKey: "test-key", models: ["model-a", "model-b"] });
});
test("manual models support private endpoints and keyless services", () => {
    assert.equal(normalizeChannelDraft({ ...draft, baseUrl: "http://localhost:11434/v1", apiKey: "" }).apiKey, "");
});
test("rejects credentials in URLs and malformed addresses", () => {
    for (const baseUrl of ["api.example.test", "file:///etc/passwd", "https://key:secret@example.test/v1", "https://example.test/v1?key=secret", "https://example.test/#token"]) {
        assert.throws(() => normalizeChannelDraft({ ...draft, baseUrl }));
    }
});
test("rejects empty model catalogs and reserved model separator", () => {
    assert.throws(() => normalizeChannelDraft({ ...draft, models: [" "] }));
    assert.throws(() => normalizeChannelDraft({ ...draft, models: ["provider::model"] }));
    assert.throws(() => normalizeChannelDraft({ ...draft, name: " " }));
});
