(function () {
  "use strict";
  if (window.__ngpEnquiryEventsInstalled) return;
  window.__ngpEnquiryEventsInstalled = true;

  // Keep the NGP GA4 property clean: only the canonical production hostname
  // may send enquiry events. Consent remains required.
  if (window.location.hostname !== "ngpintegratedservices.com") return;

  function hasAnalyticsConsent() {
    try { return window.localStorage.getItem("ngp-consent") === "accepted"; }
    catch (error) { return false; }
  }
  function send(eventName, parameters) {
    if (!hasAnalyticsConsent() || typeof window.gtag !== "function") return;
    window.gtag("event", eventName, Object.assign({
      event_category: "enquiry",
      page_path: window.location.pathname,
      transport_type: "beacon"
    }, parameters || {}));
  }
  document.addEventListener("click", function (event) {
    var link = event.target && event.target.closest ? event.target.closest("a[href]") : null;
    if (!link) return;
    var href = (link.getAttribute("href") || "").trim();
    if (/^tel:/i.test(href)) {
      send("phone_click", { contact_method: "telephone" });
      return;
    }
    if (/^(https?:)?\/\/(?:wa\.me|api\.whatsapp\.com|www\.whatsapp\.com)(?:\/|$)/i.test(href)) {
      send("whatsapp_click", { contact_method: "whatsapp" });
    }
  }, true);
  document.addEventListener("submit", function (event) {
    var form = event.target;
    if (!form || form.tagName !== "FORM") return;
    if (typeof form.checkValidity === "function" && !form.checkValidity()) return;
    var destination = (form.getAttribute("action") || "").toLowerCase().startsWith("mailto:")
      ? "email_client" : "website";
    send("generate_lead", {
      form_id: form.id || "contact-form",
      submission_method: destination
    });
  }, true);
})();