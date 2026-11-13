export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Serve approved media paths from this Worker version's static asset
    // manifest. Missing files must return a real 404, never legacy-host HTML.
    if (url.pathname.startsWith("/media/")) {
      const path = url.pathname.slice("/media/".length);
      const allowed =
        path.startsWith("assets/img/") ||
        path.startsWith("makantoassets/img/") ||
        path.startsWith("signageassets/img/");

      if (!allowed || !path) {
        return new Response(request.method === "HEAD" ? null : "Not found", {
          status: 404,
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "no-store"
          }
        });
      }

      const localAsset = await env.ASSETS.fetch(request);
      if (localAsset.status !== 404) {
        return localAsset;
      }

      return new Response(request.method === "HEAD" ? null : "Media unavailable", {
        status: 404,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-store",
          "X-Content-Type-Options": "nosniff"
        }
      });
    }

    return env.ASSETS.fetch(request);
  }
};
