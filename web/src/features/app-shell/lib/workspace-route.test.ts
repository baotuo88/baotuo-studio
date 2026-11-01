import assert from "node:assert/strict";
import test from "node:test";
import { activeWorkspaceSlug } from "./workspace-route";

const slugs = ["image", "video", "canvas", "admin/system"] as const;
test("workspace selection handles nested routes without prefix collisions", () => {
    assert.equal(activeWorkspaceSlug("/canvas/project-1?tab=video", slugs), "canvas");
    assert.equal(activeWorkspaceSlug("/image/", slugs), "image");
    assert.equal(activeWorkspaceSlug("/images", slugs), undefined);
    assert.equal(activeWorkspaceSlug("/", slugs), undefined);
});
test("all admin pages share one navigation entry without granting visibility", () => {
    assert.equal(activeWorkspaceSlug("/admin/users", slugs), "admin/system");
    assert.equal(activeWorkspaceSlug("/admin/users", ["image", "video"]), undefined);
    assert.equal(activeWorkspaceSlug("/administrator", slugs), undefined);
});
test("the most specific matching workspace wins", () => {
    assert.equal(activeWorkspaceSlug("/canvas/templates/123", ["canvas", "canvas/templates"]), "canvas/templates");
});
