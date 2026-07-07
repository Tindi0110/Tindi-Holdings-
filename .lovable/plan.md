# Make ShopSphere Fully Functional (Lovable Cloud)

Replace all mock data and dead buttons with a real backend. Done in 3 phases so each phase is testable on its own.

## Phase 1 — Foundation: Cloud + Auth + Data Model

1. Enable Lovable Cloud (provisions database, auth, storage).
2. Create database schema (migration):
   - `app_role` enum: `admin`, `manager`, `customer`
   - `branches` (id, name, address, phone, is_active)
   - `profiles` (id → auth.users, full_name, username, email, avatar_url, branch_id)
   - `user_roles` (user_id, role) + `has_role()` security definer fn
   - `categories` (id, name, slug, image_url)
   - `products` (id, name, slug, description, price, compare_at_price, image_url, category_id, stock, is_active, branch_id)
   - `carts` + `cart_items` (user-scoped)
   - `orders` (id, user_id, branch_id, status, subtotal, tax, shipping, total, shipping_address, created_at)
   - `order_items` (order_id, product_id, qty, unit_price)
   - RLS policies on every table + GRANTs to `authenticated` / `service_role`
   - Trigger: auto-create profile + assign `customer` role on signup
3. Seed branches, categories, and ~20 products with images.
4. Wire real auth:
   - `/login`, `/register`, `/forgot-password` → real Supabase email/password + Google OAuth
   - Branch selector pulls from `branches` table
   - Add `/reset-password` page
   - Root `onAuthStateChange` listener; `_authenticated` and `_admin` layout guards
   - Header shows logged-in user / logout

## Phase 2 — Storefront Functional

1. Replace mock products on home + listing with real queries (server fn).
2. Product detail page: load by slug, real add-to-cart writing to `cart_items`.
3. Cart drawer: live cart state from DB (TanStack Query), update qty, remove items.
4. New `/checkout` page: shipping form, order summary, "Place Order" creates `orders` + `order_items`, decrements stock, clears cart.
5. New `/orders` (customer) and `/orders/$id` pages.
6. Category filtering, search, working header links.

## Phase 3 — Admin CRUD + Analytics

1. Admin route protected by `admin` role.
2. Products page: list, create, edit, delete (image upload to storage).
3. Orders page: list real orders, change status (pending → shipped → delivered).
4. Branches page: CRUD branches.
5. Inventory page: per-branch stock adjustments.
6. Dashboard widgets: compute real metrics (revenue, orders count, top products, channel split) from `orders`/`order_items`. Replace mock sparklines with last-30-days aggregates.

## Technical Notes

- All DB reads/writes via `createServerFn` (with `requireSupabaseAuth` for user-scoped, `supabaseAdmin` only for public product listings + admin actions gated by `has_role`).
- TanStack Query for all data fetching; `ensureQueryData` in loaders, `useSuspenseQuery` in components.
- Roles in separate `user_roles` table (never on profiles) + `has_role()` security definer fn to avoid RLS recursion.
- Google OAuth via Lovable broker (`lovable.auth.signInWithOAuth("google")`) + `configure_social_auth`.
- File uploads (product images, avatars) → Supabase Storage bucket `product-images` (public read).
- Bearer attacher middleware in `src/start.ts` for protected server fns.

## Deliverable per phase

After each phase I'll pause so you can test before continuing. Phase 1 is the largest (schema + auth wiring); Phases 2 and 3 then plug into it.

**Confirm to proceed with Phase 1.**
