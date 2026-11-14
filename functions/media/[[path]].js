export async function onRequestGet(context) {
  const path = Array.isArray(context.params.path)
    ? context.params.path.join("/")
    : String(context.params.path || "");

  if (!path || (!path.startsWith("assets/img/") && !path.startsWith("makantoassets/img/") && !path.startsWith("signageassets/img/"))) {
    return new Response("Not found", { status: 404 });
  }

  // Serve only files packaged with this Pages deployment. Missing media stays
  // a genuine 404; do not proxy requests to the retired InfinityFree site.
  return context.env.ASSETS.fetch(context.request);
}