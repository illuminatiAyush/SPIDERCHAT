# Google Search Console Verification & Indexing Workflow

## 1. Property Verification Status

* **HTML File Verification Method:**
  * File created at: `client/public/googleba862447bb8adbe6.html`
  * Content: `google-site-verification: googleba862447bb8adbe6.html`
  * Publicly served at: `https://YOUR_DOMAIN/googleba862447bb8adbe6.html`
* **HTML Tag Verification Method:**
  * Tag added to `client/src/app/layout.tsx` metadata:
    `<meta name="google-site-verification" content="googleba862447bb8adbe6" />`

---

## 2. Sitemap Submission Instructions

Once the latest build is deployed to production:

1. Open [Google Search Console](https://search.google.com/search-console).
2. Select your verified property (e.g., `https://the-web-verse.vercel.app` or your custom domain).
3. Navigate to **Sitemaps** in the left sidebar menu.
4. In the "Add a new sitemap" input field, enter:
   `sitemap.xml`
5. Click **Submit**.
6. Verify that the status turns green to **Success** and displays the 11 discovered public URLs.

---

## 3. URL Inspection & Priority Indexing Request

After submitting the sitemap, use the **URL Inspection** tool at the top of Google Search Console to request priority indexing for primary pages:

1. Enter `https://YOUR_DOMAIN/` and click Enter.
2. Click **Test Live URL**.
3. Verify that the response reports:
   * "URL is available to Google"
   * "Page is mobile friendly"
   * "Refered sitemap detected"
4. Click **Request Indexing**.
5. Repeat for high-priority landing routes:
   * `https://YOUR_DOMAIN/join`
   * `https://YOUR_DOMAIN/security`
   * `https://YOUR_DOMAIN/privacy-policy`

---

## 4. Monitoring & Troubleshooting

* **Discovered - Currently Not Indexed:** Often caused by thin or loading-state content. With the splash-screen prerender fix and the new Multiverse FAQ, content depth is now high.
* **Crawled - Currently Not Indexed:** Resolved by ensuring proper canonical self-referencing on every public route.

