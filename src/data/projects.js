/**
 * Portfolio projects data.
 * Add new projects here. Place images in public/images/projects/
 * (thumbnails in public/images/projects/thumbnails/).
 * Use paths like "/images/projects/thumbnails/your-image.png" for local images.
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
//     image: "/images/projects/asi-variant-pdp.png",
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
//     image: "http://daisylaflamme.net/images/asi-search-page-clickable-swatches-angular6.png",
//     imageAlt: "Clickable Swatches",
//     link: "https://www.americansignaturefurniture.com",
//   },
//   {
//     id: "re-styling",
//     title: "Re-styling",
//     summary: "Re-styling a third party filter extension",
//     description: "Re-styling a third party filter extension",
//     thumbnail: "http://daisylaflamme.net/images/thumbnails/lovesac-swatch-page.png",
//     image: "http://daisylaflamme.net/images/lovesac-swatch-page.png",
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
    id: "product-configuration",
    title: "Product Configuration",
    summary:
      "Delivered a configurable product page so shoppers can select product variants directly on the PDP.",
    description:
      "Worked in a senior dev team to add a major new product page feature that lets web users select different product configurations. Implemented Angular 6 components, templates, styles, and a reusable LESS architecture for consistent theming.",
    thumbnail: "/images/projects/thumbnails/asi-variant-pdp.png",
    image: "/images/projects/asi-variant-pdp.png",
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
    image: "/images/projects/asi-search-page-clickable-swatches-angular6.png",
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
    image: "/images/projects/lovesac-swatch-page.png",
    imageAlt:
      "Product browse page showing fabric filter controls and large swatch grid.",
    link: "https://www.lovesac.com/search/fabric",
  },

  {
    id: "mobile-checkout",
    title: "Mobile Checkout",
    summary:
      "Built a responsive mobile checkout flow so customers can manage delivery options on smaller screens.",
    description:
      "Based on a specific mobile mockup, implemented a responsive UI for a multi-page checkout flow that lets ecommerce customers select product delivery preferences on their phones. Focused on clarity, ease of use, and preserving key cart information on small viewports.",
    thumbnail:
      "/images/projects/thumbnails/levin-dropship-checkout-page-iphoneX.png",
    image: "/images/projects/levin-dropship-checkout-page-iphoneX.png",
    imageAlt:
      "iPhone checkout screen for Levin Furniture showing delivery options and order summary.",
    link: "https://www.levinfurniture.com/shoppingcart",
  },

  {
    id: "tablet-checkout",
    title: "Tablet Checkout",
    summary:
      "Extended the new delivery-options checkout experience to a responsive tablet layout.",
    description:
      "Using a dedicated tablet mockup, implemented a responsive multi-page checkout UI tailored for tablet users. Ensured delivery options, forms, and order details remained readable and touch-friendly while staying consistent with the broader checkout experience.",
    thumbnail:
      "/images/projects/thumbnails/levin-dropship-checkout-page-ipad.png",
    image: "/images/projects/levin-dropship-checkout-page-ipad.png",
    imageAlt:
      "Tablet view of Levin Furniture checkout page with delivery and shipping preferences.",
    link: "https://www.levinfurniture.com/shoppingcart",
  },

  {
    id: "desktop-checkout",
    title: "Desktop Checkout",
    summary:
      "Implemented a desktop multi-step checkout with delivery preferences aligned to detailed mockups.",
    description:
      "Based on detailed desktop mockups, implemented a responsive multi-page checkout for Levin Furniture that includes delivery preferences, shipping options, and clear order summaries. The experience is consistent with the mobile and tablet flows while taking advantage of wider layouts.",
    thumbnail: "/images/projects/thumbnails/levin-dropship-checkout-page.png",
    image: "/images/projects/levin-dropship-checkout-page.png",
    imageAlt:
      "Desktop checkout page for Levin Furniture showing address, shipping, and delivery choices.",
    link: "https://www.levinfurniture.com/shoppingcart",
  },

  {
    id: "checkout-cart",
    title: "Checkout Cart",
    summary:
      "Refined the cart step in the new multi-page checkout so delivery preferences connect cleanly from the cart.",
    description:
      "Implemented a responsive cart page as part of the new multi-page checkout experience, letting users review items and configure delivery options before proceeding. Ensured the cart flow integrates seamlessly with the subsequent checkout steps.",
    thumbnail: "/images/projects/thumbnails/levin-dropship-cart-page.png",
    image: "/images/projects/levin-dropship-cart-page.png",
    imageAlt:
      "Shopping cart page at Levin Furniture with products and delivery preference messaging.",
    link: "https://www.levinfurniture.com/shoppingcart",
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
    image: "/images/projects/lovesac-search-page-with-chat.png",
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
    image: "/images/projects/lovesac-log-in-page.png",
    imageAlt:
      "Lovesac customer sign-in page with email and password form fields.",
    link: "https://www.lovesac.com/account/sign-in",
  },

  {
    id: "lovesac-store-locator",
    title: "Store Locator",
    summary:
      "Led UI implementation of a responsive, SEO-friendly store locator experience for Lovesac.",
    description:
      "Managed one teammate while implementing the UI for a responsive, search-engine-optimized store locator for Lovesac. The feature helps customers find locations by region, improving both discoverability and local store traffic.",
    thumbnail: "/images/projects/thumbnails/lovesac-store-locator.png",
    image: "/images/projects/lovesac-store-locator.png",
    imageAlt:
      "Lovesac store locator page showing a map and list of store locations.",
    link: "https://www.lovesac.com/store-locator/ma",
  },

  {
    id: "asi-store-locator",
    title: "Store Locator",
    summary:
      "Styled an American Signature Furniture store locator to be fully responsive and SEO-friendly.",
    description:
      "Fully styled a new responsive and search-engine-optimized store locator for American Signature Furniture. The UI makes it easy for shoppers to find nearby stores while staying consistent with the brand’s look and feel.",
    thumbnail: "/images/projects/thumbnails/asi-store-locator.png",
    image: "/images/projects/asi-store-locator.png",
    imageAlt:
      "American Signature Furniture store locator page with a map and store list.",
    link: "https://www.americansignaturefurniture.com/store-locator/de",
  },

  {
    id: "promo-shell",
    title: "Promo Builder",
    summary:
      "Implemented tools that let non-technical users configure and launch shopping-cart promotions.",
    description:
      "Worked in a senior dev team implementing UI workflows that let non-technical users create web shopping-cart promotions. Built the promotion shell screens using AngularJS, Angular 6, C#, HTML, and LESS so marketers can configure offers without engineering help.",
    thumbnail:
      "/images/projects/thumbnails/hub-cart-promotion-shell.png",
    image: "/images/projects/hub-cart-promotion-shell.png",
    imageAlt:
      "Internal promotion management interface showing shopping cart promotion configuration.",
    link: null,
  },

  {
    id: "promo-rules",
    title: "Promo Rules",
    summary:
      "Extended the promotion builder with detailed rules screens for advanced cart logic.",
    description:
      "Worked in a senior dev team implementing rule-definition UIs for shopping-cart promotions. The interface lets non-technical users create complex eligibility and discount logic through configurable forms instead of code.",
    thumbnail:
      "/images/projects/thumbnails/hub-cart-promotion-rules.png",
    image: "/images/projects/hub-cart-promotion-rules.png",
    imageAlt:
      "Admin screen showing rule configuration for shopping cart promotions.",
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
    image: "/images/projects/hub-custom-page.png",
    imageAlt:
      "Custom page builder UI showing layout configuration and content blocks.",
    link: null,
  },

  {
    id: "content-sections",
    title: "Content Sections",
    summary:
      "Created interfaces for managing reusable content sections across CMS-driven pages.",
    description:
      "Worked in a team that implemented a UI for non-technical users to add custom content sections to web pages. The interface organizes reusable elements into a list so editors can assemble rich layouts without editing code.",
    thumbnail:
      "/images/projects/thumbnails/hub-page-element-list-page.png",
    image: "/images/projects/hub-page-element-list-page.png",
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
    image: "/images/projects/hub-store-edit-page.png",
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
    image: "/images/projects/sage-academics-online-classroom-login-page.jpg",
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
    image: "/images/projects/tciie-for-students.jpg",
    imageAlt:
      "WordPress site for TCIIE showing a student-focused layout.",
    link: null,
  },

  {
    id: "globalu-itinerary",
    title: "Tour Itinerary",
    summary:
      "Converted PSD travel layouts into responsive HTML, CSS, and Bootstrap pages.",
    description:
      "Translated a detailed PSD design into responsive HTML, CSS, and Bootstrap 3 for an individual tour itinerary page. Ensured the layout worked well across devices while staying faithful to the original design.",
    thumbnail:
      "/images/projects/thumbnails/globalu-individual-itinarary.jpg",
    image: "/images/projects/globalu-individual-itinarary.jpg",
    imageAlt:
      "Travel itinerary page with photos and schedule details.",
    link: null,
  },

  {
    id: "globalu-usa-page",
    title: "USA Overview",
    summary:
      "Built a responsive destination overview page from PSD using Bootstrap 3.",
    description:
      "Implemented a PSD design as a responsive USA destination overview page using HTML, CSS, and Bootstrap 3. Focused on clean typography and imagery to showcase travel programs.",
    thumbnail: "/images/projects/thumbnails/usa-page.jpg",
    image: "/images/projects/usa-page.jpg",
    imageAlt:
      "Travel website page introducing USA programs with hero imagery.",
    link: null,
  },

  {
    id: "globalu-tours",
    title: "Tour Listings",
    summary:
      "Developed tour listing layouts as responsive Bootstrap pages from static designs.",
    description:
      "Converted static PSD designs into responsive HTML, CSS, and Bootstrap 3 for a tours listing page. Structured information and imagery so visitors can easily browse available trips.",
    thumbnail: "/images/projects/thumbnails/globalu-tours.jpg",
    image: "/images/projects/globalu-tours.jpg",
    imageAlt:
      "Tours listing page for GlobalU with multiple trip cards.",
    link: null,
  },

  {
    id: "globalu-home",
    title: "GlobalU Site",
    summary:
      "Maintained and enhanced GlobalU.com with new pages, layouts, and content updates.",
    description:
      "Handled website development, maintenance, and updates for GlobalU.com. Delivered new templates and page variants while keeping the design cohesive and the site stable.",
    thumbnail: "/images/projects/thumbnails/globalu-home-page.jpg",
    image: "/images/projects/globalu-home-page.jpg",
    imageAlt:
      "GlobalU home page with hero image and navigation.",
    link: null,
  },

  {
    id: "cornerstone-careers",
    title: "Career Site",
    summary:
      "Implemented a branded Cornerstone career site that matches the company’s main web presence.",
    description:
      "Delivered front-end development and branding integration for a Cornerstone-powered career site. Customized templates and styles so the job-search experience feels fully aligned with the main company website.",
    thumbnail:
      "/images/projects/thumbnails/the-cambridge-network-career-site.jpg",
    image: "/images/projects/the-cambridge-network-career-site.jpg",
    imageAlt:
      "Company career site listing open positions and search filters.",
    link: null,
  },

  {
    id: "https-migration-kl",
    title: "HTTPS Migration",
    summary:
      "Led HTTP-to-HTTPS migration across multiple sites to improve security and SEO.",
    description:
      "Supported the migration of five websites from HTTP to HTTPS, addressing mixed-content issues and template updates. Helped improve security posture and search-engine friendliness across the portfolio.",
    thumbnail: "/images/projects/thumbnails/kl.jpg",
    image: "/images/projects/kl.jpg",
    imageAlt:
      "Website home page for KL Education after HTTPS migration.",
    link: "https://www.kleducation.org/",
  },

  {
    id: "blog-mobile",
    title: "Blog Mobile",
    summary:
      "Optimized a content-heavy blog layout for mobile using Bootstrap 3.",
    description:
      "Implemented a responsive blog layout using Bootstrap 3 that delivers a better mobile reading experience. Improved typography, spacing, and navigation so posts are easy to read on phones.",
    thumbnail:
      "/images/projects/thumbnails/gphomestay-responsive-mobile-blog.jpg",
    image:
      "/images/projects/gphomestay-responsive-mobile-blog.jpg",
    imageAlt:
      "Mobile blog layout for GPHomestay with article list.",
    link: null
  },

  {
    id: "cambridge-network-site",
    title: "Network Site",
    summary:
      "Maintained and evolved the main Cambridge Network marketing site.",
    description:
      "Handled website development, maintenance, and updates for TheCambridgeNetwork.com. Added new content sections, refined navigation, and ensured the site stayed aligned with evolving branding.",
    thumbnail:
      "/images/projects/thumbnails/thecambridgenetwork-home-page.jpg",
    image: "/images/projects/thecambridgenetwork-home-page.jpg",
    imageAlt:
      "The Cambridge Network marketing home page.",
    link: null
  },

  {
    id: "wechat-raffle-game",
    title: "Raffle Game",
    summary:
      "Developed a mobile raffle game integrating jQuery UI with the WeChat SDK.",
    description:
      "Built a mobile raffle game using HTML, CSS, jQuery, and the WeChat API. The experience lets users spin for prizes on their phones while capturing engagement data for the event.",
    thumbnail:
      "/images/projects/thumbnails/raffle-smart-phone-wechat-application-development-sdk.jpg",
    image:
      "/images/projects/raffle-smart-phone-wechat-application-development-sdk.jpg",
    imageAlt:
      "Mobile raffle game interface on a smartphone screen.",
    link: null,
  },

  {
    id: "dragon-boat-landing",
    title: "Event Landing",
    summary:
      "Designed and coded mobile-first landing pages for a Dragon Boat Festival campaign.",
    description:
      "Created mobile landing pages for a Dragon Boat Festival event, focusing on concise information, clear calls to action, and quick loading on phones. Implemented the layouts with responsive HTML and CSS.",
    thumbnail:
      "/images/projects/thumbnails/dragon-boath-thank-you.jpg",
    image: "/images/projects/dragon-boat-festival-2016-landing-page.jpg",
    imageAlt:
      "Dragon Boat Festival thank-you and landing page on mobile.",
    link: null,
  },

  {
    id: "dragon-boat-desktop",
    title: "Event Microsite",
    summary:
      "Extended the Dragon Boat Festival campaign into a desktop microsite layout.",
    description:
      "Delivered a complementary desktop layout for the Dragon Boat Festival campaign, extending the visual identity from the mobile landing page. Ensured responsive behavior while highlighting key event details.",
    thumbnail: "/images/projects/thumbnails/dragon.jpg",
    image: "/images/projects/dragon.jpg",
    imageAlt:
      "Dragon Boat Festival desktop landing page with hero image.",
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
    image:
      "/images/projects/cambridge-orientation-registration-cn-and-database-integration-api.jpg",
    imageAlt:
      "Registration form for Cambridge Orientation integrated with QuickBase.",
    link: null
  },

  {
    id: "cambridge-orientation-site",
    title: "Orientation Site",
    summary:
      "Developed and maintained the CambridgeOrientation.org informational site.",
    description:
      "Delivered website development, maintenance, and updates for CambridgeOrientation.org. Ensured that program information, registration links, and resources remained accurate and easy for families to find.",
    thumbnail:
      "/images/projects/thumbnails/cambridge-orientation-en.jpg",
    image: "/images/projects/cambridge-orientation-en.jpg",
    imageAlt:
      "Cambridge Orientation website home page.",
    link: null
  },

  {
    id: "online-quiz",
    title: "Online Quiz",
    summary:
      "Built an interactive online quiz experience to collect user responses in a friendly format.",
    description:
      "Designed and implemented an online quiz interface, focusing on clear questions, easy navigation, and a lightweight front-end so the experience feels fast and approachable.",
    thumbnail: "/images/projects/thumbnails/customer-quiz.jpg",
    image: "/images/projects/customer-quiz.jpg",
    imageAlt:
      "Online quiz page with customer questions and options.",
    link: null,
  },

  {
    id: "adwords-landing",
    title: "AdWords Landing",
    summary:
      "Created a focused AdWords landing page to support a monetary incentives campaign.",
    description:
      "Built a conversion-oriented landing page for an AdWords campaign, aligning the layout and copy with the ad messaging. The page is streamlined to capture leads effectively from paid traffic.",
    thumbnail:
      "/images/projects/thumbnails/monetary-landing-page-a.jpg",
    image: "/images/projects/monetary-landing-page-a.jpg",
    imageAlt:
      "AdWords campaign landing page offering monetary incentives.",
    link: null
  },

  {
    id: "testimonial-page",
    title: "Host Stories",
    summary:
      "Integrated a testimonial design into a custom WordPress theme to showcase host stories.",
    description:
      "Integrated a new testimonial page design into a custom WordPress theme for GPHomestay. The page highlights host family stories in a structured, visually appealing layout that supports long-form content.",
    thumbnail: "/images/projects/thumbnails/gp-testimonials.jpg",
    image: "/images/projects/gp-testimonials.jpg",
    imageAlt:
      "WordPress testimonial page showing host stories and photos.",
    link: null
  },

  {
    id: "salesforce-lead-form",
    title: "Lead Form",
    summary:
      "Implemented a Salesforce-integrated lead form to streamline host family inquiries.",
    description:
      "Built a lead-generation web form that integrates with Salesforce and other database APIs. The form captures host family inquiries and routes them into the company’s CRM pipeline automatically.",
    thumbnail:
      "/images/projects/thumbnails/gp-inqary-form-integration.jpg",
    image: "/images/projects/gp-inqary-form-integration.jpg",
    imageAlt:
      "Lead generation form for host family inquiries integrated with Salesforce.",
    link: null
  },

  {
    id: "gphomestay-site",
    title: "GPHomestay Site",
    summary:
      "Supported ongoing development and content updates for GPHomestay’s main site.",
    description:
      "Handled website development, maintenance, and updates for GPHomestay.com. Delivered new layouts and refined existing templates to support marketing campaigns and program information.",
    thumbnail:
      "/images/projects/thumbnails/dev-gphomestay-home-page-july28-2016.jpg",
    image:
      "/images/projects/dev-gphomestay-home-page-july28-2016.jpg",
    imageAlt:
      "GPHomestay home page showing hero, navigation, and feature content.",
    link: null
  },

  // --- Selected academic / early portfolio projects ---

  {
    id: "hci-mockup",
    title: "HCI Mockup",
    summary:
      "Produced a comprehensive interface mockup as part of a Human–Computer Interaction course.",
    description:
      "Created a comprehensive interface mockup for a Human–Computer Interaction project. Focused on user flows, layout, and visual hierarchy to demonstrate best practices in usable design.",
    thumbnail: "/images/projects/thumbnails/validity.jpg",
    image: "/images/projects/validity.jpg",
    imageAlt:
      "Complex application mockup created for an HCI project.",
    link: null,
  },

  {
    id: "js-girls-platform",
    title: "JS Learning",
    summary:
      "Built an interactive JavaScript learning platform designed to engage early learners—especially girls—through visual, simplified, and confidence-building content.",
    description:
      "Created a full instructional platform for early learners as part of my Digital Media Instructor master’s thesis, focusing on increasing girls’ participation in technology. The system included a left-navigation tutorial structure and dynamic right-panel concept modals that broke down JavaScript, HTML, and CSS into approachable, highly visual lessons. I designed and authored tutorials for all major JavaScript fundamentals, integrating UX patterns that support young learners—clear pacing, simplified language, welcoming visuals, and scaffolded exercises. The platform demonstrated how thoughtful UI, tone, and educational design can make core programming concepts feel accessible, intuitive, and exciting for middle-school–level students.",
    thumbnail: "/images/projects/thumbnails/jsgirls-small.jpg",
    image: "/images/projects/jsgirls2.jpg",
    imageAlt:
      "UI screens from a JavaScript learning platform for young female learners, featuring tutorials and concept modals.",
    link: null
  },

  {
    id: "photo-portfolio",
    title: "Photo Portfolio",
    summary:
      "Built a photography portfolio site to showcase curated work in a clean, responsive layout.",
    description:
      "Created a standalone photography portfolio site with a clean, responsive layout for browsing images. Focused on image presentation, simple navigation, and minimal chrome so the photos remain the primary focus.",
    thumbnail: "/images/projects/thumbnails/photography-small.jpg",
    image: "/images/projects/photography.jpg",
    imageAlt:
      "Grid of photography thumbnails on a clean portfolio page.",
    link:
      "http://photography.daisylaflamme.net/portfolio.html",
  },

  {
    id: "invite-education-home",
    title: "Education Prototype",
    summary:
      "Coded an Invite Education homepage prototype directly from visual designs.",
    description:
      "Developed an HTML prototype for Invite Education’s homepage, translating visual comps into semantic HTML and CSS. The prototype demonstrates layout, navigation, and content hierarchy for future development.",
    thumbnail: "/images/projects/thumbnails/ie-home.jpg",
    image: "/images/projects/ie-home.jpg",
    imageAlt:
      "Invite Education homepage prototype with hero banner and content tiles.",
    link: null,
  },

  {
    id: "invite-education-passport",
    title: "Student Passport",
    summary:
      "Built a prototype of a student financial ‘passport’ experience for Invite Education.",
    description:
      "Implemented a prototype for a student financial passport interface, exploring ways to present complex information in a clear, student-friendly dashboard.",
    thumbnail: "/images/projects/thumbnails/ie-passport.jpg",
    image: "/images/projects/ie-passport.jpg",
    imageAlt:
      "Invite Education passport dashboard screen prototype.",
    link: null,
  },

  {
    id: "umb-map-mooc",
    title: "Map MOOC",
    summary:
      "Created an interactive Google Maps experience as part of a UMass Boston MOOC project.",
    description:
      "Built an interactive Google Map experience for a UMass Boston MOOC project, visualizing course-related locations on a custom-styled map. The project explored how mapping can support online learning.",
    thumbnail: "/images/projects/thumbnails/umb-map.jpg",
    image: "/images/projects/umb-map.jpg",
    imageAlt:
      "Google Map interface showing course-related markers for a MOOC.",
    link: "http://www.daisylaflamme.net/umb-map/index.html",
  },
  // 1) Flyer Design
  {
    id: "flyer-design",
    title: "Flyer Design",
    summary: "Designed a clean, engaging promotional flyer optimized for readability and brand consistency.",
    description:
      "Designed a visually appealing promotional flyer using balanced typography, structured layouts, and clear visual hierarchy. Focused on communicating key information quickly while aligning the design with modern branding aesthetics to improve engagement and clarity.",
    thumbnail: "/images/projects/thumbnails/mariya.jpg",
    image: "/images/projects/mariya.jpg",
    imageAlt: "Marketing flyer design layout",
    link: "http://www.daisylaflamme.net/mariyaholbrook/index.html",
  },

  // 2) Student Resume Portfolio
  {
    id: "student-portfolio",
    title: "Student Portfolio",
    summary:
      "Built a responsive student resume and project portfolio showcasing academic work and design capabilities.",
    description:
      "Designed and developed a responsive digital resume and project portfolio to showcase academic achievements and early professional work. The layout was crafted for clarity and ease of navigation, highlighting the student's strengths through structured sections and cohesive visual presentation.",
    thumbnail: "/images/projects/thumbnails/puhi.jpg",
    image: "/images/projects/puhi.jpg",
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
    thumbnail: "/images/projects/thumbnails/i1.jpg",
    image: "/images/projects/i1.jpg",
    imageAlt: "Mobile Joomla portfolio interface",
    link: null
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
    image: "/images/projects/cb.jpg",
    imageAlt: "Casino Ballroom website interface",
    link: "http://www.casinoballroom.com/"
  },

  // 5) ClariLegal HTML Prototype
  {
    id: "clarilegal-prototype",
    title: "Legal Prototype",
    summary:
      "Built HTML wireframes and interactive prototypes for an e-discovery startup’s workflow tools.",
    description:
      "Delivered HTML wireframes and user interface prototypes for ClariLegal, an e-discovery startup. The project included iterative UX planning, layout structuring, and early-stage interface implementation on top of a Django-based technology stack to support legal workflow visualization.",
    thumbnail: "/images/projects/thumbnails/cl-dashboard.jpg",
    image: "/images/projects/cl-dashboard.jpg",
    imageAlt: "ClariLegal HTML prototype dashboard",
    link: null
  },

  // 6) UMass Boston Wireframes
  {
    id: "umb-wireframes",
    title: "UMass Wireframes",
    summary:
      "Produced complete visual wireframes for UMass Boston’s Open Data Analytics initiative.",
    description:
      "Created a full set of UX wireframes for the UMass Boston Open Data Analytics website. The work included user-flow planning, page-level layout development, and structured interface sketches that guided the site’s presentation of academic and analytical content.",
    thumbnail: "/images/projects/thumbnails/umbw.jpg",
    image: "/images/projects/odai-wireframes.jpg",
    imageAlt: "UMass Boston Open Data Analytics wireframes",
    link: "http://www.daisylaflamme.net/wireframes.pdf"
  },

  // 7) UMass Boston Open Data Analytics Website
  {
    id: "umb-open-data",
    title: "Open Data",
    summary:
      "Implemented UI for UMass Boston’s Open Data Analytics site supporting research accessibility.",
    description:
      "Implemented portions of the UI for UMass Boston’s Open Data Analytics platform, improving the accessibility and presentation of research data. Focused on layout refinement and content structure to support academic users and community engagement.",
    thumbnail: "/images/projects/thumbnails/odai.jpg",
    image: "/images/projects/odai.jpg",
    imageAlt: "UMass Boston Open Data Analytics website",
    link: null
  },

  // 8) Boston Strategics
  {
    id: "boston-strategics",
    title: "Strategics Site",
    summary:
      "Designed proposal and early web concepts for Boston Strategics corporate presence.",
    description:
      "Created early web design concepts and proposal layouts for Boston Strategics, focusing on clean presentation and structured messaging. The work supported the company’s planning for its future online corporate identity.",
    thumbnail: "/images/projects/thumbnails/bs.jpg",
    image: "/images/projects/bs.jpg",
    imageAlt: "Boston Strategics early web proposal designs",
    link: null
  },

  // 9) Bioarray Therapeutics
  {
    id: "bioarray-site",
    title: "Bioarray Site",
    summary:
      "Updated content and front-end layout for Bioarray Therapeutics’ corporate website.",
    description:
      "Implemented content updates and front-end refinements for the Bioarray Therapeutics corporate website. Work included adjusting page structures, improving readability, and aligning the layout with branding needs while preparing for future content expansion.",
    thumbnail: "/images/projects/thumbnails/bioarray.jpg",
    image: "/images/projects/bioarray.jpg",
    imageAlt: "Bioarray Therapeutics website layout",
    link: null
  },

  // 10) Refuge Place International
  {
    id: "refuge-place",
    title: "Refuge Website",
    summary:
      "Developed a WordPress site with customized templates, plug-ins, and API-powered features.",
    description:
      "Built a WordPress website for Refuge Place International incorporating customized templates, third-party plug-ins, and API integrations. The site improved usability for editors while supporting the organization's community-driven mission.",
    thumbnail: "/images/projects/thumbnails/00.jpg",
    image: "/images/projects/00.jpg",
    imageAlt: "Refuge Place International WordPress website",
    link: null
  },

  // 11) GlobalPeace Aid
  {
    id: "globalpeace-aid",
    title: "Aid Platform",
    summary:
      "Designed and developed a nonprofit site featuring custom UI, branding, and API integrations.",
    description:
      "Developed a nonprofit website for Global Peace Aid featuring custom UI elements, brand-aligned styling, and integrations with Google APIs, PayPal, and analytics tools. Delivered a modern, functional interface for global outreach and fundraising efforts.",
    thumbnail: "/images/projects/thumbnails/7.jpg",
    image: "/images/projects/7.jpg",
    imageAlt: "Global Peace Aid nonprofit website",
    link: null
  },

  // 12) Scratch Game Development
  {
    id: "scratch-game",
    title: "Scratch Game",
    summary:
      "Built an interactive Scratch-based educational game featuring custom animations.",
    description:
      "Designed and implemented an interactive educational game using Scratch, combining simple animations, character interactions, and playful mechanics. The project demonstrates early programming logic and an understanding of user engagement through animated storytelling.",
    thumbnail: "/images/projects/thumbnails/8.jpg",
    image: "/images/projects/8.jpg",
    imageAlt: "Scratch-based educational game with animated characters",
    link: "http://scratch.mit.edu/projects/desislava/2778494"
  },
];