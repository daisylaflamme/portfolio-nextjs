import { FileTextIcon, LayoutGridIcon } from "../FlowerIcons";
import {
  AccessibilityIcon,
  AngularIcon,
  BoxIcon,
  CodeIcon,
  CreditCardIcon,
  GraduationCapIcon,
  MapPinIcon,
  NetworkIcon,
  PaletteIcon,
  PenToolIcon,
  ReactIcon,
  ShoppingCartIcon,
  SparklesIcon,
  StoreIcon,
  WordPressIcon,
} from "./FilterIcons";

export const ALL_PROJECTS_FILTER = { label: "All Projects", Icon: LayoutGridIcon };

/**
 * Filter chips for /web-projects, in display order.
 * A project matches a filter when it has any of the filter's `tags` (see `tags` in data/projects.js).
 * `placement: "primary"` renders in the visible row; `"more"` renders in the More menu.
 */
export const PROJECT_FILTERS = [
  { id: "angular", label: "Angular", Icon: AngularIcon, tags: ["angular"], placement: "primary" },
  { id: "react", label: "React / Next.js", Icon: ReactIcon, tags: ["react", "nextjs"], placement: "primary" },
  { id: "ecommerce", label: "Ecommerce", Icon: ShoppingCartIcon, tags: ["ecommerce"], placement: "primary" },
  { id: "payments", label: "Payments", Icon: CreditCardIcon, tags: ["payments"], placement: "primary" },
  { id: "apis", label: "APIs / Integrations", Icon: NetworkIcon, tags: ["api-integrations"], placement: "primary" },
  { id: "maps", label: "Maps / Geospatial", Icon: MapPinIcon, tags: ["maps"], placement: "primary" },
  { id: "ui-components", label: "UI Components", Icon: BoxIcon, tags: ["ui-components"], placement: "primary" },
  { id: "cms", label: "CMS", Icon: FileTextIcon, tags: ["cms"], placement: "primary" },

  { id: "accessibility", label: "Accessibility", Icon: AccessibilityIcon, tags: ["accessibility"], placement: "more" },
  { id: "javascript", label: "JavaScript / TypeScript", Icon: CodeIcon, tags: ["javascript", "typescript"], placement: "more" },
  { id: "styling", label: "Styling / CSS", Icon: PaletteIcon, tags: ["css", "scss", "tailwind", "bootstrap"], placement: "more" },
  { id: "wordpress", label: "WordPress", Icon: WordPressIcon, tags: ["wordpress"], placement: "more" },
  { id: "ux-design", label: "UI/UX Design", Icon: PenToolIcon, tags: ["ux-design", "ux", "product-design"], placement: "more" },
  { id: "ai", label: "AI", Icon: SparklesIcon, tags: ["ai"], placement: "more" },
  { id: "education", label: "Education / Volunteer", Icon: GraduationCapIcon, tags: ["instructional-design", "volunteer"], placement: "more" },
  { id: "startups", label: "Startups & Small Business", Icon: StoreIcon, tags: ["startup", "small-business"], placement: "more" },
];
