import Link from "next/link";
import HomeBrandStatement from "./HomeBrandStatement";
import {
  AwardIcon,
  FileTextIcon,
  GithubIcon,
  LayoutGridIcon,
  LinkedInIcon,
  UserIcon,
  UsersIcon,
} from "./FlowerIcons";

const petals = [
  {
    label: "Web Projects",
    href: "/web-projects",
    Icon: LayoutGridIcon,
  },
  {
    label: "Resume",
    href: "/resume",
    Icon: FileTextIcon,
  },
  {
    label: "Certificates",
    href: "/certificates",
    Icon: AwardIcon,
  },
  {
    label: "GitHub",
    href: "https://github.com/daisylaflamme/portfolio-nextjs",
    target: "_blank",
    Icon: GithubIcon,
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/desislavalaflamme/",
    target: "_blank",
    Icon: LinkedInIcon,
  },
  {
    label: "About Me",
    href: "/about",
    Icon: UserIcon,
  },
];

export default function Home() {
  return (
    <div className="home-hero">
      <div className="flower_shell">
        <nav className="flower_container" aria-label="Portfolio sections">
          <Link href="/contact" className="flower_center ios-icon">
            <span className="flower_center_content">
              <UsersIcon className="flower_center_icon" />
              <span className="flower_center_label">Connect</span>
            </span>
          </Link>
          {petals.map((petal) => {
            const { Icon } = petal;
            return (
              <Link
                key={petal.label}
                href={petal.href}
                target={petal.target || "_self"}
                rel={petal.target === "_blank" ? "noopener noreferrer" : undefined}
                className="flower_petal ios-icon"
              >
                <span className="flower_petal_content">
                  <Icon className="flower_petal_icon" />
                  <span className="flower_petal_label">{petal.label}</span>
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
      <HomeBrandStatement />
    </div>
  );
}
