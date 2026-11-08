/**
 * Portfolio projects data.
 * Add new projects here. Place images in public/images/projects/
 * (thumbnails in public/images/projects/thumbnails/).
 * Use paths like "/images/projects/thumbnails/your-image.png" for local images.
 * Each project has `images`: an array of one or more image paths (e.g. ["/images/projects/foo.png"] or multiple).
 */
// export const projects = [
//   {
//     id: "product-configuration",
//     title: "Product Configuration",
//     summary:
//       "Worked in a senior dev team to add a major new product page feature allowing web site users to select different product configurations.",
//     description:
//       "Worked in a senior dev team to add a major new product page feature allowing web site users to select different product configurations. Implemented angular 6 components, templates and styles. Implemented LESS architecture.",
//     thumbnail: "/images/projects/thumbnails/asi-variant-pdp.webp",
//     images: ["/images/projects/asi-variant-pdp.webp",
//     imageAlt: "Product Configuration",
//     link: "https://www.americansignaturefurniture.com/product/group/living-room/seating/sectionals/campbell-cumulus-2-piece-sectional-with-right-facing-sofa-cement/2224589/2141781",
//   },
//   {
//     id: "clickable-swatches",
//     title: "Clickable Swatches",
//     summary:
//       "Worked in a team to add interactive functionality to color swatches and optimize search page results.",
//     description:
//       "Worked in a team to add interactive functionality to color swatches and optimize search page results.",
//     thumbnail: "http://daisylaflamme.net/images/thumbnails/asi-search-page-clickable-swatches-angular6.png",
//     images: ["http://daisylaflamme.net/images/asi-search-page-clickable-swatches-angular6.png",
//     imageAlt: "Clickable Swatches",
//     link: "https://www.americansignaturefurniture.com",
//   },
//   {
//     id: "re-styling",
//     title: "Re-styling",
//     summary: "Re-styling a third party filter extension",
//     description: "Re-styling a third party filter extension",
//     thumbnail: "http://daisylaflamme.net/images/thumbnails/lovesac-swatch-page.png",
//     images: ["http://daisylaflamme.net/images/lovesac-swatch-page.png",
//     imageAlt: "Re-styling",
//     link: "https://www.lovesac.com/search/fabric",
//   },
// ];

// src/data/projects.js
// Curated from http://daisylaflamme.net/ws2.html
// Paths assume images are copied into:
//   public/images/projects/thumbnails/
//   public/images/projects/

export const projects = [
  // --- Modern e-commerce: American Signature / Levin / Lovesac / HUB ---
  {
    id: "blueport-multisite-platform-ui",
    title: "E-commerce Platform UI",
    summary:
      "Implemented scalable, polished UI components and interactions that delivered consistent shopping experiences across 20+ furniture e-commerce sites on Blueport’s platform.",
    description:
      "Contributed to a multi-tenant e-commerce platform powering furniture retailers by translating hundreds of design mocks into production-ready, responsive front-end experiences. Implemented and enhanced a shared library of brand-configurable UI patterns—including custom pages, carousels, sliders, tabs, modals, forms, filters, and site configuration—so multiple clients could adopt consistent UX while preserving unique visual identity. Delivered core shopping surfaces such as mobile/desktop navigation and menus, global footers, search results grids, masonry galleries, product cards, PDP layouts, and cart pages with order summaries and sticky interactive CTAs. Collaborated cross-functionally to lead checkout UI flow initiatives, improving usability and consistency across brands while maintaining a high bar for semantic markup, maintainable styling, and scalable component architecture. Built and maintained features in a mixed legacy + modern stack (Angular, JavaScript, HTML,SCSS, CSS, C#, AngularJS, jQuery, LESS, Bootstrap) integrated with platform services.",
    role: "Front-End Developer → Senior Front-End Engineer",
    team: "Cross-functional; led checkout UI initiatives",
    dates: "2016 – 2025",
    stack: ["Angular","AngularJS","JavaScript","SCSS","LESS","Bootstrap"],
    problem: "20+ furniture retailers shared one e-commerce platform but each needed its own brand identity.",
    whatIBuilt: ["Translated hundreds of design mocks into responsive, production-ready front-end experiences.","Shared library of brand-configurable patterns: carousels, sliders, tabs, modals, forms, filters.","Core shopping surfaces: navigation, footers, search grids, product cards, PDPs, and cart.","Led checkout UI flow initiatives for usability and consistency across brands."],
    impact: ["20+ storefronts running on one shared UI library","Hundreds of design mocks shipped as production UI","Each brand kept its own visual identity"],
    thumbnail: "/images/projects/thumbnails/masonry-collage.webp",
    images: [
      "/images/projects/masonry-collage.webp"
    ],
    imageAlt:
      "Masonry collage of multi-brand e-commerce UI work: mobile navigation, PDPs, cart and checkout pages, search grids, content editor layouts, and marketing modules across multiple furniture storefronts.",
    link: null,
    tags: ["html", "angular", "javascript", "scss", "css", "bootstrap", "ecommerce", "cms", "api-integrations", "ui-components"],
  },
  {
    id: "checkout-multi-payments",
    title: "Multi‑Payment Checkout Enablement",
    summary:
      "Enabled enterprise furniture eCommerce brands to offer flexible checkout options by integrating multiple payment providers end‑to‑end.",
    description:
      "Led front‑end integration of a multi‑provider payment ecosystem across checkout (Payment → Review → Thank You pages) for multiple client storefronts. Implemented and standardized integrations for Acima, Affirm, PayLater, Progressive Leasing, SetPay, ChargeAfter, credit/debit cards, and gift cards—expanding customer choice and improving conversion potential. Wrapped complex vendor JavaScript SDKs / npm packages into secure, reusable Angular library components with configuration‑driven feature flags so the same codebase could be safely shared across brands. Coordinated UI state, validation, and async payment authorization flows, wiring components to BFF endpoints (tokenization, order totals, promotions, financing eligibility, and payment capture) to keep sensitive logic server‑side while delivering a seamless, responsive, cross‑browser experience across mobile, tablet, and desktop.",
    role: "Senior Front-End Engineer · integration lead",
    team: "Owned it; worked with UX, product, payment vendors, and back-end",
    dates: "2019 – 2025",
    stack: ["Angular","JavaScript","SCSS","Vendor SDKs","BFF APIs"],
    problem: "Multiple furniture brands needed many payment and financing options in checkout, all running on one shared codebase.",
    whatIBuilt: ["Integrated Acima, Affirm, PayLater, Progressive Leasing, SetPay, ChargeAfter, cards, and gift cards.","Wrapped vendor SDKs and npm packages into reusable Angular library components.","Configuration-driven feature flags so each brand enables only its providers.","Validation and async authorization flows across Payment, Review, and Thank You pages.","Wired components to BFF endpoints so sensitive payment logic stays server-side."],
    impact: ["8 payment methods: 6 financing and leasing providers, plus cards and gift cards","One checkout codebase shared across brands via feature flags","Sensitive payment logic kept server-side"],
    thumbnail: "/images/projects/thumbnails/payment-morris.webp",
    images: [
      "/images/projects/payment.webp",
      "/images/projects/payment-affirm.webp",
      "/images/projects/payment-ca.webp",
      "/images/projects/payment-credit-card.webp",
      "/images/projects/payment-mobile.webp",
      "/images/projects/payment-morris.webp",
      "/images/projects/payment-progressive.webp",
      "/images/projects/split-payment2.webp"
    ],
    imageAlt:
      "Checkout payment step showing multiple payment methods (credit/debit, Affirm, financing, and lease-to-own) across desktop and mobile flows.",
    link: null,
    tags: ["html", "angular", "javascript", "ecommerce", "scss", "css", "api-integrations", "payments"],
  },
  {
    id: "store-details-maps",
    title: "Store Details Maps Modernization",
    summary:
      "Owned a full end‑to‑end migration of store‑locator maps across multiple brands—reducing annual mapping costs by ~80% while improving UX and brand consistency.",
    description:
      "Drove the initiative from discovery to delivery: evaluated map platform options, created a clear decision matrix for leadership, and aligned stakeholders on the recommended approach. Implemented a shared Angular base component that supports Mapbox and OpenStreetMap, with secure, configuration‑driven branding (custom pin colors, styles, and per‑brand toggles) reusable across all storefronts. Added a custom store‑type legend (e.g., Furniture Store vs Mattress Store) and ensured accessible, responsive behavior across devices. Partnered with QA and UX to validate interactions, edge cases, and performance, and delivered a production‑ready rollout with thorough testing and release support.",
    role: "Senior Front-End Engineer · initiative owner",
    team: "UX, QA, and leadership stakeholders",
    dates: "2019 – 2025",
    stack: ["Angular","Mapbox","OpenStreetMap","SCSS"],
    problem: "Store-locator maps across several brands were costly, and each brand needed its own look on a shared platform.",
    whatIBuilt: ["Evaluated map platforms and wrote a decision matrix for leadership.","Shared Angular base component supporting both Mapbox and OpenStreetMap.","Per-brand pin colors, styles, and toggles driven by secure configuration.","Custom store-type legend, such as Furniture Store versus Mattress Store.","Validated accessibility, responsiveness, and performance with QA and UX before rollout."],
    impact: ["~80% lower annual mapping costs","One map component reused across all storefronts","Production rollout with full testing and release support"],
    thumbnail: "/images/projects/thumbnails/store-details.webp",
    images: [
      "/images/projects/store-details.webp",
      "/images/projects/store-details-stn.webp",
      "/images/projects/store-details-rana.webp",
      "/images/projects/store-details-wgr.webp"
    ],
    imageAlt:
      "Store details pages showing an interactive map with a branded location pin, nearby store results, and a store-type legend across multiple furniture brands.",
    link: "https://www.morrisathome.com/store/furniture-store/OH/Reynoldsburg/2339-Taylor-Park-Drive",
    tags: ["html", "angular", "ecommerce", "scss", "css", "api-integrations", "maps"],
  },
  {
    id: "gifspark-ai-greeting-app",
    title: "GifSpark: AI Photo-to-GIF Greeting App",
    summary:
      "Created an AI-powered digital product that turns a single photo into a short animated greeting using Runway, React, TypeScript, Stripe payments, and a polished conversion-focused UX.",
  
    description:
      "Built GifSpark as an AI-powered digital product from concept through launch planning, combining product discovery, UX strategy, prototyping, implementation, QA, and monetization. The app allows users to upload a photo, generate a personalized greeting, and export it as WebP, GIF, or MP4. I led the product experience end-to-end—defining user flows, refining UX details, improving responsive behavior, and optimizing performance for media-heavy processing workflows. The platform integrates Runway gen4_turbo for AI animation generation, Stripe for credit-based payments, and Supabase/Lovable Cloud for authentication, storage, database management, and Edge Functions. I also introduced in-app AI support chat and built safeguards around key flows such as generation, downloads, payments, and account usage.",
  
    role: "Founder, designer, and developer",
    team: "Solo project",
    stack: ["React","TypeScript","Vite","Tailwind","Supabase","Stripe","Runway API"],
    problem: "Turn a single photo into a personalized animated greeting people can pay for and download.",
    whatIBuilt: ["Upload, generate, and export flow producing WebP, GIF, or MP4 greetings.","Runway gen4_turbo integration for AI animation generation.","Credit-based Stripe payments with Supabase auth, storage, database, and Edge Functions.","In-app AI support chat and safeguards around generation, downloads, and payments."],
    impact: ["Live with paying users through Stripe","Designed, built, and launched solo","3 export formats: WebP, GIF, and MP4"],
    thumbnail: "/images/projects/thumbnails/gst.webp",
    images: [
      "/images/projects/gs.webp",
      "/images/projects/gs4.webp",
      "/images/projects/gs5.webp",
      "/images/projects/gs6.webp"
    ],
    imageAlt:
      "GifSpark AI greeting app showing photo upload, AI animation generation, message overlay, and downloadable animated greeting formats.",
  
    link: null,
  
    extraLinks: [
      {
        label: "Live App",
        href: "https://gifspark.lovable.app/",
      }
    ],
  
    tags: [
      "react",
      "typescript",
      "vite",
      "tailwind",
      "shadcn-ui",
      "runway-api",
      "stripe",
      "supabase",
      "ai",
      "product-design",
      "ux",
      "qa",
      "seo",
      "digital-product",
      "api-integrations",
      "payments",
    ],
  },
  {
    id: "ai-digital-book-project",
    title: "AI Digital Book: Interactive App → Published Manuscript",
    summary:
      "Designed and built an AI-assisted digital book experience using React and Tailwind, transforming generated content into an interactive web app, downloadable PDF, and a fully published Kindle and paperback book.",
    description: "This project brings together UI engineering, AI-assisted creation, and digital publishing into a cohesive product experience. Using Lovable as an AI co-builder, I iterated on application structure, UI flows, and content, shaping them into a production-ready digital platform. The app presents the book as a fully responsive, interactive experience across mobile, tablet, and desktop, with subtle skeuomorphic motion to emulate real page transitions. In parallel, I established a content pipeline that generates both a high-quality downloadable PDF and a print-ready manuscript, published on Amazon Kindle and in paperback. The result is a complete digital-to-publishing workflow, combining modern front-end architecture with AI-driven tooling to deliver a polished, end-to-end product.",
    thumbnail: "/images/projects/thumbnails/ai-app-cover-preview.webp",
    images: [
      "/images/projects/digital-ai-cover-full-view.webp",
      "/images/projects/ai-book-preview.webp"
    ],
    imageAlt:
      "AI digital book project: interactive web app experience alongside the generated PDF and published book formats.",
    link: "https://designing-tomorrow-with-milo.lovable.app/",
    extraLinks: [
      {
        label: "Git Code",
        href: "https://github.com/daisylaflamme/ai-future-book-dont-panic",
      },
      {
        label: "Amazon",
        href: "https://www.amazon.com/Designing-Tomorrow-Milo-Families-Together/dp/B0HLH8S53G/ref=sr_1_1?crid=5WZQ62TJ60AC&dib=eyJ2IjoiMSJ9.HslFHmCKoGRTArHXN8r9-ewSwSWYapaJ5sI9Ypn9wGTGjHj071QN20LucGBJIEps.6f8qaUxJnFIQ0jWdMc7Pj753M9rcrVbDSo5Xy0aLzno&dib_tag=se&keywords=designing+tomorrow+with+milo&qid=1790783633&sprefix=designing+tomorrow+with+milo%2Caps%2C161&sr=8-1",
      },
    ],
    tags: ["react", "vite", "tailwind", "typescript", "ai", "digital-media", "pdf", "publishing"],
  },
  {
    id: "cms-hero-carousel",
    title: "CMS‑Driven Hero Carousel Widget",
    summary:
      "Built a reusable, plug‑and‑play hero carousel that lets non‑technical teams publish and manage homepage marketing content through the CMS—without code changes.",
    description:
      "Architected and delivered a configurable carousel widget that can be dropped into any client landing page or custom homepage layout. Integrated the Tiny‑Slider JavaScript library and wrapped it in a maintainable component pattern with CMS‑controlled content (images, slide order, links, and placement) so marketing teams could self‑serve updates. Optimized layout, touch interactions, and loading behavior for mobile, tablet, and desktop, and validated quality through cross‑browser and responsive testing. This unlocked faster campaign launches and improved homepage engagement by keeping featured promotions fresh across multiple brands.",
    role: "Front-End Developer · owner",
    team: "Owned it; worked with UX, product, and back-end",
    dates: "2016 – 2019",
    stack: ["JavaScript","Tiny-Slider","SCSS","CMS"],
    problem: "Marketing teams needed to update homepage promotions without waiting on engineering.",
    whatIBuilt: ["Configurable carousel widget that drops into any landing page or custom homepage.","Tiny-Slider wrapped in a maintainable component with CMS-controlled images, order, and links.","Optimized touch interactions, layout, and loading for mobile, tablet, and desktop."],
    impact: ["Marketing self-serves homepage promotions without code changes","Faster campaign launches across multiple brands"],
    thumbnail: "/images/projects/thumbnails/carousel-desktop.webp",
    images: [
      "/images/projects/carousel-desktop.webp",
      "/images/projects/carousel-tablet.webp",
      "/images/projects/carousel-iphone.webp"
    ],
    imageAlt:
      "Homepage hero carousel displaying promotional banners across desktop, tablet, and mobile breakpoints.",
    link: "https://www.cardis.com/",
    tags: ["html", "javascript", "cms", "ecommerce", "scss", "css", "ui-components"],
  },
  {
    id: "angular-modal-system",
    title: "Configurable Modal System for Checkout and UX Flows",
    summary:
      "Built a reusable, accessibility‑first modal system with multiple interaction patterns, enabling teams to standardize UX while meeting brand and ADA requirements.",
    description:
      "Architected a shared modal library in Angular to support common client interaction needs across high‑traffic eCommerce flows. Delivered multiple modal variants—including a lightweight info/lightbox modal for gated selections, a full‑width takeover modal for maximum focus, a header‑anchored modal with precise positioning and partial overlay, and a slide‑in side modal for smooth, non‑blocking experiences. Implemented configurable behavior via Angular inputs (layout, size, overlay, focus handling, and close rules) and validated keyboard navigation, focus trapping, screen‑reader semantics, and responsive behavior to align with ADA/WCAG expectations. This standardized UI patterns across brands while keeping implementations consistent, configurable, and easy to adopt.",
    role: "Senior Front-End Engineer · owner",
    team: "Owned it; worked with UX, product, and back-end",
    dates: "2019 – 2025",
    stack: ["Angular","SCSS","ARIA"],
    problem: "High-traffic checkout and UX flows needed consistent modals that met brand and ADA requirements.",
    whatIBuilt: ["Info/lightbox, full-width takeover, header-anchored, and slide-in side modal variants.","Angular inputs for layout, size, overlay, focus handling, and close rules.","Keyboard navigation, focus trapping, and screen-reader semantics validated against WCAG."],
    impact: ["4 modal variants from one configurable library","Keyboard, focus, and screen-reader behavior validated against WCAG"],
    thumbnail: "/images/projects/thumbnails/header-modal.webp",
    images: [
      "/images/projects/full-modal.webp",
      "/images/projects/header-modal.webp",
      "/images/projects/mobile-header-modal.webp",
      "/images/projects/info-modal.webp",
      "/images/projects/side-modal.webp"
    ],
    imageAlt:
      "Examples of reusable modal patterns, including full-page takeover, header-anchored, informational lightbox, and side-drawer modals.",
    link: null,
    tags: ["html", "angular", "ecommerce", "scss", "css","javascript", "ui-components", "accessibility"],
  },
  {
    id: "gift-card-balance-widget",
    title: "Gift Card Balance Checker Widget",
    summary:
      "Built a plug‑and‑play gift card balance checker as a reusable web component, enabling multiple brands to add the feature anywhere on their websites with consistent UX across devices.",
    description:
      "Architected and implemented a standalone Angular library component packaged as a web component so client teams could embed a gift card balance check on any custom page without bespoke development. Integrated secure, configuration‑driven theming for brand consistency and delivered a seamless mobile, tablet, and desktop experience. Wired the front end to BFF endpoints that broker requests to the Loft API, keeping sensitive integrations server‑side while providing fast, reliable balance lookups. Supported multi‑brand reuse through shared configuration, robust validation, and thorough cross‑browser and responsive testing.",
    role: "Senior Front-End Engineer · owner",
    team: "Owned it; worked with UX, product, Loft API vendor, and back-end",
    dates: "2019 – 2025",
    stack: ["Angular","Web Components","BFF APIs","Loft API"],
    problem: "Brands wanted a gift card balance check on any page without custom development each time.",
    whatIBuilt: ["Standalone Angular library component packaged as an embeddable web component.","Secure, configuration-driven theming for each brand.","Wired to BFF endpoints that broker Loft API requests server-side."],
    impact: ["Embeddable anywhere without bespoke development","Reused across brands through shared configuration"],
    thumbnail: "/images/projects/thumbnails/gift-card-desktop.webp",
    images: [
      "/images/projects/gift-card-balance.webp",
      "/images/projects/gift-card-desktop.webp",
      "/images/projects/gift-card-mobile.webp",
      "/images/projects/gift-card-wgr.webp"
    ],
    imageAlt:
      "Gift card balance check page with a gift card number input and a branded visual, shown across desktop and mobile layouts for multiple furniture brands.",
    link: "https://www.cardis.com/gift-card-balance",
    tags: ["html", "angular", "ecommerce", "scss", "css","javascript", "api-integrations", "ui-components"],
  },
  {
    id: "cross-sell-addon-slider",
    title: "Add‑On & Cross‑Sell Slider",
    summary:
      "Implemented a configurable add‑on slider to display complementary products on the PDP, standardizing cross‑sell UX across brands and improving attach‑rate potential.",
    description:
      "Built a reusable Angular library component that renders add‑on and cross‑sell product options in a compact, scrollable slider—optimized for mobile and scalable to desktop. Implemented lightweight, semantic HTML and maintainable SCSS, with per‑brand styling driven by configuration to support multiple client themes. Wired the component to Cross‑Sell BFF services to fetch eligible items and update selection state, including real‑time price updates as shoppers add or remove items. Validated responsive behavior and accessibility (keyboard/touch interactions, focus states, and readable semantics) to ensure a consistent experience across clients while supporting higher cross‑sell conversion.",
    thumbnail: "/images/projects/thumbnails/mobile-slider.webp",
    images: [
      "/images/projects/mobile-slider.webp",
      "/images/projects/slider-cardis.webp",
      "/images/projects/slider-morris.webp",
      "/images/projects/desktop-slider.webp"
    ],
    imageAlt:
      "Product detail page showing add-on sliders for mattress protectors, foundations, and frames with selectable options and price updates.",
    link: null,
    tags: ["html", "angular", "scss", "ecommerce", "css", "api-integrations", "ui-components", "accessibility"],
  },
  {
    id: "portfolio-redesign-nextjs",
    title: "Portfolio Redesign: Bootstrap → Next.js + Tailwind",
    summary:
      "Redesigned my personal portfolio from a Bootstrap/HTML/CSS/JavaScript site into a modern Next.js + Tailwind codebase as a structured learning project for React fundamentals, reusable component architecture, and state management.",
    description: "Rebuilt my portfolio as a hands-on React learning initiative. The original site featured a content-heavy layout and a custom two-flower homepage navigation built with Bootstrap, HTML, CSS, and JavaScript. The new version uses Next.js and Tailwind for a more modern, maintainable UI and is deployed with Vercel, while also serving as a practical way to deepen my understanding of React concepts such as component composition, props and state, hooks, and predictable UI state flows. I also used an AI agent to crawl my original portfolio, collect project and image content, and convert it into a structured JSON data source used to power the React components. See the before-and-after images below.",
    thumbnail: "/images/projects/thumbnails/portfolio-red.webp",
    images: [
      "/images/projects/old-portfolio.webp",
      "/images/projects/portfolio-redesign.webp"
    ],
    imageAlt:
      "See before and after: legacy portfolio with two-flower navigation concept (before) and the updated portfolio navigation layout (after).",
    link: null,
    extraLinks: [
      {
        label: "Git Code",
        href: "https://github.com/daisylaflamme/portfolio-nextjs",
      },
    ],
    tags: ["html", "nextjs", "react", "tailwind", "javascript", "ai", "css"],
  },
  {
    id: "product-card-redesign",
    title: "Pixel-Perfect Product Card Redesign (PLP)",
    summary:
      "Delivered a new, responsive product card system from Figma—implemented pixel-perfect across mobile, tablet, and desktop to modernize PLP browsing and improve shopping clarity.",
    description:
      "Partnered with a fellow UI engineer to implement a sleek new product card design directly from client Figma mockups, meeting a tight delivery timeline with a high-quality, pixel-accurate result. Built responsive layouts and interaction details across breakpoints (including pricing, badges, swatches, favorites, and merchandising cues) while maintaining clean, scalable front-end structure. Collaborated with a BFF engineer to align on API and data-shape updates needed to support the new UI, ensuring reliable rendering and consistent behavior across storefronts. The launch shipped with minimal iteration due to strong alignment with the mocks and careful execution, resulting in a polished browsing experience for customers.",
    role: "Senior Front-End Engineer",
    team: "Paired with a UI engineer; coordinated with a BFF engineer",
    dates: "2019 – 2025",
    stack: ["Angular","SCSS","Figma","BFF APIs"],
    problem: "The product listing pages needed a new product card from client Figma mockups on a tight timeline.",
    whatIBuilt: ["Pixel-accurate product cards from Figma across mobile, tablet, and desktop.","Pricing, badges, swatches, favorites, and merchandising cues in a scalable structure.","Aligned API and data-shape updates with the BFF engineer for reliable rendering."],
    impact: ["Shipped on a tight timeline with minimal iteration","Consistent behavior across storefronts"],
    thumbnail: "/images/projects/thumbnails/plp-asi.webp",
    images: [
      "/images/projects/product-card-design.webp",
      "/images/projects/plp-asi.webp",
    ],
    imageAlt:
      "Product listing page showing a redesigned product card layout with imagery, pricing, badges, and swatches, implemented responsively across devices.",
    link: null,
    tags: ["html", "ecommerce", "scss", "css", "angular", "api-integrations", "ui-components"],
  },
  {
    id: "custom-input-controls",
    title: "Reusable Checkbox & Radio Input Components (Multi-Brand)",
    summary:
      "Built shared Angular checkbox and radio components used across multiple storefronts and checkout flows, combining brand-configurable styling with strong accessibility and keyboard support.",
    description:"Implemented a reusable input-control library (checkbox + radio) to standardize form interactions across brands and use cases (delivery options, protection plans, payment selection, etc.). Components are configurable via Angular inputs for IDs/names, ARIA labeling, tab order, custom CSS classes, SVG sizing, and behavior toggles (e.g., preventing checkbox state changes while still emitting events). Added layout flexibility so teams can place the label/content on the left or right and control whether the checkbox/radio appears on the left or right—supporting different brand patterns and dense checkout layouts. Both controls support keyboard interaction (space/enter) and expose a clean API via a value + valueChange emitter pattern, while allowing rich label composition through ng-content slots. This delivered consistent UI behavior across multi-tenant themes with a maintainable, accessible foundation.",
    thumbnail: "/images/projects/thumbnails/checkbox-stn.webp",
    images: [
      "/images/projects/input.webp",
      "/images/projects/input-asi.webp",
      "/images/projects/input-cardis.webp",
      "/images/projects/input-morris.webp",
      "/images/projects/input-stn.webp",
      "/images/projects/checkbox-stn.webp"
    ],
    imageAlt:
      "Reusable checkbox and radio input components used across checkout and product flows, styled for multiple furniture brands.",
    link: null,
    tags: ["html", "angular", "ecommerce", "scss", "css","javascript", "ui-components", "accessibility"],
  },
  {
    id: "cookie-consent-multi-brand",
    title: "Cookie Consent & Preference Management",
    summary: "Implemented a reusable, CMS-driven cookie consent experience across multiple brands, integrating Termly and Google Tag Manager to enforce user preferences and support compliant analytics/marketing behavior across devices.",
    description: "Built a configurable cookie consent feature that can be deployed across multi-tenant storefronts via the CMS with consistent UX on mobile, tablet, and desktop. Implemented the UI with JavaScript, HTML, and CSS, supporting brand styling and flexible placement patterns. Integrated the Termly third-party consent banner and connected preference signals to site behavior so analytics, personalization, and marketing tags respect user choices. Configured Google Tag Manager to conditionally fire third-party JavaScript libraries based on consent state, aligning GTM triggers and tag settings with Termly categories to enable/disable cookies appropriately. Delivered a reliable consent workflow that improves compliance readiness while keeping the experience clear and unobtrusive for shoppers.",
    role: "Senior Front-End Engineer · owner",
    team: "Owned it; worked with UX, product, Termly, and back-end",
    dates: "2019 – 2025",
    stack: ["JavaScript","Termly","Google Tag Manager","CMS"],
    problem: "Every brand needed a consent experience that actually controls which analytics and marketing tags run.",
    whatIBuilt: ["CMS-deployable cookie consent UI with brand styling and flexible placement.","Integrated the Termly consent banner with site behavior and user preferences.","GTM triggers and tag settings aligned with Termly categories to fire tags by consent."],
    impact: ["Analytics and marketing tags respect user consent","One consent setup deployable to every brand through the CMS"],
    thumbnail: "/images/projects/thumbnails/cookie-sm.webp",
    images: ["/images/projects/cookie.webp", "/images/projects/cookie-tablet.webp", "/images/projects/wired-cookie.webp"],
    imageAlt: "Cookie consent UI and banner variants across multiple furniture brands, including a Termly-integrated preferences flow.",
    link: null,
    tags: ["html", "javascript", "css", "cms", "ecommerce", "api-integrations"],
  },
  {
    id: "finance-messaging-integrations",
    title: "Multi-Provider Financing Messages for PDP & Search",
    summary:
      "Integrated compliant third-party financing messages across product and search pages, enabling shoppers to understand payment options early and improving conversion into checkout across multiple brands.",
    description:
      "Implemented financing messaging integrations for Affirm, Unify, Charge After, Progressive Leasing, Acima, PayLater, and SetPay on high-traffic PDP and search/PLP experiences. Followed vendor documentation and legal display requirements to ensure accurate, compliant messaging (APR, term, eligibility language, and disclosure patterns). Wrapped vendor JavaScript SDKs and embed patterns into secure, standalone Angular library components that can be reused across multi-tenant brands via configuration-driven theming. Wired components to custom BFF APIs and client financing services to fetch the correct offer context (price, promos, location rules) and support interactive flows that guide users from browsing into financing qualification and checkout.",
    thumbnail: "/images/projects/thumbnails/fm-desktop.webp",
    images: [
      "/images/projects/finance-messages-mobile.webp",
      "/images/projects/fm-desktop.webp",
      "/images/projects/finance-messages-desktop.webp",
      "/images/projects/finance-messages-cardis-desktop.webp",
      "/images/projects/finance-messages-cardis.webp",
      "/images/projects/fm-morris.webp",
      "/images/projects/search-fm.webp"
    ],
    imageAlt:
      "Financing message components displayed on product and search pages across multiple furniture brands, including examples for Affirm and other payment providers.",
    link: null,
    tags: ["html", "angular", "javascript", "ecommerce", "scss", "css", "api-integrations", "payments"],
  },
  {
    id: "pizzeria-prototype-lovable",
    title: "Pizzeria Marketing Website Prototype (Lunch Specials Focus)",
    summary:
      "Created a polished marketing-site prototype for a local pizzeria to promote lunch specials and drive weekday lunch traffic through clear offers and strong visual storytelling.",
    description:
      "Used Lovable.dev to rapidly prototype a small-business website designed to increase lunch orders and present the brand professionally online. Structured the homepage around lunch specials, clear calls-to-action (order/call, view specials), credibility elements (testimonials, service highlights), and a visual menu gallery—optimized for quick scanning and conversion. Focused on layout hierarchy, promotional messaging, and a cohesive, modern look that a small business can use as a foundation for a production site.",
    thumbnail: "/images/projects/thumbnails/pizza.webp",
    images: ["/images/projects/pizza.webp"],
    imageAlt:
      "Pizzeria marketing homepage prototype highlighting lunch specials, calls to action, testimonials, and a photo gallery of menu items.",
    link: "https://quincy-pizza-pal.lovable.app",
    tags: ["small-business", "ai", "react"],
  },
  {
    id: "product-configuration",
    title: "Product Configuration",
    summary:
      "Delivered a configurable product page so shoppers can select product variants directly on the PDP.",
    description:
      "Worked in a senior dev team to add a major new product page feature that lets web users select different product configurations. Implemented Angular 6 components, templates, styles, and a reusable LESS architecture for consistent theming.",
    thumbnail: "/images/projects/thumbnails/asi-variant-pdp.webp",
    images: ["/images/projects/asi-variant-pdp.webp"],
    imageAlt:
      "Product configuration page showing a sofa with selectable color swatches and configuration options.",
    link:
      "https://www.americansignaturefurniture.com/product/group/living-room/seating/sectionals/campbell-cumulus-2-piece-sectional-with-right-facing-sofa-cement/2224589/2141781",
    tags: ["html", "angular", "css", "ecommerce", "scss"],
  },

  {
    id: "lovesac-asf-storefront-ui",
    title: "Lovesac & American Signature Storefront UI",
    summary: "Built and restyled key shopping surfaces for two furniture brands: search grids, swatches, filters, sign-in, and third-party widgets made to feel native.",
    description: "Worked in a team on Lovesac and American Signature Furniture storefronts. Added clickable color swatches to American Signature search results so shoppers can preview and switch product colors inline. Re-styled a third-party filter extension to match Lovesac's design system. Developed a responsive product grid used for Lovesac product lists, search pages, and landing pages, and re-styled and debugged a third-party chat widget so it matched the brand and worked reliably alongside the grid. Implemented a responsive Lovesac sign-in page from precise desktop and mobile mockups.",
    role: "Front-End Developer",
    dates: "Oct 2016 – Oct 2019",
    whatIBuilt: ["Clickable color swatches on search results so shoppers preview and switch colors inline.","Restyled a third-party filter extension to match Lovesac's design system.","Responsive product grid for Lovesac product lists, search, and landing pages.","Restyled and debugged a third-party chat widget to work alongside the grid.","Responsive sign-in page built from precise desktop and mobile mockups."],
    thumbnail: "/images/projects/thumbnails/lovesac-search-page-with-chat.webp",
    images: ["/images/projects/lovesac-search-page-with-chat.webp","/images/projects/asi-search-page-clickable-swatches-angular6.webp","/images/projects/lovesac-swatch-page.webp","/images/projects/lovesac-log-in-page.webp"],
    imageAlt: "Lovesac search results with a chat widget, American Signature search results with clickable swatches, Lovesac fabric filters, and the Lovesac sign-in page.",
    link: null,
    extraLinks: [{"label":"Lovesac search","href":"https://www.lovesac.com/search/modular-furniture/sectionals"},{"label":"Lovesac fabric filters","href":"https://www.lovesac.com/search/fabric"},{"label":"Lovesac sign-in","href":"https://www.lovesac.com/account/sign-in"},{"label":"American Signature search","href":"https://www.americansignaturefurniture.com/search/a/living-room/seating/sofas"}],
    tags: ["html","angular","javascript","ecommerce","scss","css","api-integrations"],
  },

  {
    id: "levin-dropship-checkout-responsive",
    title: "Responsive Multi-Step Checkout & Cart Experience",
    summary:
      "Implemented a responsive, multi-page cart-to-checkout experience for Levin Furniture—delivering consistent UI and UX flows across mobile, tablet, and desktop.",
    description:
      "Collaborated within an engineering team to translate detailed device-specific mockups into a unified, production-ready checkout journey. Built responsive layouts and interaction patterns for the cart and multi-step checkout, ensuring delivery preferences, forms, and order details remained clear, touch-friendly, and consistent across breakpoints. Focused on usability and conversion fundamentals—readable hierarchy, persistent cart context, and predictable navigation—while maintaining a scalable front-end implementation that supports ongoing enhancements.",
    thumbnail: "/images/projects/thumbnails/levin-dropship-checkout-page-iphoneX.webp",
    images: [
      "/images/projects/levin-dropship-checkout-page-iphoneX.webp",
      "/images/projects/levin-dropship-checkout-page-ipad.webp",
      "/images/projects/levin-dropship-checkout-page.webp",
      "/images/projects/levin-dropship-cart-page.webp"
    ],
    imageAlt:
      "Responsive Levin Furniture cart and multi-step checkout flow showing delivery options and order summaries across mobile, tablet, and desktop layouts.",
    link: null,
    tags: ["html", "ecommerce", "css", "scss","javascript","angular"],
  },



  {
    id: "multi-brand-store-locator",
    title: "Multi-Brand Store Locator Experience",
    summary:
      "Delivered responsive, SEO-friendly store locator experiences across multiple retail brands, improving location discoverability while maintaining brand-consistent UI patterns.",
    description:
      "Implemented and refined store locator UIs that combine searchable location listings with map-based browsing, optimized for responsiveness and search visibility. For Lovesac, led UI delivery while coordinating day-to-day work with a teammate to ensure consistent quality and timely execution. For American Signature Furniture, styled and integrated the locator experience to align with brand standards while keeping layouts fast, accessible, and easy to navigate. Across both implementations, focused on scalable UI patterns that support regional landing pages and help drive local store traffic.",
    thumbnail: "/images/projects/thumbnails/lovesac-store-locator.webp",
    images: [
      "/images/projects/lovesac-store-locator.webp",
      "/images/projects/asi-store-locator.webp"
    ],
    imageAlt:
      "Store locator pages for multiple brands showing responsive layouts with a map and a list of nearby store locations.",
    link: null,
    tags: ["html", "ecommerce", "javascript", "scss", "css", "api-integrations", "maps"],
  },

  {
    id: "promo-builder",
    title: "Promotion Builder for Cart Discounts",
    summary:
      "Delivered an internal promotion builder that enables non-technical teams to launch and manage sophisticated shopping-cart promotions through a guided UI—no engineering required for day-to-day updates.",
    description:
      "Collaborated with a senior engineering team to implement end-to-end UI workflows for creating shopping-cart promotions, from shell setup screens to advanced rule definition. Built configurable form experiences that support complex eligibility and discount logic while keeping the interface approachable for marketers. Implemented the front end in a mixed stack (AngularJS + Angular 6) and integrated with server-side services (C#) using scalable HTML and LESS patterns to ensure maintainability and consistent admin UX.",
    thumbnail: "/images/projects/thumbnails/hub-cart-promotion-shell.webp",
    images: [
      "/images/projects/hub-cart-promotion-shell.webp",
      "/images/projects/hub-cart-promotion-rules.webp"
    ],
    imageAlt:
      "Internal admin interfaces for managing shopping cart promotions, including promotion setup and rule configuration screens.",
    link: null,
    tags: ["html", "angular", "javascript", "ecommerce", "scss", "css", "api-integrations"],
  },

  {
    id: "cms-admin-tools",
    title: "CMS & Store Admin Tools for Non-Technical Teams",
    summary: "Built admin interfaces that let non-technical teams create landing pages, assemble reusable content sections, and maintain store location pages without developers.",
    description: "Worked in a team on the platform's admin tools for non-technical users. Delivered a page-builder UI for creating web pages, landing pages, and region-based home pages from layout and content blocks. Implemented a widget management interface that organizes reusable content sections so editors can assemble rich layouts without editing code. Enhanced the store admin used to add and edit store information, making location details, operating hours, and region-specific content easier to manage across a large store network.",
    whatIBuilt: ["Page builder for web pages, landing pages, and region-based home pages.","Widget manager listing reusable content sections editors assemble without code.","Store admin improvements for location details, hours, and region-specific content."],
    thumbnail: "/images/projects/thumbnails/hub-custom-page.webp",
    images: ["/images/projects/hub-custom-page.webp","/images/projects/hub-page-element-list-page.webp","/images/projects/hub-store-edit-page.webp"],
    imageAlt: "Admin screens: custom page builder, reusable page-element list, and store information editor.",
    link: null,
    tags: ["html","cms","ecommerce","scss","css","javascript","angular"],
  },



  // --- Cambridge / Zoom / GlobalU / KL / GPHomestay era ---

  {
    id: "cambridge-institute-web-properties",
    title: "Educational Websites & Integrations (Cambridge Institute)",
    summary: "As Web Content Manager, maintained and extended a network of up to 18 educational websites, including a WordPress migration, branded third-party portals, and a QuickBase-integrated registration form.",
    description: "Managed, updated, and optimized up to 18 educational websites for The Cambridge Institute of International Education. Maintained and evolved TheCambridgeNetwork.com marketing site with new content sections, refined navigation, and updated branding. Migrated a PHP-coded website into WordPress so non-developers could make updates, and maintained a WordPress orientation site for international students and their families. Built a registration form that posts directly into a QuickBase database, reducing manual data entry. Customized a Cornerstone-powered career site and the hosted Zoom classroom login to match company brand guidelines.",
    role: "Web Content Manager",
    team: "IT, Marketing, and HR teams",
    dates: "Feb 2016 – Sep 2016",
    stack: ["WordPress","PHP","JavaScript","jQuery","Bootstrap","QuickBase"],
    whatIBuilt: ["Maintained TheCambridgeNetwork.com: new content sections, refined navigation, updated branding.","Migrated a PHP-coded site to WordPress so non-developers could update it.","Maintained a WordPress orientation site for international students and families.","Registration form posting directly into QuickBase, reducing manual data entry.","Branded the Cornerstone career site and Zoom classroom login to company guidelines."],
    thumbnail: "/images/projects/thumbnails/thecambridgenetwork-home-page.webp",
    images: ["/images/projects/thecambridgenetwork-home-page.webp","/images/projects/tciie-for-students.webp","/images/projects/cambridge-orientation-en.webp","/images/projects/cambridge-orientation-registration-cn-and-database-integration-api.webp","/images/projects/the-cambridge-network-career-site.webp","/images/projects/sage-academics-online-classroom-login-page.webp"],
    imageAlt: "Cambridge Network marketing site, TCIIE WordPress site, orientation site, QuickBase registration form, career site, and branded Zoom classroom login.",
    link: null,
    tags: ["html","css","javascript","bootstrap","cms","wordpress","instructional-design","api-integrations"],
  },


  {
    id: "globalu-site-pages",
    title: "GlobalU Travel Site Pages & Responsive Templates",
    summary:
      "Delivered responsive GlobalU website templates by converting PSD designs into production-ready code, supporting new content pages and ongoing site enhancements.",
    description:
      "Implemented multiple GlobalU travel experiences by translating detailed PSD layouts into responsive, pixel-accurate front-end pages. Built key templates including tour listings, destination overviews, and individual itinerary pages, with a focus on clean typography, image-led storytelling, and mobile-friendly layout behavior. Also supported ongoing site maintenance and content updates, ensuring consistency across templates and a stable, cohesive user experience.",
    thumbnail: "/images/projects/thumbnails/globalu-home-page.webp",
    images: [
      "/images/projects/globalu-individual-itinarary.webp",
      "/images/projects/usa-page.webp",
      "/images/projects/globalu-tours.webp",
      "/images/projects/globalu-home-page.webp"
    ],
    imageAlt:
      "GlobalU travel site pages including tour listings, USA overview, and itinerary layouts built from PSD designs as responsive Bootstrap templates.",
    link: null,
    tags: ["html", "javascript", "css", "bootstrap"],
  },


  {
    id: "https-migration-kl",
    title: "Website HTTPS Migration",
    summary:
      "Led HTTP-to-HTTPS migration across multiple sites to improve security and SEO.",
    description:
      "Supported the migration of five websites from HTTP to HTTPS, addressing mixed-content issues and template updates. Helped improve security posture and search-engine friendliness across the portfolio.",
    thumbnail: "/images/projects/thumbnails/kl.webp",
    images: ["/images/projects/kl.webp"],
    imageAlt:
      "Website home page for KL Education after HTTPS migration.",
    link: "https://www.kleducation.org/",
    tags: ["html", "javascript", "instructional-design"],
  },


  {
    id: "wechat-raffle-game",
    title: "WeChat Raffle Game",
    summary:
      "Developed a mobile raffle game integrating jQuery UI with the WeChat SDK.",
    description:
      "Built a mobile raffle game using HTML, CSS, jQuery, and the WeChat API. The experience lets users spin for prizes on their phones while capturing engagement data for the event.",
    thumbnail:
      "/images/projects/thumbnails/raffle-smart-phone-wechat-application-development-sdk.webp",
    images: [
      "/images/projects/raffle-smart-phone-wechat-application-development-sdk.webp",
    ],
    imageAlt:
      "Mobile raffle game interface on a smartphone screen.",
    link: null,
    tags: ["html", "javascript", "css", "api-integrations"],
  },

  {
    id: "dragon-boat-campaign",
    title: "Dragon Boat Festival Campaign Landing Pages",
    summary:
      "Delivered a cohesive Dragon Boat Festival campaign experience with mobile-first landing pages and a complementary desktop microsite layout optimized for clarity, speed, and conversion.",
    description:
      "Built the front-end experience for a Dragon Boat Festival event campaign by implementing responsive landing pages designed to load quickly and communicate key details at a glance. Created a mobile-first layout with clear calls to action and concise content, then extended the campaign into a desktop-friendly microsite that preserved the visual identity while improving readability and information hierarchy on larger screens. Implemented the layouts with clean, responsive HTML and CSS to ensure consistent behavior across devices.",
    thumbnail: "/images/projects/thumbnails/dragon-boath-thank-you.webp",
    images: [
      "/images/projects/dragon.webp",
      "/images/projects/dragon-boat-festival-2016-landing-page.webp"
    ],
    imageAlt:
      "Dragon Boat Festival campaign landing pages showing mobile-first layouts and a desktop microsite with hero imagery and event details.",
    link: null,
    tags: ["html", "javascript", "css"],
  },


  {
    id: "gphomestay-digital-experiences",
    title: "GPHomestay Marketing, Content, and Lead Capture Experiences",
    summary:
      "Delivered responsive, conversion-focused web experiences for GPHomestay—spanning mobile content UX, paid-campaign landing pages, testimonial storytelling, CRM-integrated lead capture, and interactive customer quizzes.",
    description:
      "Contributed to the build and ongoing enhancement of GPHomestay.com by implementing key templates and interactive features that supported both marketing and program growth. Optimized a content-heavy blog for mobile readability with Bootstrap 3, created streamlined AdWords landing pages aligned with campaign messaging, and integrated a “Host Stories” testimonial layout into a custom WordPress theme for long-form content. Implemented a lead-generation form integrated with Salesforce and supporting database APIs to route inquiries into the CRM pipeline, and built a lightweight online quiz experience to collect user responses through an intuitive, guided UI. Supported site maintenance and iterative improvements to keep templates cohesive and performant.",
    role: "Web Content Manager",
    team: "IT, Marketing, and HR teams",
    dates: "Feb 2016 – Sep 2016",
    stack: ["WordPress","Bootstrap 3","JavaScript","Salesforce"],
    problem: "GPHomestay needed marketing pages and lead capture that fed inquiries straight into its CRM.",
    whatIBuilt: ["Mobile-readable content-heavy blog with Bootstrap 3.","AdWords landing pages aligned with campaign messaging.","“Host Stories” testimonial layout in a custom WordPress theme.","Lead form integrated with Salesforce to route inquiries into the CRM.","Guided online quiz collecting user responses."],
    impact: ["Inquiries routed directly into Salesforce","Landing pages matched to paid-campaign messaging"],
    thumbnail: "/images/projects/thumbnails/dev-gphomestay-home-page-july28-2016.webp",
    images: [
      "/images/projects/monetary-landing-page-a.webp",
      "/images/projects/gp-testimonials.webp",
      "/images/projects/gp-inqary-form-integration.webp",
      "/images/projects/dev-gphomestay-home-page-july28-2016.webp",
      "/images/projects/customer-quiz.webp"
    ],
    imageAlt:
      "GPHomestay digital experiences including a mobile-optimized blog, AdWords landing page, testimonial stories, Salesforce-integrated lead form, main site homepage, and an interactive online quiz.",
    link: null,
    tags: ["html", "cms", "bootstrap", "javascript", "css", "api-integrations", "wordpress"],
  },

  {
    id: "invite-education-prototypes",
    title: "Invite Education White-Label Student Platform Prototypes",
    summary:
      "Built front-end prototypes for a startup developing a white-label student guidance platform, collaborating with a San Francisco–based UX team to translate designs into clear, student-friendly experiences.",
    description:
      "Contributed to an early-stage product that supports employees and soon-to-be college students throughout the college application journey. Worked closely with a UX team based in San Francisco—collaborating remotely and on-site as needed—to iterate on layout, navigation, and information hierarchy. Implemented semantic HTML/CSS prototypes for the public-facing homepage and a “Student Passport” dashboard concept, focusing on clarity, approachable UI, and a foundation that could be handed off for production development.",
    thumbnail: "/images/projects/thumbnails/ie-home.webp",
    images: [
      "/images/projects/ie-home.webp",
      "/images/projects/ie-passport.webp"
    ],
    imageAlt:
      "Invite Education prototypes including a homepage concept and a student dashboard (“passport”) interface.",
    link: null,
    tags: ["html", "javascript", "css", "startup"],
  },

  {
    id: "umb-map-mooc",
    title: "Map-Based Learning Module for UMass Boston MOOC",
    summary:
      "Collaborated with UMass Boston’s Instructional Design team to build an interactive Google Maps learning module for an online course experience.",
    description:
      "Partnered with the Instructional Design department to design and implement an interactive map component used within a UMass Boston MOOC. Built a custom-styled Google Map that visualized course-related locations and supported guided exploration as part of the curriculum. Focused on a clear learner experience, intuitive interactions, and a maintainable implementation that could be reused and updated as the course evolved.",
    thumbnail: "/images/projects/thumbnails/umb-map.webp",
    images: ["/images/projects/umb-map.webp"],
    imageAlt:
      "Interactive Google Map module showing course-related markers used in an online learning experience.",
    link: null,//"http://www.daisylaflamme.net/umb-map/index.html",
    tags: ["html", "javascript", "instructional-design", "css", "bootstrap", "api-integrations", "maps"],
  },

  // 4) Casino Ballroom Support
  {
    id: "casino-ballroom-support",
    title: "Ballroom Support",
    summary:
      "Provided front-end support and UI adjustments for the Casino Ballroom web experience.",
    description:
      "Supported front-end updates and UI improvements for the Casino Ballroom website as part of an I-volutions project. Assisted with layout refinements, styling updates, and visual consistency efforts to enhance user experience for event visitors.",
    thumbnail: "/images/projects/thumbnails/cb.webp",
    images: ["/images/projects/cb.webp"],
    imageAlt: "Casino Ballroom website interface",
    link: "http://www.casinoballroom.com/",
    tags: ["html", "small-business", "css", "javascript"],
  },

  // 5) ClariLegal HTML Prototype
  {
    id: "clarilegal-prototype",
    title: "eDiscovery Application Prototype",
    summary:
      "Built HTML wireframes and interactive prototypes for an e-discovery startup’s workflow tools.",
    description:
      "Delivered HTML wireframes and user interface prototypes for ClariLegal, an e-discovery startup. The project included iterative UX planning, layout structuring, and early-stage interface implementation on top of a Django-based technology stack to support legal workflow visualization.",
    thumbnail: "/images/projects/thumbnails/cl-dashboard.webp",
    images: ["/images/projects/cl-dashboard.webp"],
    imageAlt: "ClariLegal HTML prototype dashboard",
    link: null,
    tags: ["html", "startup", "javascript", "css", "ux-design"],
  },

  // 6) UMass Boston Wireframes
  {
    id: "umb-open-data-ux-ui",
    title: "UMass Boston Open Data Analytics UX & UI",
    summary:
      "Delivered UX wireframes and implemented UI work for UMass Boston’s Open Data Analytics initiative, improving structure and accessibility for research-focused content.",
    description:
      "Created a complete set of UX wireframes for the Open Data Analytics website, including user-flow planning, page-level layouts, and structured interface sketches to guide how academic and analytical content would be presented. Contributed to the site’s UI implementation by refining layouts and content structure to support clarity, accessibility, and engagement for academic and community users.",
    thumbnail: "/images/projects/thumbnails/odai.webp",
    images: [
      "/images/projects/odai-wireframes.webp",
      "/images/projects/odai.webp"
    ],
    imageAlt:
      "UMass Boston Open Data Analytics wireframes and the implemented website UI showcasing research and analytical content.",
    link: "http://photography.daisylaflamme.net/wireframes.pdf",
    tags: ["html", "instructional-design", "javascript", "css", "bootstrap", "cms", "accessibility", "ux-design"],
  },

  // 8) Boston Strategics
  {
    id: "boston-strategics",
    title: "WordPress Website for Startup (Boston Strategics)",
    summary:
      "Collaborated with the Boston Strategics team to build and iteratively refine a WordPress website that established their startup’s online presence and enabled the staff to manage content confidently.",
    description:
      "Partnered closely with the company team to define requirements, iterate on page layouts and messaging, and deliver a polished WordPress marketing site aligned with evolving business needs. Implemented maintainable page templates and a clear content structure, then trained staff on day-to-day updates (editing pages, publishing content, and basic site management) to reduce reliance on engineering. Provided ongoing maintenance and enhancements to keep the site stable, current, and aligned with the company’s growth.",
    thumbnail: "/images/projects/thumbnails/bs2.webp",
    images: ["/images/projects/bs2.webp", "/images/projects/bs.webp"],
    imageAlt: "Boston Strategics WordPress website and supporting design concepts.",
    link: null,
    tags: ["html", "cms", "startup", "css", "bootstrap", "wordpress"],
  },

  // 9) Bioarray Therapeutics
  {
    id: "bioarray-site",
    title: "Bioarray Site Maintenance",
    summary:
      "Updated content and front-end layout for Bioarray Therapeutics’ corporate website.",
    description:
      "Implemented content updates and front-end refinements for the Bioarray Therapeutics corporate website. Work included adjusting page structures, improving readability, and aligning the layout with branding needs while preparing for future content expansion.",
    thumbnail: "/images/projects/thumbnails/bioarray.webp",
    images: ["/images/projects/bioarray.webp"],
    imageAlt: "Bioarray Therapeutics website layout",
    link: null,
    tags: ["html", "small-business", "css", "javascript","bootstrap","cms"],
  },

  // 10) Refuge Place International
  {
    id: "refuge-place",
    title: "Refuge Place International WordPress Website",
    summary:
      "Volunteered to develop Refuge Place International’s WordPress website, including a PayPal-powered donation flow that supported fundraising efforts to help build a hospital in Liberia for women and children.",
    description:
      "Volunteered as a web developer for Refuge Place International by building and enhancing their WordPress site with customized templates, selected plug-ins, and API-powered features. Implemented a dedicated donation page wired to PayPal to streamline contributions, and optimized the editing experience so staff could update content with minimal friction. Delivered a stable, mission-aligned online presence that supported community outreach and fundraising initiatives.",
    thumbnail: "/images/projects/thumbnails/00.webp",
    images: ["/images/projects/00.webp"],
    imageAlt:
      "Refuge Place International WordPress website with donation and mission-focused content.",
    link: null,
    tags: ["html", "cms", "volunteer", "css", "bootstrap","javascript", "api-integrations", "payments", "wordpress"],
  },

  // 11) GlobalPeace Aid
  {
    id: "globalpeace-aid",
    title: "Global Peace Aid Nonprofit WordPress Website",
    summary:
      "Volunteered to build and maintain Global Peace Aid’s WordPress website, strengthening their online presence and supporting fundraising and outreach—helping position the organization to secure $100K in state grants for global peace and conflict resolution initiatives.",
    description:
      "Volunteered as the web lead for Global Peace Aid by developing and maintaining their WordPress site end-to-end. Managed website hosting and ongoing site operations, implemented key pages and flows including a PayPal donation experience and events content, and maintained the organization’s content assets to keep messaging accurate and up to date. Integrated tools such as Google APIs and analytics to support outreach and visibility, delivering a reliable, brand-aligned online presence that supported fundraising efforts and strengthened credibility for grant opportunities.",
    thumbnail: "/images/projects/thumbnails/7.webp",
    images: ["/images/projects/7.webp"],
    imageAlt: "Global Peace Aid nonprofit WordPress website with donation and events information.",
    link: null,
    tags: ["html", "cms", "volunteer", "css", "bootstrap","javascript", "api-integrations", "payments", "wordpress"],
  },
  {
    id: "js-girls-platform",
    title: "JavaScript Learning Platform",
    summary:
      "Built an interactive JavaScript learning platform designed to engage early learners—especially girls—through visual, simplified, and confidence-building content.",
    description:
      "Created a full instructional platform for early learners as part of my Digital Media Instructor master’s thesis, focusing on increasing girls’ participation in technology. The system included a left-navigation tutorial structure and dynamic right-panel concept modals that broke down JavaScript, HTML, and CSS into approachable, highly visual lessons. I designed and authored tutorials for all major JavaScript fundamentals, integrating UX patterns that support young learners—clear pacing, simplified language, welcoming visuals, and scaffolded exercises. The platform demonstrated how thoughtful UI, tone, and educational design can make core programming concepts feel accessible, intuitive, and exciting for middle-school–level students.",
    thumbnail: "/images/projects/thumbnails/jsgirls-small.webp",
    images: ["/images/projects/jsgirls2.webp"],
    imageAlt:
      "UI screens from a JavaScript learning platform for young female learners, featuring tutorials and concept modals.",
    link: null,
    tags: ["html", "javascript", "css", "instructional-design", "bootstrap"],
  },
  {
    id: "photo-portfolio",
    title: "Photography Portfolio",
    summary:
      "Built a photography portfolio site to showcase curated work in a clean, responsive layout.",
    description:
      "Created a standalone photography portfolio site with a clean, responsive layout for browsing images. Focused on image presentation, simple navigation, and minimal chrome so the photos remain the primary focus.",
    thumbnail: "/images/projects/thumbnails/photography-small.webp",
    images: ["/images/projects/photography.webp"],
    imageAlt:
      "Grid of photography thumbnails on a clean portfolio page.",
    link:
      "http://photography.daisylaflamme.net/portfolio.html",
    tags: ["html", "javascript", "css", "bootstrap"],
  },
  {
    id: "hci-mockup",
    title: "Human-Computer Interaction Mockups",
    summary:
      "Produced a comprehensive interface mockup as part of a Human–Computer Interaction course.",
    description:
      "Created a comprehensive interface mockup for a Human–Computer Interaction project. Focused on user flows, layout, and visual hierarchy to demonstrate best practices in usable design.",
    thumbnail: "/images/projects/thumbnails/validity.webp",
    images: ["/images/projects/validity.webp"],
    imageAlt:
      "Complex application mockup created for an HCI project.",
    link: null,
    tags: ["instructional-design", "ux-design"],
  },
   {
    id: "flyer-design",
    title: "Cape Cod Small Business Website for Flyer Services",
    summary:
      "Built a simple, professional website to strengthen a Cape Cod small business’s online presence and help attract new clients who need event flyers.",
    description:
      "Designed and implemented a lightweight, mobile-friendly site for a local flyer-design business, focusing on credibility and lead generation. Organized the layout to showcase sample flyer work, communicate services clearly, and make it easy for potential customers to contact the business. Prioritized clean typography, strong visual hierarchy, and a polished presentation so the owner could stand out locally and convert visitors into new clients.",
    thumbnail: "/images/projects/thumbnails/mariya.webp",
    images: ["/images/projects/mariya.webp"],
    imageAlt:
      "Small business website showcasing event flyer design services and sample flyer work.",
    link: "http://mariyaholbrook.daisylaflamme.net",
    tags: ["html", "small-business", "javascript", "css", "bootstrap"],
  },

  // 2) Student Resume Portfolio
  {
    id: "student-portfolio",
    title: "IT Portfolio",
    summary:
      "Built a responsive student resume and project portfolio showcasing academic work and design capabilities.",
    description:
      "Designed and developed a responsive digital resume and project portfolio to showcase academic achievements and early professional work. The layout was crafted for clarity and ease of navigation, highlighting the student's strengths through structured sections and cohesive visual presentation.",
    thumbnail: "/images/projects/thumbnails/puhi.webp",
    images: ["/images/projects/puhi.webp"],
    imageAlt: "Student resume and project portfolio screenshot",
    link: null,
    tags: ["html", "javascript", "css", "bootstrap"],
  },

  // 3) Mobile Joomla Portfolio App
  {
    id: "mobile-joomla-portfolio",
    title: "Mobile Portfolio",
    summary:
      "Developed a mobile-optimized Joomla portfolio designed specifically for smartphones.",
    description:
      "Created a mobile-friendly web portfolio using Joomla, optimized exclusively for smartphone screens. The project included custom template adjustments, lightweight layouts, and simplified navigation to deliver an app-like browsing experience while preserving the portfolio’s visual identity.",
    thumbnail: "/images/projects/thumbnails/i2.webp",
    images: ["/images/projects/i2.webp"],
    imageAlt: "Mobile Joomla portfolio interface",
    link: null,
    tags: ["html", "cms", "javascript", "css"],
  },

  // 12) Scratch Game Development
  // {
  //   id: "scratch-game",
  //   title: "Scratch Game",
  //   summary:
  //     "Built an interactive Scratch-based educational game featuring custom animations.",
  //   description:
  //     "Designed and implemented an interactive educational game using Scratch, combining simple animations, character interactions, and playful mechanics. The project demonstrates early programming logic and an understanding of user engagement through animated storytelling.",
  //   thumbnail: "/images/projects/thumbnails/8.webp",
  //   images: ["/images/projects/8.webp"],
  //   imageAlt: "Scratch-based educational game with animated characters",
  //   link: "http://scratch.mit.edu/projects/desislava/2778494"
  // },
];

/**
 * Display order for the "Featured Engineering Work" section on /web-projects.
 * Any project whose id is not listed here appears under "Earlier Web & UI Work",
 * in its order within `projects`.
 */
export const featuredProjectIds = [
  "checkout-multi-payments",
  "store-details-maps",
  "blueport-multisite-platform-ui",
  "angular-modal-system",
  "cms-hero-carousel",
  "cookie-consent-multi-brand",
  "product-card-redesign",
  "gift-card-balance-widget",
  "gifspark-ai-greeting-app",
  "gphomestay-digital-experiences",
];