export async function onRequest(context) {
  const url = new URL(context.request.url);

  // Redirect only the production www hostname. Leave the Pages preview
  // hostname and every other host untouched.
  if (url.hostname.toLowerCase() === "www.ngpintegratedservices.com") {
    url.hostname = "ngpintegratedservices.com";
    return Response.redirect(url.toString(), 301);
  }

  return context.next();
}
