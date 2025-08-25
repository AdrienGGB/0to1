# 🎨 Design System — AI Learning Platform (Option 2 Gradient)

This spec defines the **visual identity** (colors, gradients, typography, spacing, components, accessibility) for your AI-learning SaaS. Hand it to Gemini-CLI so all generated UI follows the same rules.

---

## 1) Brand principles

* **Simple & modern** (calm neutrals, generous whitespace)
* **Memorable** (purple→blue AI gradient as a signature)
* **Legible** (high contrast, friendly type scale)

---

## 2) Color palette

### Brand (primary)

* **Indigo/Purple 500**: `#8B5CF6`
* **Blue 600**: `#2563EB`
* **Gradient (signature)**: `linear-gradient(135deg, #8B5CF6 0%, #2563EB 100%)`

### Neutrals

* **Background**: `#F9FAFB`
* **Surface / Card**: `#FFFFFF`
* **Borders / Dividers**: `#E5E7EB`
* **Text / Primary**: `#111827`
* **Text / Secondary**: `#6B7280`

### Semantic accents

* **Success**: `#10B981`
* **Warning**: `#F97316`
* **Error**: `#EF4444`
* **Info**: `#60A5FA`

### Optional dark mode

* **Background**: `#0B1020`
* **Surface**: `#0F172A`
* **Text / Primary**: `#E5E7EB`
* **Text / Secondary**: `#94A3B8`

---

## 3) Tokens (name → hex)

**Core tokens**

* `color.primary.500` → `#8B5CF6`
* `color.primary.600` → `#2563EB`
* `color.bg` → `#F9FAFB`
* `color.surface` → `#FFFFFF`
* `color.text.primary` → `#111827`
* `color.text.secondary` → `#6B7280`
* `color.border` → `#E5E7EB`
* `color.success` → `#10B981`
* `color.warning` → `#F97316`
* `color.error` → `#EF4444`
* `color.info` → `#60A5FA`

**Gradient tokens**

* `gradient.primary` → `linear-gradient(135deg, #8B5CF6 0%, #2563EB 100%)`

---

## 4) Typography

**Families**

* Headings & body: `Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif`
* Code: `Fira Code, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`

**Scale**

* H1: 32–36px — `font-bold`
* H2: 24–28px — `font-semibold`
* H3: 20–22px — `font-medium`
* Body: 16px — `leading-relaxed`
* Small: 14px — `text-gray-600`

---

## 5) Spacing, radius, shadows

* **Spacing base**: 8px scale (Tailwind spacing)
* **Card padding**: 24px (`p-6`)
* **Section padding**: `py-12 px-6`
* **Radius**: `rounded-2xl` (cards, buttons)
* **Shadows**: `shadow-md` (default), `shadow-lg` (hover), none on focus-visible

---

## 6) Gradient usage (Option 2: Purple → Blue)

**Background hero / app shell (subtle overlay)**

```html
<div class="relative">
  <div class="absolute inset-0 opacity-15 pointer-events-none"
       style="background: linear-gradient(135deg, #8B5CF6 0%, #2563EB 100%);"></div>
  <!-- page content -->
</div>
```

**Primary CTA**

```html
<button class="inline-flex items-center rounded-2xl px-4 py-2 text-white shadow-md
               bg-gradient-to-r from-purple-500 to-blue-600 hover:shadow-lg active:opacity-90">
  Get started
</button>
```

**Progress / highlight bars**

```html
<div class="h-2 rounded-full bg-gray-200">
  <div class="h-2 rounded-full bg-gradient-to-r from-purple-500 to-blue-600" style="width: 60%;"></div>
</div>
```

---

## 7) Components (spec)

### Buttons

* **Primary**: gradient fill, white text, `rounded-2xl`, `shadow-md → hover:shadow-lg`
* **Secondary**: white bg, `border border-gray-200`, text `#111827`, `hover:bg-gray-50`
* **Destructive**: bg `#EF4444`, white text

States:

* **Hover**: elevate shadow, subtle scale (`transform hover:scale-[1.01]`)
* **Active**: reduce opacity to 90%
* **Disabled**: `bg-gray-200 text-gray-500 cursor-not-allowed`

### Cards

* White surface, `rounded-2xl`, `shadow-md`, padding `p-6`
* Header: `text-xl font-semibold`, subtext: `text-sm text-gray-600`

### Inputs

* `rounded-xl border border-gray-200 px-3 py-2`
* Focus: `ring-4 ring-blue-100 border-blue-500 outline-none`

### Callouts

* Success/Warning/Error/Info with left border (4px) using semantic colors
* Soft tinted background (8–12% opacity of the semantic color)

---

## 8) Accessibility

* Maintain **WCAG AA** (contrast ≥ 4.5:1 for body, 3:1 for large headings)
* Provide `:focus-visible` outlines (e.g., ring-blue-300)
* Ensure gradient backgrounds never reduce text contrast (use white/near-black text with shadow if needed)
* Interactive elements: ARIA labels and proper roles

---

## 9) Tailwind config (additions)

```js
// tailwind.config.js (excerpt)
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#8B5CF6',
          primaryBlue: '#2563EB',
          bg: '#F9FAFB',
          surface: '#FFFFFF',
          text: { primary: '#111827', secondary: '#6B7280' },
          border: '#E5E7EB',
          success: '#10B981',
          warning: '#F97316',
          error: '#EF4444',
          info: '#60A5FA',
        },
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #8B5CF6 0%, #2563EB 100%)',
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
};
```

---

## 10) Usage rules (for Gemini-CLI output)

* Prefer **white cards on neutral background**; reserve full gradient for hero/CTAs.
* Limit accent colors to **progress states** and **important highlights**.
* Always include hover/focus states on interactive elements.
* For dark mode, switch surface/background/text tokens; keep the **same gradient** for brand continuity.

---

## 11) Acceptance checklist

* Pages use **neutral background** + **white cards**; gradients only where specified
* CTAs use **purple→blue gradient**, readable text, and hover/active states
* Typography matches scale and families
* Callouts use semantic accent borders and tints
* All interactive elements meet **contrast & focus** requirements

---

If you want, I can also produce a small **`design-tokens.css`** (CSS variables) and a **`DesignTokens.ts`** file so Gemini can reference tokens programmatically.
