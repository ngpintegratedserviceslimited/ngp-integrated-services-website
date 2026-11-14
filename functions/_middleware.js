export async function onRequest(context) {
  const url = new URL(context.request.url);
  const hostname = url.hostname.toLowerCase();

  // One public hostname and one URL shape: HTTPS apex, no trailing slash
  // except for the root. Preserve query strings during permanent redirects.
  if (hostname === "www.ngpintegratedservices.com") {
    url.hostname = "ngpintegratedservices.com";
    if (url.pathname.length > 1 && url.pathname.endsWith("/")) {
      url.pathname = url.pathname.replace(/\/+$/, "");
    }
    return Response.redirect(url.toString(), 301);
  }

  // This deployment is a static corporate website, not an API service.
  if (hostname === "api.ngpintegratedservices.com") {
    if (context.request.method === "GET" || context.request.method === "HEAD") {
      return Response.redirect("https://ngpintegratedservices.com/", 301);
    }
    return new Response("No API service is configured on this hostname.", {
      status: 404,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store"
      }
    });
  }

  // Canonicalise direct file aliases and directory-style routes before
  // static asset resolution. Keep the root URL as "/" and preserve queries.
  if (url.pathname === "/index.html") {
    url.pathname = "/";
    return Response.redirect(url.toString(), 301);
  }
  if (url.pathname !== "/404.html" && url.pathname.endsWith(".html")) {
    url.pathname = url.pathname.slice(0, -".html".length) || "/";
    return Response.redirect(url.toString(), 301);
  }
  if (url.pathname.length > 1 && url.pathname.endsWith("/")) {
    url.pathname = url.pathname.replace(/\/+$/, "");
    return Response.redirect(url.toString(), 301);
  }

  return context.next();
}
