/** Legacy arbitrary-target proxy is disabled. */
export async function POST(): Promise<Response> {
    return new Response("WebDAV proxy is no longer available", { status: 410 });
}
