export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Preserve the existing media URL structure while serving recovered files
    // from this Worker version's static asset manifest first.
    if (url.pathname.startsWith("/media/")) {
      const path = url.pathname.slice("/media/".length);
      const allowed =
        path.startsWith("assets/img/") ||
        path.startsWith("makantoassets/img/") ||
        path.startsWith("signageassets/img/");

      if (!allowed || !path) {
        return new Response("Not found", { status: 404 });
      }

      const localAsset = await env.ASSETS.fetch(request);
      if (localAsset.status !== 404) {
        return localAsset;
      }

      // Temporary compatibility fallback for the two originals not yet
      // recovered into the repository. Keep this until both are restored.
      const upstreamUrl = new URL(
        "/media/" + path,
        "https://ngpintegratedservices.infy.uk"
      );
      const upstream = await fetch(upstreamUrl, {
        method: request.method,
        headers: {
          "User-Agent": "NGP-Integrated-Services-Media-Proxy/1.0"
        },
        cf: {
          cacheEverything: true,
          cacheTtlByStatus: {
            "200-299": 604800,
            "404": 60,
            "500-599": 0
          }
        }
      });

      if (!upstream.ok) {
        return new Response("Media unavailable", { status: upstream.status });
      }

      const headers = new Headers(upstream.headers);
      headers.set("Cache-Control", "public, max-age=86400, s-maxage=604800");
      headers.set("Access-Control-Allow-Origin", "*");

      return new Response(upstream.body, {
        status: upstream.status,
        headers
      });
    }

    return env.ASSETS.fetch(request);
  }
};
