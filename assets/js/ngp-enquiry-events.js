(function () {
  "use strict";
  if (window.__ngpEnquiryEventsInstalled) return;
  window.__ngpEnquiryEventsInstalled = true;
  function hasAnalyticsConsent() {
    try { return window.localStorage.getItem("ngp-consent") === "accepted"; }
    catch (error) { return false; }
  }
  function send(eventName, parameters) {
    if (!hasAnalyticsConsent() || typeof window.gtag !== "function") return;
    window.gtag("event", eventName, Object.assign({ event_category: "enquiry", page_path: window.location.pathname }, parameters || {}));
  }
  document.addEventListener("click", function (event) {
    var link = event.target && event.target.closest ? event.target.closest("a[href]") : null;
    if (!link) return;
    var href = (link.getAttribute("href") || "").trim();
    if (/^tel:/i.test(href)) { send("phone_click", { contact_method: "telephone" }); return; }
    if (/^(https?:)?\/\/(?:wa\.me|api\.whatsapp\.com|www\.whatsapp\.com)(?:\/|$)/i.test(href)) send("whatsapp_click", { contact_method: "whatsapp" });
  }, true);
  document.addEventListener("submit", function (event) {
    var form = event.target;
    if (!form || form.tagName !== "FORM") return;
    send("contact_form_submit", {
      form_id: form.id || "contact-form",
      form_destination: (form.getAttribute("action") || "").toLowerCase().startsWith("mailto:") ? "email_client" : "website"
    });
  }, true);
})();