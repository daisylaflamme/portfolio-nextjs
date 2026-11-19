import { RETAIL_DASHBOARD_PATH } from "../lib/dashboards/larrys/content.ts";
import { ONLINE_RETAIL_PATH } from "../lib/dashboards/online-retail/content.ts";
import type { BlogBlock, BlogPost } from "./types.ts";

/**
 * Notes at /blog, newest first. Written from work that actually exists: Blueport Angular
 * storefronts, GifSpark (React), this Next.js portfolio, js-in-colors (Angular 22), and what
 * Daisy learned building in Webflow. A note is never dated before the work it mentions.
 */
const posts: BlogPost[] = [
  {
    slug: "webflow-through-a-react-angular-developers-eyes",
    title: "Webflow through a React/Angular developer’s eyes",
    description:
      "A React and Angular developer’s notes on learning Webflow: classes, components, CMS, variables, and adapting to desktop-first breakpoints.",
    summary:
      "Observations and takeaways from moving from component-driven React and Angular codebases to Webflow’s visual layout engine.",
    date: "2026-11-15",
    kicker: "Learning",
    tags: ["webflow", "react", "angular", "css", "accessibility"],
    source: {
      label: "Learning Webflow – Adapting our design for mobile (LinkedIn Learning)",
      href: "https://www.linkedin.com/learning/learning-webflow-23115084/adapting-our-design-for-mobile",
    },
    body: [
      {
        type: "p",
        text: "I spent nearly a decade building Angular and TypeScript interfaces: shared UI libraries and configuration-driven layouts for many brands on one platform. Lately I’ve been working in React and Next.js. To learn Webflow properly, I built a blog in it. Here’s how its mental model mapped to mine, and where it didn’t.",
      },
      { type: "h2", text: "What felt familiar" },
      {
        type: "p",
        lead: "Classes are a design system in disguise.",
        text: "A Webflow class works like a utility or BEM class. Combo classes work like modifiers: .card plus .is-featured. Name them with intent and you get a reusable system. Skip that and you end up with div-block-47.",
      },
      {
        type: "p",
        lead: "Components are components.",
        text: "Webflow Components with properties and slots feel close to React props and children, or Angular @Input() and <ng-content>. Build one once, use it everywhere, and change it in one place.",
      },
      {
        type: "p",
        lead: "The CMS is your data layer.",
        text: "A Collection works like a typed data source. A Collection List is basically .map() in React or @for in Angular, with fields bound to elements instead of passed as props or inputs.",
      },
      {
        type: "p",
        lead: "Variables are design tokens.",
        text: "Color, spacing, and type variables, with modes for light and dark, felt like the CSS custom properties and theme files I already maintain.",
      },
      { type: "h2", text: "What took adjusting" },
      {
        type: "p",
        lead: "Breakpoints cascade down, not up.",
        text: "I design mobile first. Webflow’s base breakpoint is desktop, and styles cascade down to tablet and phone, while larger breakpoints cascade up. Once I stopped fighting it and checked every element at each breakpoint, it clicked. It also made me more deliberate about what each screen size really needs.",
      },
      {
        type: "p",
        lead: "No state, just interactions.",
        text: "There’s no useState, no signals, no services, no RxJS streams. Interactions handle the visual states, such as hover, scroll, and open or closed. That’s enough for marketing sites, and anything more complex is where custom code or DevLink comes in.",
      },
      {
        type: "p",
        lead: "The visual editor is the source of truth.",
        text: "In React or Angular, the code is the design. In Webflow, the canvas is. My habits still apply: semantic tags, one H1, labelled links, alt text, and checking contrast. I just set them in a panel instead of writing them in code.",
      },
      { type: "h2", text: "Takeaway" },
      {
        type: "p",
        text: "Webflow doesn’t replace engineering thinking. It rewards it. The same principles that keep a React or Angular codebase maintainable keep a Webflow site maintainable: reusable components, consistent naming, tokens over hard-coded values, and accessibility from the start.",
      },
    ],
  },
  {
    slug: "angular-and-react-same-ui-two-runtimes",
    title: "Angular and React: the same ideas with different wiring",
    description:
      "A plain-language map between Angular and React: where the HTML and CSS live, how components and data work, how flexible each one is, and when to choose which.",
    date: "2026-06-10",
    kicker: "Angular and React",
    tags: ["angular", "react", "typescript", "css", "architecture"],
    body: [
      {
        type: "p",
        text: "Angular and React look different on the surface, but they solve the same problem: turn data into a screen, and update the screen when the data or the user changes something. Once you see the shared ideas, moving between them is mostly learning where each one puts things.",
      },
      { type: "h2", text: "Where the HTML lives" },
      {
        type: "p",
        text: "In Angular, the HTML is a template: usually its own .html file next to the component, or a short inline template. It looks like regular HTML with a few extras, such as @if and @for for conditions and lists, and {{ }} to show a value. In React, the HTML is JSX, written inside the component function itself. Conditions and lists are plain JavaScript: a ternary or && for “show this if,” and .map() for lists.",
      },
      {
        type: "p",
        text: "Both end up as the same HTML in the browser, so the same rules apply: real buttons and links, headings in order, labels on form fields.",
      },
      { type: "h2", text: "Where the CSS can live" },
      {
        type: "ul",
        items: [
          "Angular: each component can have its own stylesheet (CSS or SCSS), and Angular scopes it to that component by default, so a .title class in one component doesn’t leak into another. Global styles and design tokens sit in a shared stylesheet.",
          "React: there’s no built-in rule. Teams choose plain CSS files, CSS Modules (scoped class names), utility classes like Tailwind, or CSS-in-JS.",
          "Both: design tokens as CSS custom properties, SCSS, and Tailwind all work. The choice is about the team’s conventions, not the framework.",
        ],
      },
      { type: "h2", text: "Components: data in, events out" },
      {
        type: "p",
        text: "In both, a component receives data from its parent and tells the parent when the user does something. Angular calls these inputs and outputs. React calls them props, with functions passed in for events. The idea is identical: the child draws, and the parent decides.",
      },
      {
        type: "code",
        caption: "Angular: a product card with an input and an output",
        code: `@Component({
  selector: "app-product-card",
  template: \`
    <h3>{{ product().name }}</h3>
    <button type="button" (click)="add.emit(product())">Add to cart</button>
  \`,
})
export class ProductCard {
  product = input.required<Product>();
  add = output<Product>();
}`,
      },
      {
        type: "code",
        caption: "React: the same card with props",
        code: `function ProductCard({ product, onAdd }: Props) {
  return (
    <>
      <h3>{product.name}</h3>
      <button type="button" onClick={() => onAdd(product)}>Add to cart</button>
    </>
  );
}`,
      },
      { type: "h2", text: "Data and state" },
      {
        type: "p",
        text: "Angular shares data through services: a class that loads data once and hands it to any component that asks, using RxJS streams or Signals. React keeps state inside components with hooks (useState, useEffect), shares it with context, and often uses a data library such as TanStack Query to fetch, cache and refresh server data. Different tools, same goals: load it once, keep it in sync, and clean up when the screen goes away.",
      },
      { type: "h2", text: "Updating the screen" },
      {
        type: "p",
        text: "Angular checks components for changes and updates only the parts of the page that changed. Signals make that more precise. React runs the component function again when its state or props change, then updates only what’s different in the page. In both, the habit that matters is the same: replace data with new values instead of changing it in place, so the framework can tell something changed.",
      },
      { type: "h2", text: "How flexible is each one?" },
      {
        type: "ul",
        items: [
          "Angular is a full framework. Routing, forms, HTTP, dependency injection, testing and a command-line tool are included and work the same way in every Angular project. Less to decide, more consistency across teams.",
          "React is a UI library. You choose the router, data fetching, forms and styling, or pick a framework such as Next.js that makes those choices and adds server rendering. More freedom, more decisions.",
          "Both support lazy loading (download code only when a page needs it), server rendering, TypeScript, and large monorepos.",
        ],
      },
      { type: "h2", text: "When to use which" },
      {
        type: "ul",
        items: [
          "Angular fits large, long-lived apps built by several teams: dashboards, admin tools, ecommerce platforms and form-heavy flows, where shared conventions matter more than freedom.",
          "React fits when flexibility and ecosystem matter: content and marketing sites with Next.js, products that change fast, and teams that want to share skills with React Native for mobile apps.",
          "Either one: the team’s existing skills and the code already in place usually decide more than the framework’s features.",
        ],
      },
    ],
  },
  {
    slug: "frontend-of-a-cloud-app",
    title: "What the frontend actually does in a cloud app",
    description:
      "A plain-language look at how a web page talks to the services behind it, keeps people informed while it waits, and keeps their data safe.",
    date: "2026-04-13",
    kicker: "APIs and hosted services",
    tags: ["rest", "auth", "payments", "security", "ux"],
    body: [
      {
        type: "p",
        text: "When you tap “Add to cart” or “Pay now,” the page in your browser doesn’t do the work itself. It sends a short message to a server somewhere (“add this item,” “charge this card”) and waits for an answer. The frontend’s job is to ask clearly, keep you informed while it waits, show the answer well, and protect what it touches along the way.",
      },
      {
        type: "figure",
        src: "/images/blog/frontend-cloud-app.webp",
        srcLight: "/images/blog/frontend-cloud-app-light.webp",
        width: 1600,
        height: 900,
        alt: "Diagram: the page in your browser asks the server to make a greeting and shows progress steps (uploading image, generating motion, finalizing) while it waits. The server checks who you are, decides prices and payments, keeps the secret keys and talks to trusted services for sign-in (Auth0, Supabase), payments (TokenEx, Stripe) and AI. The browser holds only a short-lived token.",
        caption: "The browser asks, the server decides, and the screen keeps people informed in between.",
      },
      { type: "h2", text: "The browser asks, the server decides" },
      {
        type: "p",
        text: "On the ecommerce platform I worked on, the website never decided prices, stock, or whether a payment went through. It asked a server and displayed the reply. The same is true in GifSpark, my AI greeting app. That keeps the important decisions in one trusted place, and it means the screen shows the real answer, not a guess.",
        link: { href: "https://gifspark.lovable.app/", label: "Try GifSpark" },
      },
      { type: "h2", text: "Waiting is part of the design" },
      {
        type: "p",
        text: "Asking a server takes time: a fraction of a second for a product list, a minute or more for an AI animation. Without feedback, people wonder whether their click worked, click again, or leave. A spinner, a progress bar or a step list all say the same thing: your request is on its way and the page is waiting for an answer.",
      },
      {
        type: "p",
        text: "In GifSpark, creating a greeting shows named steps instead of a blank screen, so people can see how far along it is. If a step fails, the same panel says something went wrong instead of spinning forever.",
      },
      {
        type: "code",
        caption: "GifSpark: the steps people see while their greeting is made",
        code: `const STATUS_STEPS = [
  { key: "uploading", label: "Uploading image" },
  { key: "generating_video", label: "Generating motion" },
  { key: "finalizing", label: "Finalizing greeting" },
  { key: "ready", label: "Ready!" },
];`,
      },
      {
        type: "p",
        text: "Payments need the same care. After checkout, the payment provider confirms the purchase to the server a moment later, so the page says “Processing your purchase… your credits are being added” and checks back until the credits appear. If it takes longer than expected, it says the payment was received and the credits may take a moment, rather than leaving people to worry they were charged for nothing.",
      },
      {
        type: "p",
        text: "On my online retail dashboard, “Summarize this view” asks an AI model for a short summary. While it writes, the button turns into “stop,” the panel says “Writing…,” and if the request fails, the button becomes “retry” with a plain message. Screen readers hear the finished summary, so the update is clear to everyone, not only to people who can see the screen.",
        link: { href: ONLINE_RETAIL_PATH, label: "See the dashboard" },
      },
      {
        type: "ul",
        items: [
          "Waiting: show that something is happening, and how far along it is when you know.",
          "Success: show the result, and confirm what changed.",
          "Error: say what went wrong in plain words and offer a way to try again.",
          "Empty: when there’s nothing to show, say so instead of leaving a blank space.",
        ],
      },
      { type: "h2", text: "Secrets never ship to the browser" },
      {
        type: "p",
        text: "Anything in a web page can be viewed by anyone who opens it. So passwords, payment keys and AI service keys stay on the server. Sign-in runs through a dedicated service such as Auth0 or Supabase, and the browser only holds a short-lived pass that proves who you are. On the dashboard, the browser sends only the tab and the filters; the server works out the numbers and holds the AI key.",
      },
      { type: "h2", text: "Card numbers never touch our code" },
      {
        type: "p",
        text: "At checkout on the ecommerce platform, the card fields came from TokenEx, a secure payment service. When you typed your card number, our code never saw it. It got back a token, a stand-in that is useless to anyone else. In GifSpark, Stripe works the same way: Stripe’s checkout handles the card, and the app only learns that the purchase went through. The provider handles the sensitive part, and the site handles the experience around it.",
      },
      { type: "h2", text: "The takeaway" },
      {
        type: "p",
        text: "The cloud does the heavy lifting. The frontend is where people meet it. My job is to make that moment clear, fast and safe: keep people informed while they wait, explain what happened when something goes wrong, keep secrets off the page, and let trusted services handle what they do best.",
      },
    ],
  },
  {
    slug: "accessible-forms-tests-and-data-you-can-trust",
    title: "Accessible forms, tests, and data you can trust",
    description:
      "How production Angular forms, Cypress-axe, JSON-LD and a retail dashboard treat data collection — and where that is not a federal survey platform or a Section 508 program.",
    date: "2026-11-12",
    kicker: "A11y, tests, data UIs",
    tags: ["accessibility", "testing", "seo", "angular"],
    body: [
      {
        type: "p",
        text: "Federal postings want Section 508, WCAG, automated tests, and often a survey or research app. I have not shipped a Census instrument or a 508 program of record. I have shipped the parts those systems are made of: forms that must not lose data, tests that fail on contrast and names, and pages that expose a real document to a crawler.",
      },
      { type: "h2", text: "Forms are data collection, even when they are checkout" },
      {
        type: "p",
        text: "Checkout, delivery, account, and store-hours editors are long forms with validation, disabled submit, and errors that have to be associated with the control. Lead-gen work from earlier in my career posted a GPHomestay inquiry into Salesforce and a Cambridge registration into QuickBase. js-in-colors Ask Dot is a constrained form: a question in, a streamed answer out, with a system prompt that will not train on the child and a demo mode when CHAT_PROVIDER is not groq.",
      },
      {
        type: "p",
        text: "The storefront page builder is a different kind of collection: nested ContentRow / ContentColumn JSON, a path (stackTrace) to the node you are editing, and a snapshot list for undo. Retailers type merchandising, not survey answers. The UI problem is the same — do not corrupt the tree, do not lose the last good state.",
      },
      { type: "h2", text: "What “tested” means in these repos" },
      {
        type: "ul",
        items: [
          "Storefront: Karma unit specs on components, guards and services, and Cypress component tests on the versioned library components. I kept them running; I did not build the test platform.",
          "js-in-colors: Vitest for selectors and state; Cypress + cypress-axe at phone, tablet and desktop; Storybook a11y addon; GitHub Actions runs lint, unit, build, Storybook build, and the smoke.",
          "This site: Node’s test runner on src/**/*.test.ts; Playwright at 390px and 1280px; axe on every public route in light and dark.",
          "GifSpark: Playwright is in the tree. The Vitest file I will not pretend is a suite.",
        ],
      },
      {
        type: "code",
        caption: "cypress-axe is the WCAG conversation I can have without a 508 office",
        code: `cy.visit("/lesson/variables/");
cy.injectAxe();
cy.checkA11y(undefined, {
  includedImpacts: ["critical", "serious"],
});`,
      },
      {
        type: "p",
        text: "On the storefront the a11y work looks like tickets: labels, keyboard on the mega menu (click-to-open, not hover-only), skip patterns, ADA-style bugs on checkout. That is not “I certified the product WCAG 2.2 AA.” js-in-colors is the place I set that bar on purpose, including high-contrast theme and 44px targets.",
      },
      { type: "h2", text: "Make the data visible to people and to machines" },
      {
        type: "p",
        text: "SeoService on the storefront writes title, description, canonical, and JSON-LD for Product, ProductGroup, BreadcrumbList, collections, search results and stores. SPA “not found” pages still return HTTP 200, so we set prerender-status-code 404 for Prerender.io. js-in-colors prerenders every lesson so the HTML has a real <title> and the lesson text before JavaScript. This site keeps a sitemap.ts in lockstep with PAGES.",
      },
      {
        type: "code",
        caption: "JSON-LD is a script tag you replace, not a comment in the footer",
        code: `private insertStructuredData(data: StructuredData[]) {
  document.querySelector('script[type="application/ld+json"]')?.remove();
  this.scriptService
    .createEmbedScript(JSON.stringify(data), { type: "application/ld+json" })
    .pipe(take(1))
    .subscribe();
}`,
      },
      {
        type: "p",
        text: "When the job wants “statistical programs” or dashboards, the honest artefact is Larry’s Stores: React + TypeScript + D3, typed selectors, KPI tiles, market-basket matrix, a loyalty what-if, a table under every chart. It is course data, anonymized. It is not SAS, and it is not a VA survey ops tool. It is how I put numbers on screen so a non-engineer can filter them.",
        link: { href: RETAIL_DASHBOARD_PATH, label: "Open the Larry’s Stores dashboard" },
      },
      { type: "h2", text: "The sentence I use for federal a11y and research apps" },
      {
        type: "p",
        text: "I can build Angular forms, keep automated a11y in CI, put schema on the page, and not lose user input. I have not run Section 508 acceptance for an agency, and I have not operated a survey platform. If that is the domain, I will learn the instrument. I will not relabel checkout as research.",
      },
    ],
  },
];

/** Every note, newest first. */
export const blogPosts: readonly BlogPost[] = [...posts].sort((a, b) => b.date.localeCompare(a.date));

export function blogPath(slug: string): string {
  return `/blog/${slug}`;
}

/** True for an https:// link to another site (it opens in a new tab); site paths start with "/". */
export function isExternal(href: string): boolean {
  return href.startsWith("https://");
}

export function getPost(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug);
}

/** "November 17, 2026": one format for the index and the post pages. */
export function formatPostDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${iso}T00:00:00Z`));
}

/**
 * Anchor ids for a post's h2 blocks, keyed by block index. Ids are slugs of the heading text,
 * never empty ("section" when the text has no letters or digits) and unique within the post
 * (a repeat gets "-2", "-3"…).
 */
export function headingIds(blocks: readonly BlogBlock[]): Map<number, string> {
  const ids = new Map<number, string>();
  const used = new Set<string>();
  blocks.forEach((block, index) => {
    if (block.type !== "h2") return;
    const base =
      block.text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") || "section";
    let id = base;
    for (let n = 2; used.has(id); n++) id = `${base}-${n}`;
    used.add(id);
    ids.set(index, id);
  });
  return ids;
}
