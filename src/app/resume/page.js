export default function ResumePage() {
  const linkClass =
    "text-[var(--color-shadow-accent)] underline hover:opacity-80 transition-opacity";
  const locationClass = "text-[var(--color-shadow-accent)]";

  return (
    <main className="font-inter min-h-screen py-8 px-4 md:px-8 max-w-5xl mx-auto [&_li]:m-[10px]">
      {/* Header */}
      <header className="mb-6">
        <h1 className="font-playfair-display font-semibold text-3xl md:text-4xl text-[var(--color-font-primary)] uppercase tracking-tight mb-2">
          Daisy Laflamme
        </h1>
        <p className="text-lg font-medium text-[var(--color-font-primary)] mb-3">
          UI Front-end Engineer
        </p>
        <p className="text-sm text-[var(--color-font-primary)]">
          Braintree, MA |{" "}
          <a href="mailto:laflammedaisy@gmail.com" className={linkClass}>
            laflammedaisy@gmail.com
          </a>{" "}
          |{" "}
          <a
            href="https://daisylaflamme.net"
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            daisylaflamme.net
          </a>{" "}
          |{" "}
          <a
            href="https://www.linkedin.com/in/desislavalaflamme/"
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            www.linkedin.com/in/desislavalaflamme
          </a>
        </p>
      </header>

      <div className="grid md:grid-cols-[1fr_0.85fr] gap-8 md:gap-10">
        {/* Left column */}
        <div className="space-y-6">
          {/* Professional Summary */}
          <section>
            <h2 className="font-playfair-display font-semibold text-sm text-[var(--color-font-primary)] uppercase tracking-wide border-b border-[var(--color-petal-border)] pb-1 mb-3">
              Professional Summary
            </h2>
            <p className="text-[var(--color-font-primary)] text-sm leading-relaxed">
              Senior UI Engineer with 12+ years of experience specializing in
              mobile-first, responsive layouts with a strong focus on ADA
              compliance, SEO, performance optimization, SDK integrations, and
              cross-browser, device-agnostic UI/UX.
            </p>
          </section>

          {/* Education */}
          <section>
            <h2 className="font-playfair-display font-semibold text-sm text-[var(--color-font-primary)] uppercase tracking-wide border-b border-[var(--color-petal-border)] pb-1 mb-3">
              Education
            </h2>
            <ul className="text-[var(--color-font-primary)] text-sm space-y-1.5 list-none pl-0">
              <li>
                <span className="font-bold">Harvard University Extension School</span> - M.L.A., Digital Media &
                Instructional Design
              </li>
              <li>
                <span className="font-bold">University of Massachusetts Boston</span> - B.S., Information
                Architecture
              </li>
              <li><span className="font-bold">Cape Cod Community College</span> - A.S., Web Development</li>
            </ul>
          </section>

          {/* Technical Skills */}
          <section>
            <h2 className="font-playfair-display font-semibold text-sm text-[var(--color-font-primary)] uppercase tracking-wide border-b border-[var(--color-petal-border)] pb-1 mb-3">
              Technical Skills
            </h2>
            <ul className="list-none pl-0 text-[var(--color-font-primary)] text-sm space-y-1.5">
              <li>
                <strong>Front-End Technologies:</strong> HTML5, CSS3, SCSS,
                Angular, React, TypeScript, JavaScript.
              </li>
              <li>
                <strong>Architecture and UI:</strong> Component based design,
                responsive UI, semantic HTML, Angular component libraries.
              </li>
              <li>
                <strong>Accessibility and Standards:</strong> ADA compliance,
                WCAG 2.0, WCAG 2.1, inclusive design, accessibility testing.
              </li>
              <li>
                <strong>Performance:</strong> Core Web Vitals, LCP optimization,
                CLS optimization, lazy loading, mobile performance, SVG sprites.
              </li>
              <li>
                <strong>SEO and Analytics:</strong> Technical SEO, structured
                data, Google Analytics, tag management.
              </li>
              <li>
                <strong>Integrations:</strong> Third party JavaScript
                libraries, NPM packages, payment providers, API integrations,
                SDK integrations.
              </li>
              <li>
                <strong>Tooling:</strong> Git, Jira, Agile Scrum workflows,
                Figma, AI tools, Cursor, VS Code, browser developer tools,
                Postman.
              </li>
            </ul>
          </section>

          

          {/* Professional Experience - Blueport Commerce */}
          <section>
            <h2 className="font-playfair-display font-semibold text-sm text-[var(--color-font-primary)] uppercase tracking-wide border-b border-[var(--color-petal-border)] pb-1 mb-3">
              Professional Experience
            </h2>

            <div className="mb-5 pb-6 border-b border-dashed border-[var(--color-petal-border)]">
              <p className="font-semibold text-[var(--color-font-primary)] text-sm">
                Blueport Commerce{" "}
                <span className={locationClass}>- Boston, MA</span>
              </p>
              <div className="mt-2 space-y-3">
                <div>
                  <p className="text-[var(--color-font-primary)] text-sm font-bold">
                    Senior Front-End Engineer and Team Lead | Aug 2025 – Present
                  </p>
                  <ul className="list-disc list-inside text-[var(--color-font-primary)] text-sm space-y-1 mt-1 ml-2">
                    <li>
                      Led a <strong>high-performance UI team</strong> in
                      completing multiple roadmap projects and Agile sprints.
                    </li>
                    <li>
                      Estimated client requirements and project scope based on
                      team velocity and capacity.
                    </li>
                    <li>
                      Communicated complex technical issues, solutions, and
                      timeline risks to Product management and leadership.
                    </li>
                  </ul>
                </div>
                <div>
                  <p className="text-[var(--color-font-primary)] text-sm font-bold">
                    Senior Front-End Engineer | Nov 2019 – Sep 2025
                  </p>
                  <ul className="list-disc list-inside text-[var(--color-font-primary)] text-sm space-y-1 mt-1 ml-2">
                    <li>
                      Built scalable Angular UI components—carousels, sliders,
                      modals, tabs—for a multi-tenant e-commerce platform.
                    </li>
                    <li>
                      Integrated third-party JavaScript libraries, SDKs, APIs,
                      payment providers, including advanced checkout financing
                      solutions.
                    </li>
                    <li>
                      Implemented semantic HTML templates, accessibility and SEO
                      best practices across high-traffic, consumer-facing pages.
                    </li>
                    <li>
                      Improved <strong>Core Web Vitals</strong> (LCP, CLS)
                      through image optimization, code simplification, lazy
                      loading.
                    </li>
                    <li>
                      Mentored developers through code reviews, technical
                      guidance, onboarding, training, and Agile/Scrum
                      collaboration.
                    </li>
                  </ul>
                </div>
                <div>
                  <p className="text-[var(--color-font-primary)] text-sm font-bold">
                    Front-End Developer | Oct 2016 - Oct 2019
                  </p>
                  <ul className="list-disc list-inside text-[var(--color-font-primary)] text-sm space-y-1 mt-1 ml-2">
                    <li>
                      Implemented front-end features within an MVC architecture
                      using Angular, AngularJS, JavaScript, jQuery, and SCSS.
                    </li>
                    <li>
                      Built and optimized carousels, tabs, galleries, modals,
                      hero banners, sliders, checkout carts, and delivery/payment
                      forms to deliver a modern, high-performing user experience
                      for up to 15 brands.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>


          {/* Cambridge Institute */}
          <section className="pb-6 border-b border-dashed border-[var(--color-petal-border)]">
            <p className="font-semibold text-[var(--color-font-primary)] text-sm">
              The Cambridge Institute of International Education{" "}
              <span className={locationClass}>- Waltham, MA</span>
            </p>
            <div className="mt-2">
              <p className="text-[var(--color-font-primary)] text-sm font-bold">
                Web Content Manager | Feb 2016 – Sep 2016
              </p>
              <ul className="list-disc list-inside text-[var(--color-font-primary)] text-sm space-y-1 mt-1 ml-2">
                <li>
                  Managed, updated, and optimized up to 18 educational websites
                  with a focus on conversion and user experience, collaborating
                  with IT, Marketing, and HR teams. Tech stack: WordPress, PHP,
                  JavaScript, jQuery, HTML, CSS.
                </li>
                <li>
                  Designed and implemented landing pages to support marketing,
                  recruitment, and enrollment efforts.
                </li>
                <li>
                  Developed and executed{" "}
                  <strong className={locationClass}>
                    data-driven digital campaigns
                  </strong>
                  , building custom Salesforce web forms that enhanced user
                  engagement and streamlined data collection.
                </li>
                <li>
                  Integrated Marketo and Salesforce web forms into landing
                  pages, creating a seamless lead-generation flow with automated
                  data capture and routing.
                </li>
                <li>
                  Led all SEO/SEM strategy and optimization, improving search
                  visibility, lead quality, and inbound traffic.
                </li>
              </ul>
            </div>
          </section>

          {/* XebiaLabs */}
          <section className="pb-6 border-b border-dashed border-[var(--color-petal-border)]">
            <p className="font-semibold text-[var(--color-font-primary)] text-sm">
              XebiaLabs{" "}
              <span className={locationClass}>- Boston, MA</span>
            </p>
            <div className="mt-2">
              <p className="text-[var(--color-font-primary)] text-sm font-bold">
                Digital Marketing Manager | Dec 2014 - Oct 2015
              </p>
              <ul className="list-disc list-inside text-[var(--color-font-primary)] text-sm space-y-1 mt-1 ml-2">
                <li>
                  Built responsive web pages, landing pages, and web banners
                  using HTML5, CSS3, JavaScript, and MODX.
                </li>
                <li>
                  Conducted A/B testing of landing pages and web banners, using
                  Google Analytics for conversion tracking and performance
                  analysis to continuously optimize campaign effectiveness.
                </li>
              </ul>
            </div>
          </section>
        </div>

        {/* Right column */}
        <div className="space-y-6">

          {/* UI/UX Contractor */}
          <section className="pb-6">
            <p className="font-bold text-[var(--color-font-primary)] text-sm">
              UI / UX / Web Projects Contractor{" "}
              <span className={locationClass}>- Boston, MA</span>
            </p>
            <div className="mt-3 space-y-3">
              <div>
                <p className="font-semibold text-[var(--color-font-primary)] text-sm">
                  Invite Education LLC
                </p>
                <p className="font-semibold text-[var(--color-font-primary)] text-sm">
                  Jun 2013 - Dec 2014
                </p>
                <ul className="list-disc list-inside text-[var(--color-font-primary)] text-sm space-y-1 mt-1 ml-2">
                  <li>
                    Created wireframes, prototypes, and presented products to
                    customers.
                  </li>
                  <li>
                    Consulted on UX and content strategies and worked on-site
                    with backend team located in San Francisco.
                  </li>
                  <li>
                    Developed UI and layout elements using Slim, jQuery, CSS,
                    and Ruby on Rails.
                  </li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-[var(--color-font-primary)] text-sm">
                  Boston Strategics
                </p>
                <p className="font-semibold text-[var(--color-font-primary)] text-sm">
                  Aug 2013 - Dec 2014
                </p>
                <ul className="list-disc list-inside text-[var(--color-font-primary)] text-sm space-y-1 mt-1 ml-2">
                  <li>
                    Designed and developed a custom{" "}
                    <strong className={locationClass}>WordPress website</strong>{" "}
                    to support company marketing and content needs.
                  </li>
                  <li>
                    Customized and extended WordPress themes, including layout
                    adjustments, UI styling, and plugin configuration to improve
                    functionality and user experience. Trained the team to make
                    feature updates.
                  </li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-[var(--color-font-primary)] text-sm">
                  UMass Boston
                </p>
                <p className="font-semibold text-[var(--color-font-primary)] text-sm">
                  Jun 2013 - Jan 2014
                </p>
                <ul className="list-disc list-inside text-[var(--color-font-primary)] text-sm space-y-1 mt-1 ml-2">
                  <li>
                    Developed an interactive{" "}
                    <strong className={locationClass}>
                      Google Maps API-based map
                    </strong>{" "}
                    for a MOOC platform using JavaScript to enhance user
                    navigation and course engagement.
                  </li>
                  <li>
                    Performed mobile testing and responsive optimizations to
                    ensure a seamless, multi-device experience.
                  </li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-[var(--color-font-primary)] text-sm">
                  College Miner
                </p>
                <p className="font-semibold text-[var(--color-font-primary)] text-sm">
                  Jun 2013 - Dec 2014
                </p>
                <ul className="list-disc list-inside text-[var(--color-font-primary)] text-sm space-y-1 mt-1 ml-2">
                  <li>
                    Designed and developed a responsive WordPress website to
                    establish the company&apos;s online presence.
                  </li>
                  <li>
                    Produced{" "}
                    <strong className={locationClass}>brand identity assets</strong>
                    , including logo concepts, color palettes, and marketing
                    visuals.
                  </li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-[var(--color-font-primary)] text-sm">
                  Bioarray
                </p>
                <p className="font-semibold text-[var(--color-font-primary)] text-sm">
                  July 2013 – Sep 2013
                </p>
                <ul className="list-disc list-inside text-[var(--color-font-primary)] text-sm space-y-1 mt-1 ml-2">
                  <li>
                    Optimized HTML, JavaScript, and web content, improving site
                    performance, accessibility, and readability.
                  </li>
                  <li>
                    Assessed and redesigned key UI elements to deliver a more
                    polished, cohesive, and user-friendly website experience.
                  </li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-[var(--color-font-primary)] text-sm">
                  I-volutions
                </p>
                <p className="font-semibold text-[var(--color-font-primary)] text-sm">
                  Oct 2012 - Nov 2012
                </p>
                <ul className="list-disc list-inside text-[var(--color-font-primary)] text-sm space-y-1 mt-1 ml-2">
                  <li>
                    Provided{" "}
                    <strong className={locationClass}>front-end support</strong>{" "}
                    on a website project, assisting with UI updates and
                    functionality improvements.
                  </li>
                  <li>
                    Updated and optimized{" "}
                    <strong className={locationClass}>
                      HTML5 and JavaScript code
                    </strong>{" "}
                    for improved performance and maintainability.
                  </li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-[var(--color-font-primary)] text-sm">
                  Refuge Place International Inc.
                </p>
                <p className="font-semibold text-[var(--color-font-primary)] text-sm">
                  Dec 2012 - Jan 2013
                </p>
                <ul className="list-disc list-inside text-[var(--color-font-primary)] text-sm space-y-1 mt-1 ml-2">
                  <li>
                    Designed and developed a responsive WordPress website to
                    support the organization&apos;s mission.
                  </li>
                  <li>
                    Contributed to the organization&apos;s fundraising efforts
                    for women&apos;s and children&apos;s hospital services in
                    Liberia, increasing awareness and donor support.
                  </li>
                  <li>
                    Built a robust{" "}
                    <strong className={locationClass}>
                      PayPal-based donation system
                    </strong>
                    , enabling secure online contributions and helping the
                    organization reach its fundraising goals.
                  </li>
                </ul>
              </div>
              <div className="pb-6 border-b border-dashed border-[var(--color-petal-border)]">
                <p className="font-semibold text-[var(--color-font-primary)] text-sm">
                  Global Peace Aid, Inc.
                </p>
                <p className="font-semibold text-[var(--color-font-primary)] text-sm">
                  Jun 2012 - Jun 2013
                </p>
                <ul className="list-disc list-inside text-[var(--color-font-primary)] text-sm space-y-1 mt-1 ml-2">
                  <li>
                    Managed website content and publishing, ensuring accurate,
                    timely, and engaging updates.
                  </li>
                  <li>
                    Designed graphics, logos, and visual assets to support
                    campaigns and organizational branding.
                  </li>
                  <li>
                    Built a secure PayPal donation page, significantly improving
                    the organization&apos;s ability to collect online
                    contributions and helping them raise substantial funds for
                    their humanitarian initiatives.
                  </li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-[var(--color-font-primary)] text-sm mt-2">
                  ClariLegal LLC{" "}
                  <span className={locationClass}>- Boston, MA</span>
                </p>
                <p className="font-semibold text-[var(--color-font-primary)] text-sm mt-1">
                  User Interface Development Intern | Apr 2013 - Sep 2013
                </p>
                <ul className="list-disc list-inside text-[var(--color-font-primary)] text-sm space-y-1 mt-1 ml-2">
                  <li>
                    Designed and developed UI components and front-end page
                    layouts for the company&apos;s legal-tech platform.
                  </li>
                  <li>
                    Created wireframes, Photoshop mockups, and interactive
                    prototypes to communicate design solutions.
                  </li>
                  <li>
                    Translated wireframes into front-end implementations using
                    HTML, CSS, and JavaScript.
                  </li>
                </ul>
              </div>
            </div>
          </section>

        </div>
      </div>
    </main>
  );
}
