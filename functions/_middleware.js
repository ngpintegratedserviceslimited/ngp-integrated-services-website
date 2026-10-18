export async function onRequest(context) {
  const url = new URL(context.request.url);
  const hostname = url.hostname.toLowerCase();

  // The public corporate website has one canonical hostname: the apex domain.
  // Keep the www redirect permanent and preserve the requested path and query.
  if (hostname === "www.ngpintegratedservices.com") {
    url.hostname = "ngpintegratedservices.com";
    return Response.redirect(url.toString(), 301);
  }

  // This deployment is a static corporate website, not an API service.
  // Do not serve the homepage as though it were an API response.
  // Safe browser navigation on the unused API hostname goes to the canonical
  // homepage; non-navigation methods receive a clear 404 instead of a redirect.
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

  return context.next();
}
