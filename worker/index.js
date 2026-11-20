export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Enforce one public origin and canonical path shape before asset lookup.
    // This Worker is the production entry point, so keep this here as well as
    // in Pages middleware to ensure redirects run for every request.
    const hostname = url.hostname.toLowerCase();
    if (hostname === "www.ngpintegratedservices.com" || url.protocol !== "https:") {
      url.protocol = "https:";
      if (hostname === "www.ngpintegratedservices.com") url.hostname = "ngpintegratedservices.com";
      if (url.pathname.length > 1 && url.pathname.endsWith("/")) {
        url.pathname = url.pathname.replace(/\/+$/, "");
      }
      return Response.redirect(url.toString(), 301);
    }
    if (url.pathname === "/index.html") {
      url.pathname = "/";
      return Response.redirect(url.toString(), 301);
    }
    if (url.pathname !== "/404.html" && !url.pathname.endsWith("/index.html") && url.pathname.endsWith(".html")) {
      url.pathname = url.pathname.slice(0, -".html".length) || "/";
      return Response.redirect(url.toString(), 301);
    }
    if (url.pathname.length > 1 && url.pathname.endsWith("/")) {
      url.pathname = url.pathname.replace(/\/+$/, "");
      return Response.redirect(url.toString(), 301);
    }

    // Serve approved media paths from this Worker version's static asset
    // manifest. Missing files must return a real 404, never legacy-host HTML.
    if (url.pathname.startsWith("/media/")) {
      const path = url.pathname.slice("/media/".length);
      const allowed =
        path.startsWith("assets/img/") ||
        path.startsWith("illustrations/") ||
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
