export async function onRequestGet(context) {
  const path = Array.isArray(context.params.path)
    ? context.params.path.join("/")
    : String(context.params.path || "");

  if (!path || (!path.startsWith("assets/img/") && !path.startsWith("makantoassets/img/"))) {
    return new Response("Not found", { status: 404 });
  }

  const upstream = "https://ngpintegratedservices.infy.uk/" + path;
  const response = await fetch(upstream, {
    headers: { "User-Agent": "NGP-Integrated-Services-Media-Proxy/1.0" }
  });

  if (!response.ok) {
    return new Response("Media unavailable", { status: response.status });
  }

  const headers = new Headers(response.headers);
  headers.set("Cache-Control", "public, max-age=86400, s-maxage=604800");
  headers.set("Access-Control-Allow-Origin", "*");

  return new Response(response.body, {
    status: response.status,
    headers
  });
}