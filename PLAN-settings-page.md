# Settings Page Plan — IT Head Dashboard

## Overview
Create a WordPress-style settings page for the IT Head (and Super Admin) to manage all website content through the admin dashboard. Currently, all content is hardcoded in `.tsx`/`.ts` files as placeholders. The settings page will read/write to a database-backed key-value store and the frontend will consume it via API.

---

## Architecture

### Data Model: `site_settings` table
```
site_settings
├── id          UUID (PK)
├── section     VARCHAR(100)   — content group key (e.g. 'hero', 'stats', 'about')
├── value       TEXT           — JSON blob for the section
├── updated_by  UUID (FK → users)
├── updated_at  TIMESTAMPTZ
└── UNIQUE(section)
```

Each row stores one section's entire content as a JSON blob. Example:
- `hero` → `{"slides": [{image, kicker, title, description, cta}, ...]}`
- `stats` → `{"items": [{value, label, suffix}, ...]}`
- `about_vision` → `{"vision": "...", "mission": "..."}`

### API Endpoints
| Method | Path | Access | Description |
|--------|------|--------|-------------|
| GET | `/api/settings` | IT Head + Super Admin | Get all settings |
| GET | `/api/settings/:section` | IT Head + Super Admin | Get one section |
| PUT | `/api/settings/:section` | IT Head + Super Admin | Upsert a section |

### Frontend Route
- `/settings` — protected route, visible to `it_head` and `super_admin`

---

## Implementation Steps

### Step 1: Backend — Model & Schema
**Files:** `backend/app/models/__init__.py`, `backend/app/schemas/__init__.py`

- Add `SiteSetting` SQLAlchemy model to `models/__init__.py`
- Add `SiteSettingOut`, `SiteSettingUpdate` Pydantic schemas to `schemas/__init__.py`

### Step 2: Backend — API Route
**Files:** `backend/app/api/routes/settings.py` (new), `backend/app/main.py`

- Create `settings.py` with 3 endpoints (list all, get section, upsert section)
- Guard with `require_roles(RoleEnum.it_head, RoleEnum.super_admin)`
- Register router in `main.py`

### Step 3: Backend — Seed Default Content
**Files:** `backend/seed.py`

- Add function to populate `site_settings` with all current hardcoded content from frontend files
- Sections to seed: `hero`, `stats`, `who_we_are`, `values`, `programs`, `leadership_preview`, `testimonies`, `about`, `leadership`, `ministries`, `pensice`, `plc`, `cenacle`, `gallery`, `news`, `resources`, `contact`, `footer`

### Step 4: Frontend — API Service
**Files:** `frontend/src/services/api.ts`

- Add `settings` API client: `list()`, `get(section)`, `upsert(section, data)`

### Step 5: Frontend — Types
**Files:** `frontend/src/types/index.ts`

- Add TypeScript interfaces for all settings sections (HeroSlide, StatItem, CoreValue, Program, Testimony, MinistryData, LeadershipGroup, etc.)

### Step 6: Frontend — Settings Page Component
**Files:** `frontend/src/pages/SettingsPage.tsx` (new)

WordPress-style layout:
- **Left sidebar** with section tabs (Hero Slides, Stats, Who We Are, Values, Programs, Leadership, Testimonies, About, Leadership Directory, Ministries, Communities, Gallery, News, Resources, Contact, Footer)
- **Main content area** renders the active section's form
- Each section form has appropriate inputs:
  - Text fields for titles, descriptions, kicker text
  - Textarea for long content (body paragraphs, vision, mission)
  - Number inputs for stat values
  - Image URL inputs for photos
  - Repeatable group forms for slides, members, timeline entries
  - Add/remove buttons for list items (testimonies, news articles, resources)
- Save button per section that calls `PUT /api/settings/:section`
- Loading skeleton while fetching, success/error toasts on save

### Step 7: Frontend — Route & Navigation
**Files:** `frontend/src/App.tsx`, `frontend/src/components/layout/Sidebar.tsx`, `frontend/src/components/layout/Header.tsx`, `frontend/src/lib/permissions.ts`

- Add `canManageSettings` permission function (IT Head + Super Admin)
- Add `Settings` nav item to Sidebar with `GearSix` icon, visible per permission
- Add `/settings` route in App.tsx with permission guard
- Add `'Settings'` to Header title map

### Step 8: Frontend — Update Public Pages to Use Settings
**Files:** All landing components + public pages

Refactor each component to fetch content from `/api/settings/:section` instead of hardcoded arrays:

| Component | Current Source | Settings Key |
|-----------|---------------|--------------|
| `Hero.tsx` | `SLIDES` array | `hero` |
| `Stats.tsx` | `STATS` array | `stats` |
| `WhoWeAre.tsx` | inline text | `who_we_are` |
| `Values.tsx` | inline array | `values` |
| `Programs.tsx` | inline array | `programs` |
| `Leadership.tsx` (landing) | inline array | `leadership_preview` |
| `Testimony.tsx` | `TESTIMONIES` array | `testimonies` |
| `About.tsx` | `TIMELINE`, `FAITH_POINTS`, inline text | `about` |
| `Leadership.tsx` (page) | `LEADERSHIP_GROUPS` | `leadership` |
| `MinistriesPage.tsx` + `data/ministries.tsx` | `MINISTRIES` | `ministries` |
| `Pensice.tsx` | inline text + photos | `pensice` |
| `PLC.tsx` | inline text + photos | `plc` |
| `Cenacle.tsx` | inline text + photos | `cenacle` |
| `Gallery.tsx` | `PHOTOS` array | `gallery` |
| `NewsEvents.tsx` + `data/news.ts` | `NEWS` array | `news` |
| `Resources.tsx` | `SECTIONS` array | `resources` |
| `Contact.tsx` | `CONTACT_DETAILS` | `contact` |
| `LandingFooter.tsx` | inline text + links | `footer` |

**Strategy:** Create a `useSectionData<T>(sectionKey, fallback)` hook that:
1. Tries to fetch from API on mount
2. Falls back to current hardcoded defaults if API fails or no data exists
3. Returns `{ data, loading }` 

This ensures the site works even before the settings are seeded.

---

## Settings Page Sections (UI)

### 1. Hero Slides
- 4 slide cards, each with: image URL, kicker text, title (2 parts), description, CTA label + href, secondary CTA label + href
- Add/remove slides

### 2. Stats
- 4 stat items, each with: value (number), label, suffix
- Add/remove items

### 3. Who We Are
- Section kicker, heading, body paragraph, CTA label, image URL, image alt text

### 4. Core Values
- 3 values, each with: title, body
- Section kicker, heading
- Add/remove values

### 5. Programs
- 4 programs, each with: image URL, title, meta (time)
- Section kicker, heading
- Add/remove programs

### 6. Leadership Preview (Landing)
- 3 leader cards, each with: name, role, initials, photo URL, profile, favorite quote
- Section kicker, heading, CTA label

### 7. Testimonies
- 3 testimonies, each with: quote, cite (name + level/department)
- Section kicker, heading
- Add/remove testimonies

### 8. About Page
- Body text (2 paragraphs), image URL
- Timeline entries (year + body) — add/remove
- Vision statement, Mission statement
- Statement of faith intro, faith points — add/remove

### 9. Leadership Directory
- 5 groups, each with: title, description, accent color
- Members per group (role, name, photo URL) — add/remove members and groups

### 10. Ministries
- 6 ministries, each with: title, body, mainLeader, assistantLeader, keyActivities, meetingPlace, contact, image1, image2
- Add/remove ministries

### 11. Communities (PENCISE, PLC, Cenacle)
- Tabs for each community
- Each has: kicker, title, description, body paragraphs, image URL, gallery photos array

### 12. Gallery
- Photo items: src, alt
- Add/remove photos

### 13. News & Events
- Articles: slug, image, meta, title, body, content paragraphs
- Add/remove articles

### 14. Resources
- 3 sections, each with: title, description
- Items per section: title, description, fileSize
- Add/remove sections and items

### 15. Contact Info
- Address, phone, email
- Page header: kicker, title, description

### 16. Footer
- Brand heading, brand description
- Social links (Facebook, Instagram, YouTube URLs)
- Explore links array
- Contact info (address, phone, email)

---

## File Summary

| File | Action |
|------|--------|
| `backend/app/models/__init__.py` | Edit — add `SiteSetting` model |
| `backend/app/schemas/__init__.py` | Edit — add settings schemas |
| `backend/app/api/routes/settings.py` | **New** — settings CRUD routes |
| `backend/app/main.py` | Edit — register settings router |
| `backend/seed.py` | Edit — add settings seed data |
| `frontend/src/services/api.ts` | Edit — add settings API client |
| `frontend/src/types/index.ts` | Edit — add settings types |
| `frontend/src/pages/SettingsPage.tsx` | **New** — main settings page |
| `frontend/src/lib/permissions.ts` | Edit — add `canManageSettings` |
| `frontend/src/components/layout/Sidebar.tsx` | Edit — add Settings nav item |
| `frontend/src/components/layout/Header.tsx` | Edit — add Settings title |
| `frontend/src/App.tsx` | Edit — add /settings route |
| `frontend/src/components/landing/Hero.tsx` | Edit — use settings data |
| `frontend/src/components/landing/Stats.tsx` | Edit — use settings data |
| `frontend/src/components/landing/WhoWeAre.tsx` | Edit — use settings data |
| `frontend/src/components/landing/Values.tsx` | Edit — use settings data |
| `frontend/src/components/landing/Programs.tsx` | Edit — use settings data |
| `frontend/src/components/landing/Leadership.tsx` | Edit — use settings data |
| `frontend/src/components/landing/Testimony.tsx` | Edit — use settings data |
| `frontend/src/components/landing/LandingFooter.tsx` | Edit — use settings data |
| `frontend/src/pages/About.tsx` | Edit — use settings data |
| `frontend/src/pages/Leadership.tsx` | Edit — use settings data |
| `frontend/src/pages/MinistriesPage.tsx` | Edit — use settings data |
| `frontend/src/pages/Pensice.tsx` | Edit — use settings data |
| `frontend/src/pages/PLC.tsx` | Edit — use settings data |
| `frontend/src/pages/Cenacle.tsx` | Edit — use settings data |
| `frontend/src/pages/Gallery.tsx` | Edit — use settings data |
| `frontend/src/pages/NewsEvents.tsx` | Edit — use settings data |
| `frontend/src/pages/NewsDetail.tsx` | Edit — use settings data |
| `frontend/src/pages/Resources.tsx` | Edit — use settings data |
| `frontend/src/pages/Contact.tsx` | Edit — use settings data |

---

## Verification
1. Run `npm run build` (frontend) — no TypeScript errors
2. Run backend server — verify `/api/settings` endpoints respond correctly
3. Login as IT Head → Sidebar shows Settings link → page loads with forms
4. Edit a section (e.g., Hero slide title) → save → visit public homepage → content updated
5. Login as Super Admin → same access
6. Login as other roles → Settings link hidden, `/settings` redirects to `/dashboard`
