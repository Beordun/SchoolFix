# Error Incident Report: Post-Merge HTTP 500 Internal Server Error

> **Incident ID:** INC-20261030-500  
> **Target System:** SchoolFix (Next.js 14 App Router, Node.js runtime)  
> **Severity:** High (Application-Wide Request Failure)  
> **Status:** Resolved  
> **Associated Commit:** [`2f78310`](https://github.com/Beordun/SchoolFix/commit/2f78310) (`fix: eliminate conflicting app/icon.svg causing 500 internal server error`)  

---

## 1. Incident Summary
Following the completion and merge of `feature/task-5-sessions-compliance-defence` into `main`, attempting to access any route (`/`, `/auth?mode=login`, `/auth?mode=register`, `/portal/dashboard`) yielded an unexpected **`HTTP 500 Internal Server Error`** in the browser. 

Investigation revealed a compound failure involving:
1. An internal Next.js App Router routing collision between `app/icon.svg` and `public/icon.svg`.
2. Webpack compilation cache desynchronization in `.next/` caused by live git branch switching.

---

## 2. Forensic Error Signatures & Terminal Traces

### Error Signature A: Webpack Packfile Cache Invalidation
During git branch checkout and merge while the development server (`next dev`) was running in the background, file system inode updates invalidated compiled route chunks:

```text
<w> [webpack.cache.PackFileCacheStrategy] Caching failed for pack: Error: ENOENT: no such file or directory, lstat 'C:\Users\DT001\Desktop\SchoolFix\.next\server\app\api\reset'
<w> [webpack.cache.PackFileCacheStrategy/webpack.FileSystemInfo] Resolving '../../../../.next/server/app/api/reset/route' in C:\Users\DT001\Desktop\SchoolFix\node_modules\next\dist\server for build dependencies doesn't lead to expected result 'C:\Users\DT001\Desktop\SchoolFix\.next\server\app\api\reset\route.js'
...
⨯ TypeError: Cannot read properties of undefined (reading 'clientModules')
   at C:\Users\DT001\Desktop\SchoolFix\node_modules\next\dist\compiled\next-server\app-page.runtime.dev.js:40:25679
   at async doRender (C:\Users\DT001\Desktop\SchoolFix\node_modules\next\dist\server\base-server.js:1427:30)
   at async cacheEntry.responseCache.get.routeKind (C:\Users\DT001\Desktop\SchoolFix\node_modules\next\dist\server\base-server.js:1588:28)
GET /auth?mode=register 500 in 5655ms
GET /auth?mode=login 500 in 5658ms
GET /auth?mode=login&redirect=%2Fportal%2Fdashboard 500 in 5623ms
```

### Error Signature B: Next.js Conflicting Public vs Page File Routing
After clearing the webpack cache, pages returned `200 OK`, but the browser still reported connection failures or error banners. Inspecting raw server HTTP responses for browser-initiated requests identified:

```text
HTTP/1.1 500 Internal Server Error
Content-Type: text/html; charset=utf-8

{
  "props": {
    "pageProps": {
      "statusCode": 500
    }
  },
  "page": "/_error",
  "query": {},
  "buildId": "development",
  "isFallback": false,
  "err": {
    "name": "Error",
    "source": "server",
    "message": "A conflicting public file and page file was found for path /icon.svg https://nextjs.org/docs/messages/conflicting-public-file-page",
    "stack": "Error: A conflicting public file and page file was found for path /icon.svg https://nextjs.org/docs/messages/conflicting-public-file-page\n    at handleRequest (C:\\Users\\DT001\\Desktop\\SchoolFix\\node_modules\\next\\dist\\server\\lib\\router-server.js:285:38)\n    at async requestHandlerImpl (C:\\Users\\DT001\\Desktop\\SchoolFix\\node_modules\\next\\dist\\server\\lib\\router-server.js:383:13)\n    at async Server.requestListener (C:\\Users\\DT001\\Desktop\\SchoolFix\\node_modules\\next\\dist\\server\\lib\\start-server.js:141:13)"
  }
}
```

---

## 3. Root Cause Analysis

### Cause 1: Metadata Route Collision (`app/icon.svg` vs `public/icon.svg`)
In Next.js App Router (v13.3+), file names placed directly in the `app/` directory matching `icon.(ico|jpg|jpeg|png|svg)` are treated as **special file-based metadata route conventions**. Next.js automatically generates a dynamic route handler for `/icon.svg` to serve that file.

In SchoolFix:
- `app/icon.svg` was introduced during Task 2 information design (`231054f`).
- `public/icon.svg` was also added to hold the static brand SVG referenced by `app/layout.tsx`:
  ```tsx
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  }
  ```
Because Next.js forbids having both a static asset in `public/` and a dynamic page/metadata route in `app/` that resolve to the identical URL path (`/icon.svg`), the router aborted the request with a fatal `500 Internal Server Error`.

### Cause 2: Browser Automatic Favicon Fetching Cascades 500
Modern web browsers automatically dispatch an asynchronous request for `/icon.svg` or `/favicon.ico` on every page load. Even when the HTML of `/auth?mode=login` renders successfully, the background favicon request fails with `500`, injecting error overlays in developer mode and signaling a broken site.

### Cause 3: In-Memory / Disk Webpack Cache Drift
When switching git branches (`git checkout main`, `git merge`), active worker threads in `next dev` continue reading from memory caches pointing to compiled file offsets that no longer match the checked-out working tree, throwing `ENOENT` on deleted/relocated route chunks until the `.next` directory is purged.

---

## 4. Resolution Steps Executed

1. **Purged Webpack Artifact Cache:**
   Terminated the stale `next dev` background task and recursively deleted `.next`:
   ```powershell
   Remove-Item -Recurse -Force .next
   ```

2. **Eliminated Conflicting Route File:**
   Removed `app/icon.svg`, retaining `public/icon.svg` as the single authoritative static asset matching `app/layout.tsx`:
   ```powershell
   git rm app/icon.svg
   git commit -m "fix: eliminate conflicting app/icon.svg causing 500 internal server error"
   git push origin main
   ```

3. **Re-Launched Clean Dev Server:**
   Started `npm run dev` with fresh module compilation:
   ```text
   ▲ Next.js 14.2.35
   - Local:        http://localhost:3000
   ✓ Ready in 2.3s
   ```

---

## 5. Verification Matrix Post-Fix

Automated HTTP verification script executed across all routes confirms 100% healthy status codes:

```text
Route                          HTTP Status    Result
------------------------------------------------------
/                              200 OK         PASSED
/auth                          200 OK         PASSED
/auth?mode=login               200 OK         PASSED
/auth?mode=register            200 OK         PASSED
/auth?mode=reset               200 OK         PASSED
/article                       200 OK         PASSED
/portal/dashboard              307 Redirect   PASSED (Guarded by Middleware)
/portal/admin                  307 Redirect   PASSED (Guarded by Middleware)
/portal/session-inspector      307 Redirect   PASSED (Guarded by Middleware)
/icon.svg                      200 OK         PASSED (image/svg+xml)
```

Browser subagent verification verified live UI rendering with zero modal errors or console exceptions.

---

## 6. Preventive Policy for Future Sprints
1. **Metadata Convention Rule:** Never place an icon file in `app/` (`app/icon.svg`) if a static file of the same name exists in `public/` (`public/icon.svg`).
2. **Branch Transition Rule:** When performing major non-fast-forward git merges or rebases involving route file additions/deletions, terminate `next dev` and wipe `.next` before booting the server.
