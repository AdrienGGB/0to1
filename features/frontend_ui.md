# Upgrade Frontend UI with **shadcn/ui** + Brand Colors — Step-by-step

Below is a concrete, developer-friendly step plan you can run through (or feed to a coding agent). Each step contains the exact commands and code snippets you’ll need. I include both App Router (`app/layout.tsx`) and Pages Router (`_app.tsx`) examples so you can adapt to your project.

---

## Prerequisites (do these first)

1. Node & Yarn: use a stable Node (>=18) and Yarn configured (if using Yarn v4/berry, ensure `corepack` is ready).
2. Project at repo root. Run:

   ```bash
   # from project root
   yarn install
   ```
3. Ensure Tailwind is installed and configured. If not:

   ```bash
   yarn add -D tailwindcss postcss autoprefixer
   npx tailwindcss init -p
   ```
4. If you hit the new PostCSS plugin issue, install the adapter:

   ```bash
   yarn add -D @tailwindcss/postcss
   # update postcss.config.js to use '@tailwindcss/postcss' plugin (see note below)
   ```

---

## Step 1 — Install & initialize shadcn-ui

```bash
# run at project root
npx shadcn-ui init
```

* Accept defaults; it will create `components/ui/` and add some base files.
* Choose `components` or `components/ui` if prompted (choose `components/ui` for this plan).

---

## Step 2 — Add the components you need

Add only what you will use to keep things tidy:

```bash
npx shadcn-ui add button card input form dialog tabs progress navigation-menu switch
```

This generates component wrapper files under `components/ui/` (e.g. `components/ui/button.tsx`), and updates index files.

---

## Step 3 — Add brand colors to Tailwind

Open `tailwind.config.js` and replace/extend the `theme.extend` block with this palette:

```js
// tailwind.config.js
module.exports = {
  darkMode: 'class', // enable class-based dark mode
  content: [
    "./app/**/*.{ts,tsx,js,jsx}",
    "./pages/**/*.{ts,tsx,js,jsx}",
    "./components/**/*.{ts,tsx,js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          indigoPurple: '#8B5CF6',
          blue: '#2563EB',
        },
        neutral: {
          background: '#F9FAFB',
          surface: '#FFFFFF',
          border: '#E5E7EB',
          textPrimary: '#111827',
          textSecondary: '#6B7280',
        },
        semantic: {
          success: '#10B981',
          warning: '#F97316',
          error:   '#EF4444',
          info:    '#60A5FA',
        },
        dark: {
          background: '#0B1020',
          surface:    '#0F172A',
          textPrimary:   '#E5E7EB',
          textSecondary: '#94A3B8',
        },
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #8B5CF6 0%, #2563EB 100%)',
      },
      borderRadius: {
        '2xl': '1rem',
      },
      boxShadow: {
        md: '0 8px 24px rgba(0,0,0,0.08)',
        lg: '0 12px 32px rgba(0,0,0,0.12)',
      },
    },
  },
  plugins: [],
}
```

> **Note about PostCSS:** If you use `postcss.config.js`, make sure it contains:

```js
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {}, // <- required if your Tailwind/PostCSS setup needs the new adapter
    autoprefixer: {},
  }
}
```

---

## Step 4 — Add global CSS and gradient usage

Open your `styles/globals.css` (or create if absent) and include Tailwind directives and any base token variables:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* optional CSS variables used by components */
:root{
  --brand-indigo: #8B5CF6;
  --brand-blue: #2563EB;
  --bg: #F9FAFB;
  --surface: #FFFFFF;
  --text-primary: #111827;
  --text-secondary: #6B7280;
}

/* subtle gradient overlay helper */
.bg-brand-hero {
  background-image: linear-gradient(135deg, rgba(139,92,246,0.08) 0%, rgba(37,99,235,0.08) 100%);
}
```

---

## Step 5 — Wrap root with theme provider and import UI styles

**If you use App Router (`/app/layout.tsx`)**:

```tsx
// app/layout.tsx
import './globals.css'
import { ThemeProvider } from 'next-themes' // optional for dark mode
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-neutral-background text-neutral-textPrimary">
        <ThemeProvider attribute="class">
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

**If you use Pages Router (`pages/_app.tsx`)**:

```tsx
// pages/_app.tsx
import '../styles/globals.css'
import { ThemeProvider } from 'next-themes'
export default function App({ Component, pageProps }) {
  return (
    <ThemeProvider attribute="class">
      <Component {...pageProps} />
    </ThemeProvider>
  )
}
```

**Install `next-themes`** if you want a toggle:

```bash
yarn add next-themes
```

---

## Step 6 — Replace UI page-by-page (recommended incremental approach)

Work page-by-page, replacing old markup with shadcn components. For each page:

**General pattern**

1. Find the target component (e.g., home course card).
2. Replace markup with `Card` + `Button` from `components/ui`.
3. Use utility classes from the design tokens (e.g., `bg-brand-indigoPurple`, `bg-brand-gradient`).

**Example — Hero with gradient (Home page)**

```tsx
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function HomeHero() {
  return (
    <section className="py-12 px-6 bg-brand-gradient text-white rounded-xl">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold">Instant AI Courses</h1>
        <p className="mt-2 text-lg">Create structured beginner courses in seconds.</p>
        <div className="mt-6">
          <Button className="bg-gradient-to-r from-brand-indigoPurple to-brand-blue">Get started</Button>
        </div>
      </div>
    </section>
  )
}
```

**Example — Course card (Home page)**

```tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

<Card className="p-6">
  <CardHeader>
    <CardTitle>Rust for Web Backends</CardTitle>
  </CardHeader>
  <CardContent>
    <p className="text-sm text-neutral-textSecondary">5 lessons • Beginner</p>
  </CardContent>
</Card>
```

**Course page** — use `Tabs` and `Progress`:

```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"

<Tabs defaultValue="lessons">
  <TabsList>
    <TabsTrigger value="lessons">Lessons</TabsTrigger>
    <TabsTrigger value="progress">Progress</TabsTrigger>
  </TabsList>

  <TabsContent value="lessons">
    {/* lesson list */}
  </TabsContent>

  <TabsContent value="progress">
    <Progress value={60} className="w-full" />
  </TabsContent>
</Tabs>
```

**Lesson page** — use `ScrollArea` and `Dialog` for quizzes:

```tsx
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog"

<ScrollArea className="h-[60vh]">
  {/* lesson markdown */}
</ScrollArea>

<Dialog>
  <DialogTrigger asChild><button className="btn">Open quiz</button></DialogTrigger>
  <DialogContent>{/* quiz UI */}</DialogContent>
</Dialog>
```

---

## Step 7 — Add a Dark Mode toggle

1. Add the `Switch` component from shadcn:

   ```bash
   npx shadcn-ui add switch
   ```
2. Example toggle UI (uses `next-themes`):

```tsx
import { useTheme } from 'next-themes'
import { Switch } from '@/components/ui/switch'

export function DarkModeToggle() {
  const { theme, setTheme } = useTheme()
  return (
    <Switch checked={theme === 'dark'} onCheckedChange={val => setTheme(val ? 'dark' : 'light')} />
  )
}
```

3. Ensure layout body class toggles (next-themes does this for you).

---

## Step 8 — Lint, type-check, build

Run the full dev and production checks:

```bash
yarn lint
yarn build
yarn dev
```

If build fails, examine stack trace — common issues:

* Missing `components/ui/...` files (generate with `npx shadcn-ui add <component>`).
* Path alias `@/` not configured in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@/*": ["./*"] }
  }
}
```

---

## Step 9 — Testing & visual QA

* Verify pages in desktop and mobile widths.
* Check hero gradient readability (contrast with text).
* Confirm progress bars, badges, alerts use semantic colors.
* Test dark-mode toggle and all component states (hover/focus/disabled).
* Accessibility: run Lighthouse & axe checks on primary pages.

---

## Step 10 — Cleanup & commit

* Remove orphan CSS files and old component code.
* Commit in small, reviewable chunks:

  * `feat(ui): add shadcn base components and Tailwind tokens`
  * `refactor(home): replace hero and course cards with shadcn components`
  * `feat(theme): add dark-mode toggle`
* Open PR and request visual review (screenshots compare).

---

## Acceptance Checklist (deliverables)

* [ ] `components/ui/` contains the shadcn components you added.
* [ ] `tailwind.config.js` updated with brand colors + `brand-gradient`.
* [ ] `globals.css` imports Tailwind and defines helper vars.
* [ ] Root layout wraps app in `ThemeProvider` and respects dark mode.
* [ ] Home, Course, Lesson, Auth pages replaced/refactored progressively to use shadcn components and brand colors.
* [ ] Dark mode toggle works and dark palette renders correctly.
* [ ] `yarn build` succeeds and `yarn dev` shows no runtime errors.

---

## Quick Troubleshooting

* **Missing component file**: `npx shadcn-ui add <component>` (e.g., `label`, `card`, `button`).
* **Alias not resolving**: update `tsconfig.json`/`jsconfig.json`.
* **Tailwind/PostCSS plugin error**: install `@tailwindcss/postcss` and update `postcss.config.js`.
* **Type errors from generated components**: ensure `@types/react` is installed and TypeScript config includes `jsx: react-jsx`.

---

If you want, I can:

* Generate the exact `app/layout.tsx` and a sample **Home** and **Course** page using the new components and color tokens, ready to paste into your repo. Which page should I produce first?
