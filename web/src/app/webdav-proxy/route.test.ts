import assert from "node:assert/strict";
import test from "node:test";
import { POST } from "./route";

test("disabled proxy rejects requests without making outbound calls", async (t) => {
    const fetchMock = t.mock.method(globalThis, "fetch", () => { throw new Error("unexpected outbound request"); });
    const response = await POST();
    assert.equal(response.status, 410);
    assert.equal(fetchMock.mock.callCount(), 0);
});
