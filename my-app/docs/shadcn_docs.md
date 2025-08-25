---
title: Next.js
description: Install and configure shadcn/ui for Next.js.
---

<Steps>

### Create project

Run the `init` command to create a new Next.js project or to setup an existing one:

```bash
npx shadcn@latest init
```

Choose between a Next.js project or a Monorepo.

### Add Components

You can now start adding components to your project.

```bash
npx shadcn@latest add button
```

The command above will add the `Button` component to your project. You can then import it like this:

```tsx {1,6} showLineNumbers title="app/page.tsx"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div>
      <Button>Click me</Button>
    </div>
  )
}
```

</Steps>
---
title: components.json
description: Configuration for your project.
---

The `components.json` file holds configuration for your project.

We use it to understand how your project is set up and how to generate components customized for your project.

<Callout className="mt-6" title="Note: The `components.json` file is optional">
  It is **only required if you're using the CLI** to add components to your
  project. If you're using the copy and paste method, you don't need this file.
</Callout>

You can create a `components.json` file in your project by running the following command:

```bash
npx shadcn@latest init
```

See the <Link href="/docs/cli">CLI section</Link> for more information.

## $schema

You can see the JSON Schema for `components.json` [here](https://ui.shadcn.com/schema.json).

```json title="components.json"
{
  "$schema": "https://ui.shadcn.com/schema.json"
}
```

## style

The style for your components. **This cannot be changed after initialization.**

```json title="components.json"
{
  "style": "new-york"
}
```

The `default` style has been deprecated. Use the `new-york` style instead.

## tailwind

Configuration to help the CLI understand how Tailwind CSS is set up in your project.

See the <Link href="/docs/installation">installation section</Link> for how to set up Tailwind CSS.

### tailwind.config

Path to where your `tailwind.config.js` file is located. **For Tailwind CSS v4, leave this blank.**

```json title="components.json"
{
  "tailwind": {
    "config": "tailwind.config.js" | "tailwind.config.ts"
  }
}
```

### tailwind.css

Path to the CSS file that imports Tailwind CSS into your project.

```json title="components.json"
{
  "tailwind": {
    "css": "styles/global.css"
  }
}
```

### tailwind.baseColor

This is used to generate the default color palette for your components. **This cannot be changed after initialization.**

```json title="components.json"
{
  "tailwind": {
    "baseColor": "gray" | "neutral" | "slate" | "stone" | "zinc"
  }
}
```

### tailwind.cssVariables

You can choose between using CSS variables or Tailwind CSS utility classes for theming.

To use utility classes for theming set `tailwind.cssVariables` to `false`. For CSS variables, set `tailwind.cssVariables` to `true`.

```json title="components.json"
{
  "tailwind": {
    "cssVariables": `true` | `false`
  }
}
```

For more information, see the <Link href="/docs/theming">theming docs</Link>.

**This cannot be changed after initialization.** To switch between CSS variables and utility classes, you'll have to delete and re-install your components.

### tailwind.prefix

The prefix to use for your Tailwind CSS utility classes. Components will be added with this prefix.

```json title="components.json"
{
  "tailwind": {
    "prefix": "tw-"
  }
}
```

## rsc

Whether or not to enable support for React Server Components.

The CLI automatically adds a `use client` directive to client components when set to `true`.

```json title="components.json"
{
  "rsc": `true` | `false`
}
```

## tsx

Choose between TypeScript or JavaScript components.

Setting this option to `false` allows components to be added as JavaScript with the `.jsx` file extension.

```json title="components.json"
{
  "tsx": `true` | `false`
}
```

## aliases

The CLI uses these values and the `paths` config from your `tsconfig.json` or `jsconfig.json` file to place generated components in the correct location.

Path aliases have to be set up in your `tsconfig.json` or `jsconfig.json` file.

<Callout className="mt-6">
  **Important:** If you're using the `src` directory, make sure it is included
  under `paths` in your `tsconfig.json` or `jsconfig.json` file.
</Callout>

### aliases.utils

Import alias for your utility functions.

```json title="components.json"
{
  "aliases": {
    "utils": "@/lib/utils"
  }
}
```

### aliases.components

Import alias for your components.

```json title="components.json"
{
  "aliases": {
    "components": "@/components"
  }
}
```

### aliases.ui

Import alias for `ui` components.

The CLI will use the `aliases.ui` value to determine where to place your `ui` components. Use this config if you want to customize the installation directory for your `ui` components.

```json title="components.json"
{
  "aliases": {
    "ui": "@/app/ui"
  }
}
```

### aliases.lib

Import alias for `lib` functions such as `format-date` or `generate-id`.

```json title="components.json"
{
  "aliases": {
    "lib": "@/lib"
  }
}
```

### aliases.hooks

Import alias for `hooks` such as `use-media-query` or `use-toast`.

```json title="components.json"
{
  "aliases": {
    "hooks": "@/hooks"
  }
}
```
---
title: Theming
description: Using CSS Variables and color utilities for theming.
---

You can choose between using CSS variables (recommended) or utility classes for theming.

## CSS Variables

```tsx /bg-background/ /text-foreground/
<div className="bg-background text-foreground" />
```

To use CSS variables for theming set `tailwind.cssVariables` to `true` in your `components.json` file.

```json {8} title="components.json" showLineNumbers
{
  "style": "default",
  "rsc": true,
  "tailwind": {
    "config": "",
    "css": "app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "iconLibrary": "lucide"
}
```

## Utility classes

```tsx /bg-zinc-950/ /text-zinc-50/ /dark:bg-white/ /dark:text-zinc-950/
<div className="bg-zinc-950 dark:bg-white" />
```

To use utility classes for theming set `tailwind.cssVariables` to `false` in your `components.json` file.

```json {8} title="components.json" showLineNumbers
{
  "style": "default",
  "rsc": true,
  "tailwind": {
    "config": "",
    "css": "app/globals.css",
    "baseColor": "neutral",
    "cssVariables": false
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "iconLibrary": "lucide"
}
```

## Convention

We use a simple `background` and `foreground` convention for colors. The `background` variable is used for the background color of the component and the `foreground` variable is used for the text color.

<Callout className="mt-4">

The `background` suffix is omitted when the variable is used for the background color of the component.

</Callout>

Given the following CSS variables:

```css
--primary: oklch(0.205 0 0);
--primary-foreground: oklch(0.985 0 0);
```

The `background` color of the following component will be `var(--primary)` and the `foreground` color will be `var(--primary-foreground)`.

```tsx
<div className="bg-primary text-primary-foreground">Hello</div>
```

## List of variables

Here's the list of variables available for customization:

```css title="app/globals.css" showLineNumbers
:root {
  --radius: 0.625rem;
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.97 0 0);
  --secondary-foreground: oklch(0.205 0 0);
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0 0);
  --accent: oklch(0.97 0 0);
  --accent-foreground: oklch(0.205 0 0);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.922 0 0);
  --input: oklch(0.922 0 0);
  --ring: oklch(0.708 0 0);
  --chart-1: oklch(0.646 0.222 41.116);
  --chart-2: oklch(0.6 0.118 184.704);
  --chart-3: oklch(0.398 0.07 227.392);
  --chart-4: oklch(0.828 0.189 84.429);
  --chart-5: oklch(0.769 0.188 70.08);
  --sidebar: oklch(0.985 0 0);
  --sidebar-foreground: oklch(0.145 0 0);
  --sidebar-primary: oklch(0.205 0 0);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.97 0 0);
  --sidebar-accent-foreground: oklch(0.205 0 0);
  --sidebar-border: oklch(0.922 0 0);
  --sidebar-ring: oklch(0.708 0 0);
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.205 0 0);
  --card-foreground: oklch(0.985 0 0);
  --popover: oklch(0.269 0 0);
  --popover-foreground: oklch(0.985 0 0);
  --primary: oklch(0.922 0 0);
  --primary-foreground: oklch(0.205 0 0);
  --secondary: oklch(0.269 0 0);
  --secondary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.269 0 0);
  --muted-foreground: oklch(0.708 0 0);
  --accent: oklch(0.371 0 0);
  --accent-foreground: oklch(0.985 0 0);
  --destructive: oklch(0.704 0.191 22.216);
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(0.556 0 0);
  --chart-1: oklch(0.488 0.243 264.376);
  --chart-2: oklch(0.696 0.17 162.48);
  --chart-3: oklch(0.769 0.188 70.08);
  --chart-4: oklch(0.627 0.265 303.9);
  --chart-5: oklch(0.645 0.246 16.439);
  --sidebar: oklch(0.205 0 0);
  --sidebar-foreground: oklch(0.985 0 0);
  --sidebar-primary: oklch(0.488 0.243 264.376);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.269 0 0);
  --sidebar-accent-foreground: oklch(0.985 0 0);
  --sidebar-border: oklch(1 0 0 / 10%);
  --sidebar-ring: oklch(0.439 0 0);
}
```

## Adding new colors

To add new colors, you need to add them to your CSS file and to your `tailwind.config.js` file.

```css title="app/globals.css" showLineNumbers
:root {
  --warning: oklch(0.84 0.16 84);
  --warning-foreground: oklch(0.28 0.07 46);
}

.dark {
  --warning: oklch(0.41 0.11 46);
  --warning-foreground: oklch(0.99 0.02 95);
}

@theme inline {
  --color-warning: var(--warning);
  --color-warning-foreground: var(--warning-foreground);
}
```

You can now use the `warning` utility class in your components.

```tsx /bg-warning/ /text-warning-foreground/
<div className="bg-warning text-warning-foreground" />
```

## Other color formats

See the [Tailwind CSS documentation](https://tailwindcss.com/docs/colors) for more information on using colors in Tailwind CSS.

## Base Colors

For reference, here's a list of the base colors that are available.

### Neutral

<CodeCollapsibleWrapper>

```css title="app/globals.css" showLineNumbers
:root {
  --radius: 0.625rem;
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.97 0 0);
  --secondary-foreground: oklch(0.205 0 0);
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0 0);
  --accent: oklch(0.97 0 0);
  --accent-foreground: oklch(0.205 0 0);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.922 0 0);
  --input: oklch(0.922 0 0);
  --ring: oklch(0.708 0 0);
  --chart-1: oklch(0.646 0.222 41.116);
  --chart-2: oklch(0.6 0.118 184.704);
  --chart-3: oklch(0.398 0.07 227.392);
  --chart-4: oklch(0.828 0.189 84.429);
  --chart-5: oklch(0.769 0.188 70.08);
  --sidebar: oklch(0.985 0 0);
  --sidebar-foreground: oklch(0.145 0 0);
  --sidebar-primary: oklch(0.205 0 0);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.97 0 0);
  --sidebar-accent-foreground: oklch(0.205 0 0);
  --sidebar-border: oklch(0.922 0 0);
  --sidebar-ring: oklch(0.708 0 0);
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.205 0 0);
  --card-foreground: oklch(0.985 0 0);
  --popover: oklch(0.205 0 0);
  --popover-foreground: oklch(0.985 0 0);
  --primary: oklch(0.922 0 0);
  --primary-foreground: oklch(0.205 0 0);
  --secondary: oklch(0.269 0 0);
  --secondary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.269 0 0);
  --muted-foreground: oklch(0.708 0 0);
  --accent: oklch(0.269 0 0);
  --accent-foreground: oklch(0.985 0 0);
  --destructive: oklch(0.704 0.191 22.216);
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(0.556 0 0);
  --chart-1: oklch(0.488 0.243 264.376);
  --chart-2: oklch(0.696 0.17 162.48);
  --chart-3: oklch(0.769 0.188 70.08);
  --chart-4: oklch(0.627 0.265 303.9);
  --chart-5: oklch(0.645 0.246 16.439);
  --sidebar: oklch(0.205 0 0);
  --sidebar-foreground: oklch(0.985 0 0);
  --sidebar-primary: oklch(0.488 0.243 264.376);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.269 0 0);
  --sidebar-accent-foreground: oklch(0.985 0 0);
  --sidebar-border: oklch(1 0 0 / 10%);
  --sidebar-ring: oklch(0.556 0 0);
}
```

</CodeCollapsibleWrapper>

### Stone

<CodeCollapsibleWrapper>

```css title="app/globals.css" showLineNumbers
:root {
  --radius: 0.625rem;
  --background: oklch(1 0 0);
  --foreground: oklch(0.147 0.004 49.25);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.147 0.004 49.25);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.147 0.004 49.25);
  --primary: oklch(0.216 0.006 56.043);
  --primary-foreground: oklch(0.985 0.001 106.423);
  --secondary: oklch(0.97 0.001 106.424);
  --secondary-foreground: oklch(0.216 0.006 56.043);
  --muted: oklch(0.97 0.001 106.424);
  --muted-foreground: oklch(0.553 0.013 58.071);
  --accent: oklch(0.97 0.001 106.424);
  --accent-foreground: oklch(0.216 0.006 56.043);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.923 0.003 48.717);
  --input: oklch(0.923 0.003 48.717);
  --ring: oklch(0.709 0.01 56.259);
  --chart-1: oklch(0.646 0.222 41.116);
  --chart-2: oklch(0.6 0.118 184.704);
  --chart-3: oklch(0.398 0.07 227.392);
  --chart-4: oklch(0.828 0.189 84.429);
  --chart-5: oklch(0.769 0.188 70.08);
  --sidebar: oklch(0.985 0.001 106.423);
  --sidebar-foreground: oklch(0.147 0.004 49.25);
  --sidebar-primary: oklch(0.216 0.006 56.043);
  --sidebar-primary-foreground: oklch(0.985 0.001 106.423);
  --sidebar-accent: oklch(0.97 0.001 106.424);
  --sidebar-accent-foreground: oklch(0.216 0.006 56.043);
  --sidebar-border: oklch(0.923 0.003 48.717);
  --sidebar-ring: oklch(0.709 0.01 56.259);
}

.dark {
  --background: oklch(0.147 0.004 49.25);
  --foreground: oklch(0.985 0.001 106.423);
  --card: oklch(0.216 0.006 56.043);
  --card-foreground: oklch(0.985 0.001 106.423);
  --popover: oklch(0.216 0.006 56.043);
  --popover-foreground: oklch(0.985 0.001 106.423);
  --primary: oklch(0.923 0.003 48.717);
  --primary-foreground: oklch(0.216 0.006 56.043);
  --secondary: oklch(0.268 0.007 34.298);
  --secondary-foreground: oklch(0.985 0.001 106.423);
  --muted: oklch(0.268 0.007 34.298);
  --muted-foreground: oklch(0.709 0.01 56.259);
  --accent: oklch(0.268 0.007 34.298);
  --accent-foreground: oklch(0.985 0.001 106.423);
  --destructive: oklch(0.704 0.191 22.216);
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(0.553 0.013 58.071);
  --chart-1: oklch(0.488 0.243 264.376);
  --chart-2: oklch(0.696 0.17 162.48);
  --chart-3: oklch(0.769 0.188 70.08);
  --chart-4: oklch(0.627 0.265 303.9);
  --chart-5: oklch(0.645 0.246 16.439);
  --sidebar: oklch(0.216 0.006 56.043);
  --sidebar-foreground: oklch(0.985 0.001 106.423);
  --sidebar-primary: oklch(0.488 0.243 264.376);
  --sidebar-primary-foreground: oklch(0.985 0.001 106.423);
  --sidebar-accent: oklch(0.268 0.007 34.298);
  --sidebar-accent-foreground: oklch(0.985 0.001 106.423);
  --sidebar-border: oklch(1 0 0 / 10%);
  --sidebar-ring: oklch(0.553 0.013 58.071);
}
```

</CodeCollapsibleWrapper>

### Zinc

<CodeCollapsibleWrapper>

```css title="app/globals.css" showLineNumbers
:root {
  --radius: 0.625rem;
  --background: oklch(1 0 0);
  --foreground: oklch(0.141 0.005 285.823);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.141 0.005 285.823);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.141 0.005 285.823);
  --primary: oklch(0.21 0.006 285.885);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.967 0.001 286.375);
  --secondary-foreground: oklch(0.21 0.006 285.885);
  --muted: oklch(0.967 0.001 286.375);
  --muted-foreground: oklch(0.552 0.016 285.938);
  --accent: oklch(0.967 0.001 286.375);
  --accent-foreground: oklch(0.21 0.006 285.885);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.92 0.004 286.32);
  --input: oklch(0.92 0.004 286.32);
  --ring: oklch(0.705 0.015 286.067);
  --chart-1: oklch(0.646 0.222 41.116);
  --chart-2: oklch(0.6 0.118 184.704);
  --chart-3: oklch(0.398 0.07 227.392);
  --chart-4: oklch(0.828 0.189 84.429);
  --chart-5: oklch(0.769 0.188 70.08);
  --sidebar: oklch(0.985 0 0);
  --sidebar-foreground: oklch(0.141 0.005 285.823);
  --sidebar-primary: oklch(0.21 0.006 285.885);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.967 0.001 286.375);
  --sidebar-accent-foreground: oklch(0.21 0.006 285.885);
  --sidebar-border: oklch(0.92 0.004 286.32);
  --sidebar-ring: oklch(0.705 0.015 286.067);
}

.dark {
  --background: oklch(0.141 0.005 285.823);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.21 0.006 285.885);
  --card-foreground: oklch(0.985 0 0);
  --popover: oklch(0.21 0.006 285.885);
  --popover-foreground: oklch(0.985 0 0);
  --primary: oklch(0.92 0.004 286.32);
  --primary-foreground: oklch(0.21 0.006 285.885);
  --secondary: oklch(0.274 0.006 286.033);
  --secondary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.274 0.006 286.033);
  --muted-foreground: oklch(0.705 0.015 286.067);
  --accent: oklch(0.274 0.006 286.033);
  --accent-foreground: oklch(0.985 0 0);
  --destructive: oklch(0.704 0.191 22.216);
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(0.552 0.016 285.938);
  --chart-1: oklch(0.488 0.243 264.376);
  --chart-2: oklch(0.696 0.17 162.48);
  --chart-3: oklch(0.769 0.188 70.08);
  --chart-4: oklch(0.627 0.265 303.9);
  --chart-5: oklch(0.645 0.246 16.439);
  --sidebar: oklch(0.21 0.006 285.885);
  --sidebar-foreground: oklch(0.985 0 0);
  --sidebar-primary: oklch(0.488 0.243 264.376);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.274 0.006 286.033);
  --sidebar-accent-foreground: oklch(0.985 0 0);
  --sidebar-border: oklch(1 0 0 / 10%);
  --sidebar-ring: oklch(0.552 0.016 285.938);
}
```

</CodeCollapsibleWrapper>

### Gray

<CodeCollapsibleWrapper>

```css title="app/globals.css" showLineNumbers
:root {
  --radius: 0.625rem;
  --background: oklch(1 0 0);
  --foreground: oklch(0.13 0.028 261.692);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.13 0.028 261.692);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.13 0.028 261.692);
  --primary: oklch(0.21 0.034 264.665);
  --primary-foreground: oklch(0.985 0.002 247.839);
  --secondary: oklch(0.967 0.003 264.542);
  --secondary-foreground: oklch(0.21 0.034 264.665);
  --muted: oklch(0.967 0.003 264.542);
  --muted-foreground: oklch(0.551 0.027 264.364);
  --accent: oklch(0.967 0.003 264.542);
  --accent-foreground: oklch(0.21 0.034 264.665);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.928 0.006 264.531);
  --input: oklch(0.928 0.006 264.531);
  --ring: oklch(0.707 0.022 261.325);
  --chart-1: oklch(0.646 0.222 41.116);
  --chart-2: oklch(0.6 0.118 184.704);
  --chart-3: oklch(0.398 0.07 227.392);
  --chart-4: oklch(0.828 0.189 84.429);
  --chart-5: oklch(0.769 0.188 70.08);
  --sidebar: oklch(0.985 0.002 247.839);
  --sidebar-foreground: oklch(0.13 0.028 261.692);
  --sidebar-primary: oklch(0.21 0.034 264.665);
  --sidebar-primary-foreground: oklch(0.985 0.002 247.839);
  --sidebar-accent: oklch(0.967 0.003 264.542);
  --sidebar-accent-foreground: oklch(0.21 0.034 264.665);
  --sidebar-border: oklch(0.928 0.006 264.531);
  --sidebar-ring: oklch(0.707 0.022 261.325);
}

.dark {
  --background: oklch(0.13 0.028 261.692);
  --foreground: oklch(0.985 0.002 247.839);
  --card: oklch(0.21 0.034 264.665);
  --card-foreground: oklch(0.985 0.002 247.839);
  --popover: oklch(0.21 0.034 264.665);
  --popover-foreground: oklch(0.985 0.002 247.839);
  --primary: oklch(0.928 0.006 264.531);
  --primary-foreground: oklch(0.21 0.034 264.665);
  --secondary: oklch(0.278 0.033 256.848);
  --secondary-foreground: oklch(0.985 0.002 247.839);
  --muted: oklch(0.278 0.033 256.848);
  --muted-foreground: oklch(0.707 0.022 261.325);
  --accent: oklch(0.278 0.033 256.848);
  --accent-foreground: oklch(0.985 0.002 247.839);
  --destructive: oklch(0.704 0.191 22.216);
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(0.551 0.027 264.364);
  --chart-1: oklch(0.488 0.243 264.376);
  --chart-2: oklch(0.696 0.17 162.48);
  --chart-3: oklch(0.769 0.188 70.08);
  --chart-4: oklch(0.627 0.265 303.9);
  --chart-5: oklch(0.645 0.246 16.439);
  --sidebar: oklch(0.21 0.034 264.665);
  --sidebar-foreground: oklch(0.985 0.002 247.839);
  --sidebar-primary: oklch(0.488 0.243 264.376);
  --sidebar-primary-foreground: oklch(0.985 0.002 247.839);
  --sidebar-accent: oklch(0.278 0.033 256.848);
  --sidebar-accent-foreground: oklch(0.985 0.002 247.839);
  --sidebar-border: oklch(1 0 0 / 10%);
  --sidebar-ring: oklch(0.551 0.027 264.364);
}
```

</CodeCollapsibleWrapper>

### Slate

<CodeCollapsibleWrapper>

```css title="app/globals.css" showLineNumbers
:root {
  --radius: 0.625rem;
  --background: oklch(1 0 0);
  --foreground: oklch(0.129 0.042 264.695);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.129 0.042 264.695);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.129 0.042 264.695);
  --primary: oklch(0.208 0.042 265.755);
  --primary-foreground: oklch(0.984 0.003 247.858);
  --secondary: oklch(0.968 0.007 247.896);
  --secondary-foreground: oklch(0.208 0.042 265.755);
  --muted: oklch(0.968 0.007 247.896);
  --muted-foreground: oklch(0.554 0.046 257.417);
  --accent: oklch(0.968 0.007 247.896);
  --accent-foreground: oklch(0.208 0.042 265.755);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.929 0.013 255.508);
  --input: oklch(0.929 0.013 255.508);
  --ring: oklch(0.704 0.04 256.788);
  --chart-1: oklch(0.646 0.222 41.116);
  --chart-2: oklch(0.6 0.118 184.704);
  --chart-3: oklch(0.398 0.07 227.392);
  --chart-4: oklch(0.828 0.189 84.429);
  --chart-5: oklch(0.769 0.188 70.08);
  --sidebar: oklch(0.984 0.003 247.858);
  --sidebar-foreground: oklch(0.129 0.042 264.695);
  --sidebar-primary: oklch(0.208 0.042 265.755);
  --sidebar-primary-foreground: oklch(0.984 0.003 247.858);
  --sidebar-accent: oklch(0.968 0.007 247.896);
  --sidebar-accent-foreground: oklch(0.208 0.042 265.755);
  --sidebar-border: oklch(0.929 0.013 255.508);
  --sidebar-ring: oklch(0.704 0.04 256.788);
}

.dark {
  --background: oklch(0.129 0.042 264.695);
  --foreground: oklch(0.984 0.003 247.858);
  --card: oklch(0.208 0.042 265.755);
  --card-foreground: oklch(0.984 0.003 247.858);
  --popover: oklch(0.208 0.042 265.755);
  --popover-foreground: oklch(0.984 0.003 247.858);
  --primary: oklch(0.929 0.013 255.508);
  --primary-foreground: oklch(0.208 0.042 265.755);
  --secondary: oklch(0.279 0.041 260.031);
  --secondary-foreground: oklch(0.984 0.003 247.858);
  --muted: oklch(0.279 0.041 260.031);
  --muted-foreground: oklch(0.704 0.04 256.788);
  --accent: oklch(0.279 0.041 260.031);
  --accent-foreground: oklch(0.984 0.003 247.858);
  --destructive: oklch(0.704 0.191 22.216);
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(0.551 0.027 264.364);
  --chart-1: oklch(0.488 0.243 264.376);
  --chart-2: oklch(0.696 0.17 162.48);
  --chart-3: oklch(0.769 0.188 70.08);
  --chart-4: oklch(0.627 0.265 303.9);
  --chart-5: oklch(0.645 0.246 16.439);
  --sidebar: oklch(0.208 0.042 265.755);
  --sidebar-foreground: oklch(0.984 0.003 247.858);
  --sidebar-primary: oklch(0.488 0.243 264.376);
  --sidebar-primary-foreground: oklch(0.984 0.003 247.858);
  --sidebar-accent: oklch(0.279 0.041 260.031);
  --sidebar-accent-foreground: oklch(0.984 0.003 247.858);
  --sidebar-border: oklch(1 0 0 / 10%);
  --sidebar-ring: oklch(0.551 0.027 264.364);
}
```

</CodeCollapsibleWrapper>
---
title: Next.js
description: Adding dark mode to your next app.
---

<Steps>

## Install next-themes

Start by installing `next-themes`:

```bash
npm install next-themes
```

## Create a theme provider

```tsx title="components/theme-provider.tsx" showLineNumbers
"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
```

## Wrap your root layout

Add the `ThemeProvider` to your root layout and add the `suppressHydrationWarning` prop to the `html` tag.

```tsx {1,6,9-14,16} title="app/layout.tsx" showLineNumbers
import { ThemeProvider } from "@/components/theme-provider"

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <>
      <html lang="en" suppressHydrationWarning>
        <head />
        <body>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </body>
      </html>
    </>
  )
}
```

## Add a mode toggle

Place a mode toggle on your site to toggle between light and dark mode.

<ComponentPreview name="mode-toggle" className="[&_.preview]:items-start" />

</Steps>
---
title: shadcn
description: Use the shadcn CLI to add components to your project.
---

## init

Use the `init` command to initialize configuration and dependencies for a new project.

The `init` command installs dependencies, adds the `cn` util and configures CSS variables for the project.

```bash
npx shadcn@latest init
```

### Options

```bash
Usage: shadcn init [options] [components...]

initialize your project and install dependencies

Arguments:
  components         name, url or local path to component

Options:
  -t, --template <template>      the template to use. (next, next-monorepo)
  -b, --base-color <base-color>  the base color to use. (neutral, gray, zinc, stone, slate)
  -y, --yes                      skip confirmation prompt. (default: true)
  -f, --force                    force overwrite of existing configuration. (default: false)
  -c, --cwd <cwd>                the working directory. defaults to the current directory.
  -s, --silent                   mute output. (default: false)
  --src-dir                      use the src directory when creating a new project. (default: false)
  --no-src-dir                   do not use the src directory when creating a new project.
  --css-variables                use css variables for theming. (default: true)
  --no-css-variables             do not use css variables for theming.
  -h, --help                     display help for command
```

## add

Use the `add` command to add components and dependencies to your project.

```bash
npx shadcn@latest add [component]
```

### Options

```bash
Usage: shadcn add [options] [components...]

add a component to your project

Arguments:
  components         name, url or local path to component

Options:
  -y, --yes           skip confirmation prompt. (default: false)
  -o, --overwrite     overwrite existing files. (default: false)
  -c, --cwd <cwd>     the working directory. defaults to the current directory.
  -a, --all           add all available components (default: false)
  -p, --path <path>   the path to add the component to.
  -s, --silent        mute output. (default: false)
  --src-dir           use the src directory when creating a new project. (default: false)
  --no-src-dir        do not use the src directory when creating a new project.
  --css-variables     use css variables for theming. (default: true)
  --no-css-variables  do not use css variables for theming.
  -h, --help          display help for command
```

## build

Use the `build` command to generate the registry JSON files.

```bash
npx shadcn@latest build
```

This command reads the `registry.json` file and generates the registry JSON files in the `public/r` directory.

### Options

```bash
Usage: shadcn build [options] [registry]

build components for a shadcn registry

Arguments:
  registry             path to registry.json file (default: "./registry.json")

Options:
  -o, --output <path>  destination directory for json files (default: "./public/r")
  -c, --cwd <cwd>      the working directory. defaults to the current directory.
  -h, --help           display help for command
```

To customize the output directory, use the `--output` option.

```bash
npx shadcn@latest build --output ./public/registry
```
---
title: Monorepo
description: Using shadcn/ui components and CLI in a monorepo.
---

Until now, using shadcn/ui in a monorepo was a bit of a pain. You could add
components using the CLI, but you had to manage where the components
were installed and manually fix import paths.

With the new monorepo support in the CLI, we've made it a lot easier to use
shadcn/ui in a monorepo.

The CLI now understands the monorepo structure and will install the components,
dependencies and registry dependencies to the correct paths and handle imports
for you.

## Getting started

<Steps>

### Create a new monorepo project

To create a new monorepo project, run the `init` command. You will be prompted
to select the type of project you are creating.

```bash
npx shadcn@canary init
```

Select the `Next.js (Monorepo)` option.

```bash
? Would you like to start a new project?
    Next.js
❯   Next.js (Monorepo)
```

This will create a new monorepo project with two workspaces: `web` and `ui`,
and [Turborepo](https://turbo.build/repo/docs) as the build system.

Everything is set up for you, so you can start adding components to your project.

Note: The monorepo uses React 19 and Tailwind CSS v4.

### Add components to your project

To add components to your project, run the `add` command **in the path of your app**.

```bash
cd apps/web
```

```bash
npx shadcn@canary add [COMPONENT]
```

The CLI will figure out what type of component you are adding and install the
correct files to the correct path.

For example, if you run `npx shadcn@canary add button`, the CLI will install the button component under `packages/ui` and update the import path for components in `apps/web`.

If you run `npx shadcn@canary add login-01`, the CLI will install the `button`, `label`, `input` and `card` components under `packages/ui` and the `login-form` component under `apps/web/components`.

### Importing components

You can import components from the `@workspace/ui` package as follows:

```tsx
import { Button } from "@workspace/ui/components/button"
```

You can also import hooks and utilities from the `@workspace/ui` package.

```tsx
import { useTheme } from "@workspace/ui/hooks/use-theme"
import { cn } from "@workspace/ui/lib/utils"
```

</Steps>

## File Structure

When you create a new monorepo project, the CLI will create the following file structure:

```txt
apps
└── web         # Your app goes here.
    ├── app
    │   └── page.tsx
    ├── components
    │   └── login-form.tsx
    ├── components.json
    └── package.json
packages
└── ui          # Your components and dependencies are installed here.
    ├── src
    │   ├── components
    │   │   └── button.tsx
    │   ├── hooks
    │   ├── lib
    │   │   └── utils.ts
    │   └── styles
    │       └── globals.css
    ├── components.json
    └── package.json
package.json
turbo.json
```

## Requirements

1. Every workspace must have a `components.json` file. A `package.json` file tells npm how to install the dependencies. A `components.json` file tells the CLI how and where to install components.

2. The `components.json` file must properly define aliases for the workspace. This tells the CLI how to import components, hooks, utilities, etc.

```json showLineNumbers title="apps/web/components.json"
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "../../packages/ui/src/styles/globals.css",
    "baseColor": "zinc",
    "cssVariables": true
  },
  "iconLibrary": "lucide",
  "aliases": {
    "components": "@/components",
    "hooks": "@/hooks",
    "lib": "@/lib",
    "utils": "@workspace/ui/lib/utils",
    "ui": "@workspace/ui/components"
  }
}
```

```json showLineNumbers title="packages/ui/components.json"
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/styles/globals.css",
    "baseColor": "zinc",
    "cssVariables": true
  },
  "iconLibrary": "lucide",
  "aliases": {
    "components": "@workspace/ui/components",
    "utils": "@workspace/ui/lib/utils",
    "hooks": "@workspace/ui/hooks",
    "lib": "@workspace/ui/lib",
    "ui": "@workspace/ui/components"
  }
}
```

3. Ensure you have the same `style`, `iconLibrary` and `baseColor` in both `components.json` files.

4. **For Tailwind CSS v4, leave the `tailwind` config empty in the `components.json` file.**

By following these requirements, the CLI will be able to install ui components, blocks, libs and hooks to the correct paths and handle imports for you.
---
title: Open in v0
description: Open components in v0 for customization.
---

Every component on ui.shadcn.com is editable on [v0 by Vercel](https://v0.dev). This allows you to easily customize the components in natural language and paste into your app.

<a href="https://vercel.com/signup?utm_source=shad&utm_medium=web&utm_campaign=docs_cta_signup">
  <Image
    src="/images/open-in-v0.png"
    width="716"
    height="420"
    alt="Open in v0"
    className="mt-6 w-full overflow-hidden rounded-lg border dark:hidden"
  />
  <Image
    src="/images/open-in-v0-dark.png"
    width="716"
    height="420"
    alt="Open in v0"
    className="mt-6 hidden w-full overflow-hidden rounded-lg border shadow-sm dark:block"
  />
  <span className="sr-only">Open in v0</span>
</a>

To use v0, sign-up for a free [Vercel account here](https://vercel.com/signup?utm_source=shad&utm_medium=web&utm_campaign=docs_cta_signup). In addition to v0, this gives you free access to Vercel's frontend cloud platform by the creators of Next.js, where you can deploy and host your project for free.

Learn more about getting started with [Vercel here](https://vercel.com/docs/getting-started-with-vercel?utm_source=shadcn_site&utm_medium=web&utm_campaign=docs_cta_about_vercel).

Learn more about getting started with [v0 here](https://v0.dev/faq).
