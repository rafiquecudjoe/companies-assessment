# Companies

A Companies list with a detail/create drawer on Next.js 16, backed by an in-memory API in route handlers. Part 1 answers are in [ANSWERS.md](ANSWERS.md).

## Run

- `pnpm install`
- `pnpm dev`, open `/`, sign in with any token
- Checks: `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`

## Versions (installed)

Next 16.4.5, React 19.3.0, TanStack Query 5.107.1, nuqs 2.10.2.

## Structure

- `src/app`: layout, providers, sign-in, `/companies`, `api/v1/companies` route handlers
- `src/server/companies`: store (40 seeded), pure list logic, HTTP helpers (auth, delay, FastAPI-style errors)
- `src/lib/api`: typed client in hey-api's generated shape (`types.gen`, `sdk.gen`, `@tanstack/react-query.gen`), shared zod schemas, `ApiError`, token store
- `src/lib/i18n`: typed `en`/`nl` dictionaries, locale cookie, date formatting
- `src/features/companies`: table, filters, pagination, drawer, form
- `features/` reaches the API only through `lib/api`

## Decisions

- **URL state with nuqs:** typed parsers, batched writes, a testing adapter. Status, sort, page and opening the drawer push history. Typing a search replaces it. Any filter change resets the page in the same write.
- **Drawer is `?company=<id|new>`:** same page, shared links work. Native `<dialog>.showModal()` gives the focus trap, Escape and inert background for free.
- **Table never remounts:** one Suspense boundary above the view, `keepPreviousData`, only `<tbody>` changes, `aria-busy` while fetching. Search is debounced 300 ms before it reaches the query key.
- **One zod schema** for the route handlers and the form, so client and API rules cannot drift.
- **Plain form state:** `useActionState` resets fields on submit, which would lose the draft on a 409.
- **Query keys are normalised** (defaults filled, empty values dropped), so equal requests share a cache entry.
- **Translations without a library:** only the active dictionary reaches the client. A missing or extra key in `nl.ts` fails `tsc`.
- **Tests call the real route handlers** through a `fetch` stub, so no MSW and no mocks of the API shape.

## 409 flow

1. The form keeps the draft and the version it opened with, and sends it as `if_version`.
2. On 409 an alert says someone else changed the company and the input is kept.
3. "Load latest" refetches the company, takes its version, and shows "Latest saved: X" under each field that differs. The draft is untouched.
4. Save again. On success the detail cache is set from the response and the lists are invalidated.

## 401 flow

- The client reads the token from `localStorage` per request and omits the header if none exists.
- Any 401 (query or mutation) clears the token and does `window.location.assign('/sign-in?next=...')`.
- `next` is accepted only as a same-origin path (no `//`, no backslash).

## With more time

- Generate the client from a real OpenAPI file
- Playwright tests for focus return, real Escape and the 375 px layout
- Server prefetch with `HydrationBoundary`

## Known limits

- The in-memory store resets on restart and is not shared between server instances.
- A page past the end shows the empty state.
- Tab can leave the modal for the browser's own controls.
- The token sits in `localStorage`, readable by any script on the page. Fine for a fake sign-in, not for production.
- The 422 component test uses a canned server response, because the client and server share one schema and the client blocks every invalid input first.
- Components were tested in jsdom only, not in a real browser.
- Sign-out and a route guard
- Optimistic updates
- A field-by-field merge view for conflicts
- Delete and bulk actions
