import { RETAIL_DASHBOARD_PATH } from "../lib/dashboards/larrys/content.ts";
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
    source: { label: "Learning Webflow – Adapting our design for mobile (LinkedIn Learning)" },
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
    title: "I ship Angular and React. Here is the translation layer.",
    description:
      "A working map between Angular and React — components, async state, change detection, forms, routing and CSS — from someone who has shipped both in production.",
    date: "2026-11-10",
    kicker: "Angular and React",
    tags: ["angular", "react", "typescript", "rxjs"],
    body: [
      {
        type: "p",
        text: "For nearly a decade I spent most of my week in Angular. The storefronts I worked on are Angular, TypeScript, RxJS and Signals, SCSS, a versioned component library, and a C# BFF. I also ship React: GifSpark is React 18, Vite, TanStack Query and Stripe; this site is Next.js 16 and React 19. Recruiters treat that as two résumés. It is one job — user interface — with two runtimes.",
      },
      {
        type: "p",
        text: "This is the translation I use when I move a pattern from one codebase to the other. None of it is “Angular is better” or “React is the future.” It is what actually has to match: a typed model, a place for async work, a way to stop leaking subscriptions, and markup a screen reader can use.",
      },
      { type: "h2", text: "Components are the same idea with different wiring" },
      {
        type: "p",
        text: "In the storefront, a versioned library component is an NgModule (or a standalone component on newer surfaces) with @Input for data, @Output EventEmitter for user intent, OnPush change detection, and a host class so tenant SCSS can theme it. The same product card exists as slate / sky / crimson versions. The parent does not fork the template; it picks a version from server-driven config.",
      },
      {
        type: "p",
        text: "In React I do the same split with props and a callback. GifSpark’s generation flow is a page that owns the machine (uploading | generating_video | finalizing | ready) and child views that only render that state. There is no EventEmitter; there is onComplete. There is no NgModule; there is a file that exports a function. The design rule does not change: the child does not fetch the world. The parent, or a hook the parent owns, does.",
      },
      {
        type: "code",
        caption: "Angular: data in, events out, OnPush (storefront library pattern)",
        code: `@Component({
  selector: "bpc-product-card-slate",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "bpc-product-card bpc-product-card-slate" },
})
export class ProductCardSlateComponent {
  @Input({ required: true }) product!: Product;
  @Output() readonly add = new EventEmitter<Product>();
}`,
      },
      {
        type: "code",
        caption: "React: same contract as props (GifSpark-style view)",
        code: `type ResultViewProps = {
  status: "uploading" | "generating_video" | "finalizing" | "ready";
  onDownload: (kind: "webp" | "gif" | "mp4") => void;
};

export function ResultView({ status, onDownload }: ResultViewProps) {
  // The parent owns the job. This file only draws it.
}`,
      },
      { type: "h2", text: "Async state: facades and Observables vs Query and hooks" },
      {
        type: "p",
        text: "The storefront does not use NgRx on the pages I live in. Shared state is a facade service: inject HttpClient, map the BFF JSON into a UI model, hold it on a BehaviorSubject, expose an Observable. Search, cart, session, and product details all follow that shape. Components subscribe in the template with async pipe, or in the class with takeUntil(this.destroy$). That last part matters. A subscribe without a teardown is a leak; OnPush will not save you.",
      },
      {
        type: "p",
        text: "GifSpark’s equivalent is TanStack Query. useCredits() is useQuery on user_credits, refetchInterval 10 seconds, enabled only when there is a user. Auth invalidates that query on sign-in; a finished generation invalidates it again so the header credit count moves. I did not hand-roll a global store. The cache is the store.",
      },
      {
        type: "code",
        caption: "Angular facade: one subject, one public stream",
        code: `@Injectable({ providedIn: "root" })
export class SessionFacade {
  private readonly session = new BehaviorSubject<Session | null>(null);
  readonly session$ = this.session.asObservable();

  constructor(private readonly http: HttpClient) {}

  refresh(): Observable<Session> {
    return this.http.get<Session>("/api/session").pipe(
      tap((value) => this.session.next(value)),
    );
  }
}`,
      },
      {
        type: "code",
        caption: "React Query: the cache is the subject",
        code: `export function useCredits(userId: string | undefined) {
  return useQuery({
    queryKey: ["user_credits", userId],
    queryFn: () => fetchCredits(userId!),
    enabled: Boolean(userId),
    refetchInterval: 10_000,
  });
}`,
      },
      {
        type: "p",
        text: "Signals are the closest thing the storefront has to React state. I use them where the team has adopted them. I do not rewrite a working facade into a signal store for the résumé. js-in-colors is the place I used NgRx SignalStore on purpose, in a greenfield Angular 22 app, with ADRs. That is not the same as “four years of NgRx on the platform.”",
      },
      { type: "h2", text: "Change detection vs render" },
      {
        type: "p",
        text: "OnPush means Angular only checks the component when an @Input reference changes, an event originates inside it, or you markForCheck(). That is why facades emit new objects instead of mutating arrays. IntersectionObserver on lazy images has to play with OnPush: the callback must mark the view dirty or the image never swaps. React’s default is the opposite — render the function again, then bail out if you memoized. I have useMemo and useCallback in GifSpark. I do not have a React Profiler practice I would defend in an interview. I do have a CLS practice I would: do not lazy-load the logo in the first viewport; reserve height; eager + fetchpriority high on the header mark.",
      },
      { type: "h2", text: "Forms, routing, CSS" },
      {
        type: "ul",
        items: [
          "Angular reactive forms on checkout: FormGroup, validators, valueChanges, disable the Place order button until the TokenEx iframe says the PAN is tokenized. The card number never sits in the Angular model.",
          "GifSpark checkout is Stripe Embedded Checkout, not a hand-rolled card form. That is the right amount of React for PCI.",
          "Storefront routing is lazy NgModules (search, product, cart, checkout, account). Checkout is a second Angular bootstrap so the payment bundle is not in the browsing app.",
          "GifSpark uses route-level React.lazy / Suspense. This site uses the App Router: server components by default, \"use client\" only where there is state.",
          "CSS: storefront is SCSS, ITCSS-ish, Figma tokens compiled to custom properties, per-tenant skins. GifSpark and this site are Tailwind. Tokens vs utility classes is a team choice. Specificity wars vs class-string wars — pick one and lint it.",
        ],
      },
      { type: "h2", text: "What I say when someone asks which one I “really” am" },
      {
        type: "p",
        text: "I am an Angular production engineer who also ships React. The longest scars — multi-tenant libraries, checkout, Auth0, GTM, schema.org — are Angular. The newest product loops — Query, SSE chat, Stripe, Next metadata — are React. If a team needs Module Federation, NgRx as the platform, or a React render-budget expert, that is not the work in these repos. If they need someone who can read a Figma file, type the model, and not leak a subscription in either runtime, that is the work.",
      },
    ],
  },
  {
    slug: "frontend-of-a-cloud-app",
    title: "The frontend of a cloud app: REST, tokens, and what you actually own",
    description:
      "How an Angular storefront and a React product talk to REST, Auth0, TokenEx, Stripe, GTM and Edge Functions — without pretending the UI engineer owns AWS.",
    date: "2026-11-13",
    kicker: "APIs and hosted services",
    tags: ["angular", "rest", "auth0", "stripe", "gtm"],
    body: [
      {
        type: "p",
        text: "Job posts say “integrate with AWS” the way they used to say “cloud.” What I can defend is this: a browser talks JSON to something you do not SSH into. On the furniture platform that something is a C# BFF. On GifSpark it is Supabase and Deno Edge Functions. On this site, optional Postgres through a pooler. I consume those endpoints. I do not design VPCs.",
      },
      { type: "h2", text: "The BFF is the cloud, as far as Angular is concerned" },
      {
        type: "p",
        text: "Search, product, cart, payment, and account facades call REST. SearchFacadeV2 maps classifications, variant groups, promotions and availability into a stable UI model so the PLP does not care which search vendor shaped the JSON. Feature flags and GTM container IDs arrive from /api/environment/config. If the BFF is down, the UI has an error state, not a retry storm I invented.",
      },
      {
        type: "code",
        caption: "HttpClient in a facade, mapped once, torn down with the view",
        code: `this.searchFacade
  .search(query)
  .pipe(takeUntil(this.destroy$))
  .subscribe({
    next: (page) => {
      this.products = page.products;
      this.tagging.updateSearchV2(page.details);
    },
    error: (err) => this.error = err.message ?? "Search failed",
  });`,
      },
      {
        type: "p",
        text: "Checkout GTM events are not decoration. applicationLoad, PageViewDelivery, PageViewPayment, PageViewReview, PageViewThankyou — and a PageViewAll on each step — go through angular-google-tag-manager. TaggingService writes btData (cart lines, SKUs, categories, prices, promotions, payments, email). Marketing can report because the UI put the fields in the data layer. I do not own the GA4 property.",
      },
      { type: "h2", text: "Auth and secrets stay out of the bundle" },
      {
        type: "ul",
        items: [
          "Storefront sign-in is Auth0 (@auth0/auth0-spa-js). Session guards decide whether account and checkout routes exist for this user.",
          "Card data goes through TokenEx hosted fields. The Angular model sees a token, not a PAN. That is the PCI line.",
          "GifSpark Google sign-in sits in Supabase Auth. Edge Functions use the service role on the server. The SPA never gets that key.",
          "Termly CMP is the first script in the document head on the storefronts that use it. GTM tags wait on consent categories. Analytics is not more important than the checkbox.",
        ],
      },
      {
        type: "code",
        caption: "GifSpark support chat: the browser streams; the key stays on the Edge Function",
        code: `const response = await fetch("/functions/v1/support-chat", {
  method: "POST",
  headers: { Authorization: \`Bearer \${session.access_token}\` },
  body: JSON.stringify({ messages, credits }),
  signal: controller.signal,
});
const reader = response.body!.getReader();
// Parse text/event-stream "data:" deltas into the transcript.`,
      },
      { type: "h2", text: "Payments are vendor SDKs plus your state machine" },
      {
        type: "p",
        text: "Affirm, Acima, ChargeAfter, Progressive Leasing, Synchrony, Unifi, gift cards, split pay — each one is a script or npm package wrapped in a library component, gated by tenant config. The BFF still authorizes and captures. GifSpark maps Stripe price IDs to credit packs in a webhook, then a Postgres function add_credits_from_purchase. The React app polls until the balance moves, then sends the user home. That is full-stack in the small: UI, function, table. It is not RDS, ECS, or API Gateway as a platform I run.",
      },
      { type: "h2", text: "Python, AWS, and the honest sentence" },
      {
        type: "p",
        text: "I have used Python as a data script (building a typed snapshot for a dashboard). I have not written the Python API a federal posting means. I have not shipped Lambda, CloudFront, or ECS. The closest cloud work is: call a hosted HTTPS API, keep secrets on the server, handle 401/429/402 in the UI, and log enough to debug without putting PII in Rapid7. If a team needs that plus someone who will learn their AWS account, I can do the first half on day one.",
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
