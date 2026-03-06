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
//     thumbnail: "/images/projects/thumbnails/asi-variant-pdp.png",
//     images: ["/images/projects/asi-variant-pdp.png",
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
    thumbnail: "/images/projects/thumbnails/masonry-collage.jpg",
    images: [
      "/images/projects/masonry-collage.jpg"
    ],
    imageAlt:
      "Masonry collage of multi-brand e-commerce UI work: mobile navigation, PDPs, cart and checkout pages, search grids, content editor layouts, and marketing modules across multiple furniture storefronts.",
    link: null,
  },
  {
    id: "checkout-multi-payments",
    title: "Multi‑Payment Checkout Enablement",
    summary:
      "Enabled enterprise furniture eCommerce brands to offer flexible checkout options by integrating multiple payment providers end‑to‑end.",
    description:
      "Led front‑end integration of a multi‑provider payment ecosystem across checkout (Payment → Review → Thank You pages) for multiple client storefronts. Implemented and standardized integrations for Acima, Affirm, PayLater, Progressive Leasing, SetPay, ChargeAfter, credit/debit cards, and gift cards—expanding customer choice and improving conversion potential. Wrapped complex vendor JavaScript SDKs / npm packages into secure, reusable Angular library components with configuration‑driven feature flags so the same codebase could be safely shared across brands. Coordinated UI state, validation, and async payment authorization flows, wiring components to BFF endpoints (tokenization, order totals, promotions, financing eligibility, and payment capture) to keep sensitive logic server‑side while delivering a seamless, responsive, cross‑browser experience across mobile, tablet, and desktop.",
    thumbnail: "/images/projects/thumbnails/payment-morris.jpg",
    images: [
      "/images/projects/payment.png",
      "/images/projects/payment-affirm.png",
      "/images/projects/payment-ca.png",
      "/images/projects/payment-credit-card.png",
      "/images/projects/payment-mobile.png",
      "/images/projects/payment-morris.png",
      "/images/projects/payment-progressive.png",
      "/images/projects/split-payment2.png"
    ],
    imageAlt:
      "Checkout payment step showing multiple payment methods (credit/debit, Affirm, financing, and lease-to-own) across desktop and mobile flows.",
    link: null,
  },
  {
    id: "store-details-maps",
    title: "Store Details Maps Modernization",
    summary:
      "Owned a full end‑to‑end migration of store‑locator maps across multiple brands—reducing annual mapping costs by ~80% while improving UX and brand consistency.",
    description:
      "Drove the initiative from discovery to delivery: evaluated map platform options, created a clear decision matrix for leadership, and aligned stakeholders on the recommended approach. Implemented a shared Angular base component that supports Mapbox and OpenStreetMap, with secure, configuration‑driven branding (custom pin colors, styles, and per‑brand toggles) reusable across all storefronts. Added a custom store‑type legend (e.g., Furniture Store vs Mattress Store) and ensured accessible, responsive behavior across devices. Partnered with QA and UX to validate interactions, edge cases, and performance, and delivered a production‑ready rollout with thorough testing and release support.",
    thumbnail: "/images/projects/thumbnails/store-details.jpg",
    images: [
      "/images/projects/store-details.png",
      "/images/projects/store-details-stn.png",
      "/images/projects/store-details-rana.png",
      "/images/projects/store-details-wgr.png"
    ],
    imageAlt:
      "Store details pages showing an interactive map with a branded location pin, nearby store results, and a store-type legend across multiple furniture brands.",
    link: "https://www.morrisathome.com/store/furniture-store/OH/Reynoldsburg/2339-Taylor-Park-Drive",
  },
  {
    id: "cms-hero-carousel",
    title: "CMS‑Driven Hero Carousel Widget",
    summary:
      "Built a reusable, plug‑and‑play hero carousel that lets non‑technical teams publish and manage homepage marketing content through the CMS—without code changes.",
    description:
      "Architected and delivered a configurable carousel widget that can be dropped into any client landing page or custom homepage layout. Integrated the Tiny‑Slider JavaScript library and wrapped it in a maintainable component pattern with CMS‑controlled content (images, slide order, links, and placement) so marketing teams could self‑serve updates. Optimized layout, touch interactions, and loading behavior for mobile, tablet, and desktop, and validated quality through cross‑browser and responsive testing. This unlocked faster campaign launches and improved homepage engagement by keeping featured promotions fresh across multiple brands.",
    thumbnail: "/images/projects/thumbnails/carousel-desktop.jpg",
    images: [
      "/images/projects/carousel-desktop.jpg",
      "/images/projects/carousel-tablet.jpg",
      "/images/projects/carousel-iphone.jpg"
    ],
    imageAlt:
      "Homepage hero carousel displaying promotional banners across desktop, tablet, and mobile breakpoints.",
    link: "https://www.cardis.com/",
  },
  {
    id: "angular-modal-system",
    title: "Configurable Modal System for Checkout and UX Flows",
    summary:
      "Built a reusable, accessibility‑first modal system with multiple interaction patterns, enabling teams to standardize UX while meeting brand and ADA requirements.",
    description:
      "Architected a shared modal library in Angular to support common client interaction needs across high‑traffic eCommerce flows. Delivered multiple modal variants—including a lightweight info/lightbox modal for gated selections, a full‑width takeover modal for maximum focus, a header‑anchored modal with precise positioning and partial overlay, and a slide‑in side modal for smooth, non‑blocking experiences. Implemented configurable behavior via Angular inputs (layout, size, overlay, focus handling, and close rules) and validated keyboard navigation, focus trapping, screen‑reader semantics, and responsive behavior to align with ADA/WCAG expectations. This standardized UI patterns across brands while keeping implementations consistent, configurable, and easy to adopt.",
    thumbnail: "/images/projects/thumbnails/header-modal.jpg",
    images: [
      "/images/projects/full-modal.png",
      "/images/projects/header-modal.png",
      "/images/projects/mobile-header-modal.png",
      "/images/projects/info-modal.png",
      "/images/projects/side-modal.png"
    ],
    imageAlt:
      "Examples of reusable modal patterns, including full-page takeover, header-anchored, informational lightbox, and side-drawer modals.",
    link: null,
  },
  {
    id: "gift-card-balance-widget",
    title: "Gift Card Balance Checker Widget",
    summary:
      "Built a plug‑and‑play gift card balance checker as a reusable web component, enabling multiple brands to add the feature anywhere on their websites with consistent UX across devices.",
    description:
      "Architected and implemented a standalone Angular library component packaged as a web component so client teams could embed a gift card balance check on any custom page without bespoke development. Integrated secure, configuration‑driven theming for brand consistency and delivered a seamless mobile, tablet, and desktop experience. Wired the front end to BFF endpoints that broker requests to the Loft API, keeping sensitive integrations server‑side while providing fast, reliable balance lookups. Supported multi‑brand reuse through shared configuration, robust validation, and thorough cross‑browser and responsive testing.",
    thumbnail: "/images/projects/thumbnails/gift-card-desktop.jpg",
    images: [
      "/images/projects/gift-card-balance.png",
      "/images/projects/gift-card-desktop.png",
      "/images/projects/gift-card-mobile.png",
      "/images/projects/gift-card-wgr.png"
    ],
    imageAlt:
      "Gift card balance check page with a gift card number input and a branded visual, shown across desktop and mobile layouts for multiple furniture brands.",
    link: "https://www.cardis.com/gift-card-balance",
  },
  {
    id: "cross-sell-addon-slider",
    title: "Add‑On & Cross‑Sell Slider",
    summary:
      "Implemented a configurable add‑on slider to display complementary products on the PDP, standardizing cross‑sell UX across brands and improving attach‑rate potential.",
    description:
      "Built a reusable Angular library component that renders add‑on and cross‑sell product options in a compact, scrollable slider—optimized for mobile and scalable to desktop. Implemented lightweight, semantic HTML and maintainable SCSS, with per‑brand styling driven by configuration to support multiple client themes. Wired the component to Cross‑Sell BFF services to fetch eligible items and update selection state, including real‑time price updates as shoppers add or remove items. Validated responsive behavior and accessibility (keyboard/touch interactions, focus states, and readable semantics) to ensure a consistent experience across clients while supporting higher cross‑sell conversion.",
    thumbnail: "/images/projects/thumbnails/mobile-slider.jpg",
    images: [
      "/images/projects/mobile-slider.png",
      "/images/projects/slider-cardis.png",
      "/images/projects/slider-morris.png",
      "/images/projects/desktop-slider.png"
    ],
    imageAlt:
      "Product detail page showing add-on sliders for mattress protectors, foundations, and frames with selectable options and price updates.",
    link: null,
  },
  {
    id: "product-configuration",
    title: "Product Configuration",
    summary:
      "Delivered a configurable product page so shoppers can select product variants directly on the PDP.",
    description:
      "Worked in a senior dev team to add a major new product page feature that lets web users select different product configurations. Implemented Angular 6 components, templates, styles, and a reusable LESS architecture for consistent theming.",
    thumbnail: "/images/projects/thumbnails/asi-variant-pdp.png",
    images: ["/images/projects/asi-variant-pdp.png"],
    imageAlt:
      "Product configuration page showing a sofa with selectable color swatches and configuration options.",
    link:
      "https://www.americansignaturefurniture.com/product/group/living-room/seating/sectionals/campbell-cumulus-2-piece-sectional-with-right-facing-sofa-cement/2224589/2141781",
  },

  {
    id: "clickable-swatches",
    title: "Clickable Swatches",
    summary:
      "Implemented clickable color swatches on search results to make browsing variants faster and more visual.",
    description:
      "Worked in a team to add interactive functionality to color swatches on the search page. Enhanced the product grid so shoppers can preview and switch product colors inline, while also improving how search results are presented.",
    thumbnail:
      "/images/projects/thumbnails/asi-search-page-clickable-swatches-angular6.png",
    images: ["/images/projects/asi-search-page-clickable-swatches-angular6.png"],
    imageAlt:
      "Furniture search results page with clickable color swatches on each product card.",
    link:
      "https://www.americansignaturefurniture.com/search/a/living-room/seating/sofas",
  },

  {
    id: "filter-restyling",
    title: "Filter Restyling",
    summary:
      "Re-styled a third-party filter experience to align with Lovesac branding and improve usability.",
    description:
      "Re-styled a third-party filter extension for Lovesac so it matched the brand’s design system and felt native to the site. Focused on clearer filter states, typography, and layout to make product discovery smoother for shoppers.",
    thumbnail: "/images/projects/thumbnails/lovesac-swatch-page.png",
    images: ["/images/projects/lovesac-swatch-page.png"],
    imageAlt:
      "Product browse page showing fabric filter controls and large swatch grid.",
    link: "https://www.lovesac.com/search/fabric",
  },
  {
    id: "levin-dropship-checkout-responsive",
    title: "Responsive Multi-Step Checkout & Cart Experience",
    summary:
      "Implemented a responsive, multi-page cart-to-checkout experience for Levin Furniture—delivering consistent UI and UX flows across mobile, tablet, and desktop.",
    description:
      "Collaborated within an engineering team to translate detailed device-specific mockups into a unified, production-ready checkout journey. Built responsive layouts and interaction patterns for the cart and multi-step checkout, ensuring delivery preferences, forms, and order details remained clear, touch-friendly, and consistent across breakpoints. Focused on usability and conversion fundamentals—readable hierarchy, persistent cart context, and predictable navigation—while maintaining a scalable front-end implementation that supports ongoing enhancements.",
    thumbnail: "/images/projects/thumbnails/levin-dropship-checkout-page-iphoneX.png",
    images: [
      "/images/projects/levin-dropship-checkout-page-iphoneX.png",
      "/images/projects/levin-dropship-checkout-page-ipad.png",
      "/images/projects/levin-dropship-checkout-page.png",
      "/images/projects/levin-dropship-cart-page.png"
    ],
    imageAlt:
      "Responsive Levin Furniture cart and multi-step checkout flow showing delivery options and order summaries across mobile, tablet, and desktop layouts.",
    link: null,
  },

  {
    id: "search-grid-chat",
    title: "Search Grid Chat",
    summary:
      "Developed a responsive product grid and integrated a third-party chat widget on Lovesac search pages.",
    description:
      "Developed and styled a responsive product grid used for product lists, search pages, and landing pages at Lovesac. Re-styled and debugged a third-party chat widget to match the site’s branding and ensure it worked reliably alongside the product layout.",
    thumbnail:
      "/images/projects/thumbnails/lovesac-search-page-with-chat.png",
    images: ["/images/projects/lovesac-search-page-with-chat.png"],
    imageAlt:
      "Lovesac search results page showing sectional products and a floating chat widget.",
    link: "https://www.lovesac.com/search/modular-furniture/sectionals",
  },

  {
    id: "login-page",
    title: "Login Page",
    summary:
      "Implemented a responsive, brand-aligned account login page from precise desktop and mobile mockups.",
    description:
      "Given very specific desktop and mobile mockups, implemented and styled a responsive user login page for Lovesac. Focused on clear hierarchy, accessible form controls, and a layout that feels consistent across devices.",
    thumbnail: "/images/projects/thumbnails/lovesac-log-in-page.png",
    images: ["/images/projects/lovesac-log-in-page.png"],
    imageAlt:
      "Lovesac customer sign-in page with email and password form fields.",
    link: "https://www.lovesac.com/account/sign-in",
  },

  {
    id: "multi-brand-store-locator",
    title: "Multi-Brand Store Locator Experience",
    summary:
      "Delivered responsive, SEO-friendly store locator experiences across multiple retail brands, improving location discoverability while maintaining brand-consistent UI patterns.",
    description:
      "Implemented and refined store locator UIs that combine searchable location listings with map-based browsing, optimized for responsiveness and search visibility. For Lovesac, led UI delivery while coordinating day-to-day work with a teammate to ensure consistent quality and timely execution. For American Signature Furniture, styled and integrated the locator experience to align with brand standards while keeping layouts fast, accessible, and easy to navigate. Across both implementations, focused on scalable UI patterns that support regional landing pages and help drive local store traffic.",
    thumbnail: "/images/projects/thumbnails/lovesac-store-locator.png",
    images: [
      "/images/projects/lovesac-store-locator.png",
      "/images/projects/asi-store-locator.png"
    ],
    imageAlt:
      "Store locator pages for multiple brands showing responsive layouts with a map and a list of nearby store locations.",
    link: null,
  },

  {
    id: "promo-builder",
    title: "Promotion Builder for Cart Discounts",
    summary:
      "Delivered an internal promotion builder that enables non-technical teams to launch and manage sophisticated shopping-cart promotions through a guided UI—no engineering required for day-to-day updates.",
    description:
      "Collaborated with a senior engineering team to implement end-to-end UI workflows for creating shopping-cart promotions, from shell setup screens to advanced rule definition. Built configurable form experiences that support complex eligibility and discount logic while keeping the interface approachable for marketers. Implemented the front end in a mixed stack (AngularJS + Angular 6) and integrated with server-side services (C#) using scalable HTML and LESS patterns to ensure maintainability and consistent admin UX.",
    thumbnail: "/images/projects/thumbnails/hub-cart-promotion-shell.png",
    images: [
      "/images/projects/hub-cart-promotion-shell.png",
      "/images/projects/hub-cart-promotion-rules.png"
    ],
    imageAlt:
      "Internal admin interfaces for managing shopping cart promotions, including promotion setup and rule configuration screens.",
    link: null,
  },

  {
    id: "page-builder",
    title: "Page Builder",
    summary:
      "Built page-builder tools that let non-technical users create and localize landing pages.",
    description:
      "Worked in a team to deliver a UI for non-technical users that enables them to create web pages, landing pages, and region-based home pages. The tool abstracts layout and content blocks so marketing teams can publish pages without direct developer involvement.",
    thumbnail: "/images/projects/thumbnails/hub-custom-page.png",
    images: ["/images/projects/hub-custom-page.png"],
    imageAlt:
      "Custom page builder UI showing layout configuration and content blocks.",
    link: null,
  },

  {
    id: "content-sections",
    title: "Widget Management Dashboard",
    summary:
      "Created interfaces for managing reusable widgets across CMS-driven web pages.",
    description:
      "Worked in a team that implemented a UI for non-technical users to add custom content sections to web pages. The interface organizes reusable elements into a list so editors can assemble rich layouts without editing code.",
    thumbnail:
      "/images/projects/thumbnails/hub-page-element-list-page.png",
    images: ["/images/projects/hub-page-element-list-page.png"],
    imageAlt:
      "Admin UI listing reusable page elements and content sections.",
    link: null,
  },

  {
    id: "store-content-admin",
    title: "Store Admin",
    summary:
      "Improved store content management so editors can maintain location pages more efficiently.",
    description:
      "Enhanced the content management UI used to add and edit store information on store web pages. The updates make it easier for editors to manage location details, operating hours, and region-specific content across a large store network.",
    thumbnail:
      "/images/projects/thumbnails/hub-store-edit-page.png",
    images: ["/images/projects/hub-store-edit-page.png"],
    imageAlt:
      "Admin edit screen showing form fields for managing store information.",
    link: null,
  },

  // --- Cambridge / Zoom / GlobalU / KL / GPHomestay era ---

  {
    id: "zoom-branding",
    title: "Zoom Integration",
    summary:
      "Aligned Zoom’s hosted classroom login with company brand guidelines for a consistent experience.",
    description:
      "Integrated Zoom’s online classroom login with the company’s branding style guides. Customized the look and feel so students experience a seamless transition between marketing sites and the hosted Zoom environment.",
    thumbnail:
      "/images/projects/thumbnails/sage-academics-online-classroom-login-page.jpg",
    images: ["/images/projects/sage-academics-online-classroom-login-page.jpg"],
    imageAlt:
      "Custom-branded Zoom classroom login page for Sage Academics.",
    link: "https://thecambridgenetwork.zoom.us/",
  },

  {
    id: "tciie-migration",
    title: "WordPress Migration",
    summary:
      "Migrated a legacy PHP site into WordPress while preserving content and improving maintainability.",
    description:
      "Handled the migration of a PHP-coded website into a modern WordPress implementation. Recreated page layouts, moved content, and configured themes so future updates could be done more easily by non-developers.",
    thumbnail: "/images/projects/thumbnails/tciie-for-students.jpg",
    images: ["/images/projects/tciie-for-students.jpg"],
    imageAlt:
      "WordPress site for TCIIE showing a student-focused layout.",
    link: null,
  },

  {
    id: "globalu-site-pages",
    title: "GlobalU Travel Site Pages & Responsive Templates",
    summary:
      "Delivered responsive GlobalU website templates by converting PSD designs into production-ready code, supporting new content pages and ongoing site enhancements.",
    description:
      "Implemented multiple GlobalU travel experiences by translating detailed PSD layouts into responsive, pixel-accurate front-end pages. Built key templates including tour listings, destination overviews, and individual itinerary pages, with a focus on clean typography, image-led storytelling, and mobile-friendly layout behavior. Also supported ongoing site maintenance and content updates, ensuring consistency across templates and a stable, cohesive user experience.",
    thumbnail: "/images/projects/thumbnails/globalu-home-page.jpg",
    images: [
      "/images/projects/globalu-individual-itinarary.jpg",
      "/images/projects/usa-page.jpg",
      "/images/projects/globalu-tours.jpg",
      "/images/projects/globalu-home-page.jpg"
    ],
    imageAlt:
      "GlobalU travel site pages including tour listings, USA overview, and itinerary layouts built from PSD designs as responsive Bootstrap templates.",
    link: null,
  },

  {
    id: "cornerstone-careers",
    title: "Cornerstone Career Website",
    summary:
      "Implemented a branded Cornerstone career site that matches the company’s main web presence.",
    description:
      "Delivered front-end development and branding integration for a Cornerstone-powered career site. Customized templates and styles so the job-search experience feels fully aligned with the main company website.",
    thumbnail:
      "/images/projects/thumbnails/the-cambridge-network-career-site.jpg",
    images: ["/images/projects/the-cambridge-network-career-site.jpg"],
    imageAlt:
      "Company career site listing open positions and search filters.",
    link: null,
  },

  {
    id: "https-migration-kl",
    title: "Website HTTPS Migration",
    summary:
      "Led HTTP-to-HTTPS migration across multiple sites to improve security and SEO.",
    description:
      "Supported the migration of five websites from HTTP to HTTPS, addressing mixed-content issues and template updates. Helped improve security posture and search-engine friendliness across the portfolio.",
    thumbnail: "/images/projects/thumbnails/kl.jpg",
    images: ["/images/projects/kl.jpg"],
    imageAlt:
      "Website home page for KL Education after HTTPS migration.",
    link: "https://www.kleducation.org/",
  },

  {
    id: "cambridge-network-site",
    title: "Cambridge Network Marketing Website",
    summary:
      "Maintained and evolved the main Cambridge Network marketing site.",
    description:
      "Handled website development, maintenance, and updates for TheCambridgeNetwork.com. Added new content sections, refined navigation, and ensured the site stayed aligned with evolving branding.",
    thumbnail:
      "/images/projects/thumbnails/thecambridgenetwork-home-page.jpg",
    images: ["/images/projects/thecambridgenetwork-home-page.jpg"],
    imageAlt:
      "The Cambridge Network marketing home page.",
    link: null
  },

  {
    id: "wechat-raffle-game",
    title: "WeChat Raffle Game",
    summary:
      "Developed a mobile raffle game integrating jQuery UI with the WeChat SDK.",
    description:
      "Built a mobile raffle game using HTML, CSS, jQuery, and the WeChat API. The experience lets users spin for prizes on their phones while capturing engagement data for the event.",
    thumbnail:
      "/images/projects/thumbnails/raffle-smart-phone-wechat-application-development-sdk.jpg",
    images: [
      "/images/projects/raffle-smart-phone-wechat-application-development-sdk.jpg",
    ],
    imageAlt:
      "Mobile raffle game interface on a smartphone screen.",
    link: null,
  },

  {
    id: "dragon-boat-campaign",
    title: "Dragon Boat Festival Campaign Landing Pages",
    summary:
      "Delivered a cohesive Dragon Boat Festival campaign experience with mobile-first landing pages and a complementary desktop microsite layout optimized for clarity, speed, and conversion.",
    description:
      "Built the front-end experience for a Dragon Boat Festival event campaign by implementing responsive landing pages designed to load quickly and communicate key details at a glance. Created a mobile-first layout with clear calls to action and concise content, then extended the campaign into a desktop-friendly microsite that preserved the visual identity while improving readability and information hierarchy on larger screens. Implemented the layouts with clean, responsive HTML and CSS to ensure consistent behavior across devices.",
    thumbnail: "/images/projects/thumbnails/dragon-boath-thank-you.jpg",
    images: [
      "/images/projects/dragon.jpg",
      "/images/projects/dragon-boat-festival-2016-landing-page.jpg"
    ],
    imageAlt:
      "Dragon Boat Festival campaign landing pages showing mobile-first layouts and a desktop microsite with hero imagery and event details.",
    link: null,
  },

  {
    id: "quickbase-integration",
    title: "QuickBase Form",
    summary:
      "Integrated a web registration form directly with QuickBase to streamline data capture.",
    description:
      "Built and integrated a web registration form that posts data into a QuickBase database. The solution reduces manual data entry and keeps orientation registrations synchronized with internal systems.",
    thumbnail:
      "/images/projects/thumbnails/cambridge-orientation-registration-cn-and-database-integration-api.jpg",
    images: [
      "/images/projects/cambridge-orientation-registration-cn-and-database-integration-api.jpg",
    ],
    imageAlt:
      "Registration form for Cambridge Orientation integrated with QuickBase.",
    link: null
  },

  {
    id: "cambridge-orientation-site",
    title: "WordPress Orientation Site for International Students",
    summary:
      "Developed and maintained a WordPress orientation site that helps international students and families quickly find program information and resources.",
    description:
      "Delivered ongoing website development, maintenance, and content updates for a WordPress-based orientation site serving international students. Ensured program details, registration links, schedules, and key resources stayed accurate, well-organized, and easy to navigate—supporting a smooth onboarding experience for students and their families.",
    thumbnail: "/images/projects/thumbnails/cambridge-orientation-en.jpg",
    images: ["/images/projects/cambridge-orientation-en.jpg"],
    imageAlt:
      "Orientation website homepage for international students.",
    link: null
  },
  {
    id: "gphomestay-digital-experiences",
    title: "GPHomestay Marketing, Content, and Lead Capture Experiences",
    summary:
      "Delivered responsive, conversion-focused web experiences for GPHomestay—spanning mobile content UX, paid-campaign landing pages, testimonial storytelling, CRM-integrated lead capture, and interactive customer quizzes.",
    description:
      "Contributed to the build and ongoing enhancement of GPHomestay.com by implementing key templates and interactive features that supported both marketing and program growth. Optimized a content-heavy blog for mobile readability with Bootstrap 3, created streamlined AdWords landing pages aligned with campaign messaging, and integrated a “Host Stories” testimonial layout into a custom WordPress theme for long-form content. Implemented a lead-generation form integrated with Salesforce and supporting database APIs to route inquiries into the CRM pipeline, and built a lightweight online quiz experience to collect user responses through an intuitive, guided UI. Supported site maintenance and iterative improvements to keep templates cohesive and performant.",
    thumbnail: "/images/projects/thumbnails/dev-gphomestay-home-page-july28-2016.jpg",
    images: [
      "/images/projects/monetary-landing-page-a.jpg",
      "/images/projects/gp-testimonials.jpg",
      "/images/projects/gp-inqary-form-integration.jpg",
      "/images/projects/dev-gphomestay-home-page-july28-2016.jpg",
      "/images/projects/customer-quiz.jpg"
    ],
    imageAlt:
      "GPHomestay digital experiences including a mobile-optimized blog, AdWords landing page, testimonial stories, Salesforce-integrated lead form, main site homepage, and an interactive online quiz.",
    link: null,
  },

  {
    id: "invite-education-prototypes",
    title: "Invite Education White-Label Student Platform Prototypes",
    summary:
      "Built front-end prototypes for a startup developing a white-label student guidance platform, collaborating with a San Francisco–based UX team to translate designs into clear, student-friendly experiences.",
    description:
      "Contributed to an early-stage product that supports employees and soon-to-be college students throughout the college application journey. Worked closely with a UX team based in San Francisco—collaborating remotely and on-site as needed—to iterate on layout, navigation, and information hierarchy. Implemented semantic HTML/CSS prototypes for the public-facing homepage and a “Student Passport” dashboard concept, focusing on clarity, approachable UI, and a foundation that could be handed off for production development.",
    thumbnail: "/images/projects/thumbnails/ie-home.jpg",
    images: [
      "/images/projects/ie-home.jpg",
      "/images/projects/ie-passport.jpg"
    ],
    imageAlt:
      "Invite Education prototypes including a homepage concept and a student dashboard (“passport”) interface.",
    link: null,
  },

  {
    id: "umb-map-mooc",
    title: "Map-Based Learning Module for UMass Boston MOOC",
    summary:
      "Collaborated with UMass Boston’s Instructional Design team to build an interactive Google Maps learning module for an online course experience.",
    description:
      "Partnered with the Instructional Design department to design and implement an interactive map component used within a UMass Boston MOOC. Built a custom-styled Google Map that visualized course-related locations and supported guided exploration as part of the curriculum. Focused on a clear learner experience, intuitive interactions, and a maintainable implementation that could be reused and updated as the course evolved.",
    thumbnail: "/images/projects/thumbnails/umb-map.jpg",
    images: ["/images/projects/umb-map.jpg"],
    imageAlt:
      "Interactive Google Map module showing course-related markers used in an online learning experience.",
    link: null,//"http://www.daisylaflamme.net/umb-map/index.html",
  },

  // 4) Casino Ballroom Support
  {
    id: "casino-ballroom-support",
    title: "Ballroom Support",
    summary:
      "Provided front-end support and UI adjustments for the Casino Ballroom web experience.",
    description:
      "Supported front-end updates and UI improvements for the Casino Ballroom website as part of an I-volutions project. Assisted with layout refinements, styling updates, and visual consistency efforts to enhance user experience for event visitors.",
    thumbnail: "/images/projects/thumbnails/cb.jpg",
    images: ["/images/projects/cb.jpg"],
    imageAlt: "Casino Ballroom website interface",
    link: "http://www.casinoballroom.com/"
  },

  // 5) ClariLegal HTML Prototype
  {
    id: "clarilegal-prototype",
    title: "eDiscovery Application Prototype",
    summary:
      "Built HTML wireframes and interactive prototypes for an e-discovery startup’s workflow tools.",
    description:
      "Delivered HTML wireframes and user interface prototypes for ClariLegal, an e-discovery startup. The project included iterative UX planning, layout structuring, and early-stage interface implementation on top of a Django-based technology stack to support legal workflow visualization.",
    thumbnail: "/images/projects/thumbnails/cl-dashboard.jpg",
    images: ["/images/projects/cl-dashboard.jpg"],
    imageAlt: "ClariLegal HTML prototype dashboard",
    link: null
  },

  // 6) UMass Boston Wireframes
  {
    id: "umb-open-data-ux-ui",
    title: "UMass Boston Open Data Analytics UX & UI",
    summary:
      "Delivered UX wireframes and implemented UI work for UMass Boston’s Open Data Analytics initiative, improving structure and accessibility for research-focused content.",
    description:
      "Created a complete set of UX wireframes for the Open Data Analytics website, including user-flow planning, page-level layouts, and structured interface sketches to guide how academic and analytical content would be presented. Contributed to the site’s UI implementation by refining layouts and content structure to support clarity, accessibility, and engagement for academic and community users.",
    thumbnail: "/images/projects/thumbnails/odai.jpg",
    images: [
      "/images/projects/odai-wireframes.jpg",
      "/images/projects/odai.jpg"
    ],
    imageAlt:
      "UMass Boston Open Data Analytics wireframes and the implemented website UI showcasing research and analytical content.",
    link: "http://photography.daisylaflamme.net/wireframes.pdf"
  },

  // 8) Boston Strategics
  {
    id: "boston-strategics",
    title: "WordPress Website for Startup (Boston Strategics)",
    summary:
      "Collaborated with the Boston Strategics team to build and iteratively refine a WordPress website that established their startup’s online presence and enabled the staff to manage content confidently.",
    description:
      "Partnered closely with the company team to define requirements, iterate on page layouts and messaging, and deliver a polished WordPress marketing site aligned with evolving business needs. Implemented maintainable page templates and a clear content structure, then trained staff on day-to-day updates (editing pages, publishing content, and basic site management) to reduce reliance on engineering. Provided ongoing maintenance and enhancements to keep the site stable, current, and aligned with the company’s growth.",
    thumbnail: "/images/projects/thumbnails/bs2.jpg",
    images: ["/images/projects/bs2.jpg", "/images/projects/bs.jpg"],
    imageAlt: "Boston Strategics WordPress website and supporting design concepts.",
    link: null
  },

  // 9) Bioarray Therapeutics
  {
    id: "bioarray-site",
    title: "Bioarray Site Maintenance",
    summary:
      "Updated content and front-end layout for Bioarray Therapeutics’ corporate website.",
    description:
      "Implemented content updates and front-end refinements for the Bioarray Therapeutics corporate website. Work included adjusting page structures, improving readability, and aligning the layout with branding needs while preparing for future content expansion.",
    thumbnail: "/images/projects/thumbnails/bioarray.jpg",
    images: ["/images/projects/bioarray.jpg"],
    imageAlt: "Bioarray Therapeutics website layout",
    link: null
  },

  // 10) Refuge Place International
  {
    id: "refuge-place",
    title: "Refuge Place International WordPress Website",
    summary:
      "Volunteered to develop Refuge Place International’s WordPress website, including a PayPal-powered donation flow that supported fundraising efforts to help build a hospital in Liberia for women and children.",
    description:
      "Volunteered as a web developer for Refuge Place International by building and enhancing their WordPress site with customized templates, selected plug-ins, and API-powered features. Implemented a dedicated donation page wired to PayPal to streamline contributions, and optimized the editing experience so staff could update content with minimal friction. Delivered a stable, mission-aligned online presence that supported community outreach and fundraising initiatives.",
    thumbnail: "/images/projects/thumbnails/00.jpg",
    images: ["/images/projects/00.jpg"],
    imageAlt:
      "Refuge Place International WordPress website with donation and mission-focused content.",
    link: null
  },

  // 11) GlobalPeace Aid
  {
    id: "globalpeace-aid",
    title: "Global Peace Aid Nonprofit WordPress Website",
    summary:
      "Volunteered to build and maintain Global Peace Aid’s WordPress website, strengthening their online presence and supporting fundraising and outreach—helping position the organization to secure $100K in state grants for global peace and conflict resolution initiatives.",
    description:
      "Volunteered as the web lead for Global Peace Aid by developing and maintaining their WordPress site end-to-end. Managed website hosting and ongoing site operations, implemented key pages and flows including a PayPal donation experience and events content, and maintained the organization’s content assets to keep messaging accurate and up to date. Integrated tools such as Google APIs and analytics to support outreach and visibility, delivering a reliable, brand-aligned online presence that supported fundraising efforts and strengthened credibility for grant opportunities.",
    thumbnail: "/images/projects/thumbnails/7.jpg",
    images: ["/images/projects/7.jpg"],
    imageAlt: "Global Peace Aid nonprofit WordPress website with donation and events information.",
    link: null
  },
  {
    id: "js-girls-platform",
    title: "JavaScript Learning Platform",
    summary:
      "Built an interactive JavaScript learning platform designed to engage early learners—especially girls—through visual, simplified, and confidence-building content.",
    description:
      "Created a full instructional platform for early learners as part of my Digital Media Instructor master’s thesis, focusing on increasing girls’ participation in technology. The system included a left-navigation tutorial structure and dynamic right-panel concept modals that broke down JavaScript, HTML, and CSS into approachable, highly visual lessons. I designed and authored tutorials for all major JavaScript fundamentals, integrating UX patterns that support young learners—clear pacing, simplified language, welcoming visuals, and scaffolded exercises. The platform demonstrated how thoughtful UI, tone, and educational design can make core programming concepts feel accessible, intuitive, and exciting for middle-school–level students.",
    thumbnail: "/images/projects/thumbnails/jsgirls-small.jpg",
    images: ["/images/projects/jsgirls2.jpg"],
    imageAlt:
      "UI screens from a JavaScript learning platform for young female learners, featuring tutorials and concept modals.",
    link: null
  },
  {
    id: "photo-portfolio",
    title: "Photography Portfolio",
    summary:
      "Built a photography portfolio site to showcase curated work in a clean, responsive layout.",
    description:
      "Created a standalone photography portfolio site with a clean, responsive layout for browsing images. Focused on image presentation, simple navigation, and minimal chrome so the photos remain the primary focus.",
    thumbnail: "/images/projects/thumbnails/photography-small.jpg",
    images: ["/images/projects/photography.jpg"],
    imageAlt:
      "Grid of photography thumbnails on a clean portfolio page.",
    link:
      "http://photography.daisylaflamme.net/portfolio.html",
  },
  {
    id: "hci-mockup",
    title: "Human-Computer Interaction Mockups",
    summary:
      "Produced a comprehensive interface mockup as part of a Human–Computer Interaction course.",
    description:
      "Created a comprehensive interface mockup for a Human–Computer Interaction project. Focused on user flows, layout, and visual hierarchy to demonstrate best practices in usable design.",
    thumbnail: "/images/projects/thumbnails/validity.jpg",
    images: ["/images/projects/validity.jpg"],
    imageAlt:
      "Complex application mockup created for an HCI project.",
    link: null,
  },
   {
    id: "flyer-design",
    title: "Cape Cod Small Business Website for Flyer Services",
    summary:
      "Built a simple, professional website to strengthen a Cape Cod small business’s online presence and help attract new clients who need event flyers.",
    description:
      "Designed and implemented a lightweight, mobile-friendly site for a local flyer-design business, focusing on credibility and lead generation. Organized the layout to showcase sample flyer work, communicate services clearly, and make it easy for potential customers to contact the business. Prioritized clean typography, strong visual hierarchy, and a polished presentation so the owner could stand out locally and convert visitors into new clients.",
    thumbnail: "/images/projects/thumbnails/mariya.jpg",
    images: ["/images/projects/mariya.jpg"],
    imageAlt:
      "Small business website showcasing event flyer design services and sample flyer work.",
    link: null,
  },

  // 2) Student Resume Portfolio
  {
    id: "student-portfolio",
    title: "IT Portfolio",
    summary:
      "Built a responsive student resume and project portfolio showcasing academic work and design capabilities.",
    description:
      "Designed and developed a responsive digital resume and project portfolio to showcase academic achievements and early professional work. The layout was crafted for clarity and ease of navigation, highlighting the student's strengths through structured sections and cohesive visual presentation.",
    thumbnail: "/images/projects/thumbnails/puhi.jpg",
    images: ["/images/projects/puhi.jpg"],
    imageAlt: "Student resume and project portfolio screenshot",
    link: null
  },

  // 3) Mobile Joomla Portfolio App
  {
    id: "mobile-joomla-portfolio",
    title: "Mobile Portfolio",
    summary:
      "Developed a mobile-optimized Joomla portfolio designed specifically for smartphones.",
    description:
      "Created a mobile-friendly web portfolio using Joomla, optimized exclusively for smartphone screens. The project included custom template adjustments, lightweight layouts, and simplified navigation to deliver an app-like browsing experience while preserving the portfolio’s visual identity.",
    thumbnail: "/images/projects/thumbnails/i2.jpg",
    images: ["/images/projects/i2.jpg"],
    imageAlt: "Mobile Joomla portfolio interface",
    link: null
  },

  // 12) Scratch Game Development
  // {
  //   id: "scratch-game",
  //   title: "Scratch Game",
  //   summary:
  //     "Built an interactive Scratch-based educational game featuring custom animations.",
  //   description:
  //     "Designed and implemented an interactive educational game using Scratch, combining simple animations, character interactions, and playful mechanics. The project demonstrates early programming logic and an understanding of user engagement through animated storytelling.",
  //   thumbnail: "/images/projects/thumbnails/8.jpg",
  //   images: ["/images/projects/8.jpg"],
  //   imageAlt: "Scratch-based educational game with animated characters",
  //   link: "http://scratch.mit.edu/projects/desislava/2778494"
  // },
];