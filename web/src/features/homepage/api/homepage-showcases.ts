import { listHomepageShowcases } from "@/services/api/server";
import { readHomepageShowcasePage } from "./showcase-content";

export { getHomepageCreationHref, getHomepageTargetPath, homepageTargetPaths } from "./showcase-content";

export async function fetchHomepageShowcases() {
    return readHomepageShowcasePage(await listHomepageShowcases(24)).items;
}

export async function fetchHomepageShowcasePage(params: { page: number; pageSize: number; category?: string }) {
    return readHomepageShowcasePage(await listHomepageShowcases(params));
}
