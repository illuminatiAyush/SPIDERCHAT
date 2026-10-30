# Internal Linking Architecture & Orphan Page Remediation

## 1. Architectural Crawl Path Topology

```
                  ┌──────────────────────┐
                  │      Landing (/)     │
                  └──────────┬───────────┘
                             │
     ┌───────────────────────┼────────────────────────┐
     │                       │                        │
┌────▼────┐             ┌────▼────┐              ┌────▼────┐
│  /join  │             │  /login │              │ /signup │
└─────────┘             └─────────┘              └─────────┘
     ▲                       ▲                        ▲
     └───────────────────────┼────────────────────────┘
                             │
              ┌──────────────┴──────────────┐
              │     Global Footer Links     │
              └──────────────┬──────────────┘
                             │
 ┌─────────────┬─────────────┼─────────────┬─────────────┐
 │             │             │             │             │
┌▼─────────┐ ┌▼─────────┐ ┌▼──────────┐ ┌▼─────────┐ ┌▼────────┐
│  /terms  │ │/privacy- │ │ /security │ │ /status  │ │ /support │
│          │ │  policy  │ │           │ │          │ │          │
└──────────┘ └──────────┘ └───────────┘ └──────────┘ └──────────┘
```

---

## 2. Remediated Orphan Pages

Prior to this update, `/privacy-policy`, `/support`, and `/feedback` were not consistently reachable through clear crawlable anchor tags from the landing page.

### Implemented Fixes:
1. **Footer Top Navigation:** Contains large styled links for:
   * Privacy Protocols (`/privacy-policy`)
   * Guy in the Chair (`/support`)
   * Daily Bugle Tip Line (`/feedback`)
2. **Footer Bottom Bar:** Standardized crawlable anchor links with icons and descriptive text for:
   * Terms of Service (`/terms`)
   * Privacy Policy (`/privacy-policy`)
   * Security Protocols (`/security`)
   * Support Center (`/support`)
   * Network Status (`/status`)
   * GitHub Open Source Repository
3. **Subpage Breadcrumb Navigation:** Every subpage includes an anchor back to the root base (`/`).

