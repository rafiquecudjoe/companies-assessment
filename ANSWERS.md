# Part 1: written answers

## 1. Server or Client Component

- Default to Server. Switch to Client only for state, effects, event handlers or browser APIs.
- Server example: the page shell and the heading (`/companies/page.tsx`), which add no component JavaScript to the bundle.
- Client example: the filterable table and drawer. They read URL state, handle clicks, hold form drafts and use TanStack Query.
- The boundary sits at the page: the server page renders the shell and heading and passes serialisable props into one client view. The table, filters and drawer share URL state and the query cache, so splitting them would mean lifting that state through props.
- Props crossing the boundary must be serialisable. Here the locale and dictionary cross as plain data.

## 2. Fetching in a Server Component

- Fetch on the server for first paint of data that needs no client state, for example a list with default filters, or a shared link that opens a company. This also keeps secrets and slow calls on the server.
- Hand it over with `prefetchQuery` on a server `QueryClient`, then `dehydrate` it into `<HydrationBoundary>`. The client `useQuery` uses the same query options, so the same key finds the data in the cache and does not refetch.
- Set a non-zero `staleTime`, otherwise the client refetches on mount anyway.
- I did not do this in the build. The list depends on URL state and a browser-held token, so server prefetch would need the token in a cookie.

## 3. Handling a 409

- The user keeps what they typed. An alert says someone else changed the record, and offers "Load latest".
- Load latest refetches, takes the new version for the next `if_version`, and shows "Latest saved: X" under each field that differs. It does not overwrite the draft, because silently discarding input is worse than a second save.
- Cache: on success I set the detail query from the PATCH response and invalidate the list queries. On 409 I do not invalidate the lists. The refetch updates only the detail entry.
- No optimistic update. With versioned writes, a rollback would have to handle this very case.

## 4. Filter, sort and page state

- It lives in the URL, through nuqs, with typed parsers and defaults (`clearOnDefault`). Refresh and back work because the URL is the source of truth, and no copy sits in `useState`.
- The query key is built from the same values. `listCompaniesOptions(params)` normalises them (defaults filled, empty values dropped), so a URL and its key cannot disagree.
- Search is debounced before it reaches the key, and the input itself is controlled by the URL. Filters and sort reset the page in the same write. Typing replaces the history entry, so back is not spammed per keystroke.

## 5. Token on requests, expiry, and where it must not go

- The shared client reads the token from the token store when each request is made and sets the `Authorization` header. Components never see it.
- Expiry: the API returns 401. A `QueryCache` and `MutationCache` `onError` handles it in one place by clearing the token and redirecting to sign-in with a validated `next` path. With a real identity provider I would refresh silently first, retry once, and redirect only if that fails.
- The token must never be in the URL, in query keys (they show in devtools and logs), in server-rendered HTML, in logs, or in a `NEXT_PUBLIC_` variable. In production I would prefer an httpOnly cookie session over `localStorage`, which any script can read.

## 6. Loading, error and empty states

- `loading.tsx` and `error.tsx` cover a route's first load and unexpected render errors. They should not wrap the table that must stay mounted while filters change.
- Here one `Suspense` boundary sits above the view (needed for URL hooks). Inside, the table handles its own state: skeleton rows while pending, an error row with Retry, and an empty row.
- The drawer has its own states, since it fetches separately: loading text, error with Retry, and a not-found message. A failing drawer must not take down the list, and the other way round.
- Not wrapped: refetches with `keepPreviousData`. A boundary there would flash the whole page on every keystroke.

## 7. Dutch and English

- The locale is a cookie, read on the server in the root layout. It sets `<html lang>` and picks one typed dictionary, which is passed to a context provider. Server and client components both read from it, and only the active language is shipped.
- Dates and numbers use `Intl` with the same locale, never the browser default.
- The toggle is a Server Action that sets the cookie, and Next re-renders the page. A library such as next-intl would be the next step with more strings, plurals or locale-based URLs. For a handful of strings it was not worth the dependency.

## 8. Measuring a slow page

- Measure first, in the field if I can: LCP, INP and CLS (Web Vitals), plus TTFB. Then use the Network and Performance panels and the React Profiler to find where the time goes: server, network, bundle size or rendering.
- Two features to improve a data-heavy page:
  - Streaming with Suspense, so the shell and fast parts render while slow data loads.
  - Server prefetch with `HydrationBoundary`, or caching with `"use cache"`, so the first paint has data without a client round trip.
- Others: `next/dynamic` for heavy client code, and pagination or virtualisation for long lists.

## 9. Testing approach

- **Unit:** pure logic with real edge cases. Here: query-key normalisation, the API client (bearer header, `ApiError` on 401, 409 and 422), list filtering and sorting, the redirect-target check, and date and dictionary helpers. They are fast and pin down the rules.
- **Component:** behaviour a user sees, with the real route handlers behind a `fetch` stub. Here: search and filters change rows and the URL, the table node survives a filter change, and the drawer's 409 flow, validation and 422. This is where most bugs in this feature would be.
- **End-to-end (not written here):** what jsdom cannot do. Real focus trap and Escape, focus return, a real browser back button, the 401 redirect across pages, the 375 px layout, and the real server delay. I would use Playwright.
- I mock the network edge, not our own code, so the tests keep working through refactors. The one forced response is the 422, because the client blocks every invalid input first.
