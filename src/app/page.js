import Link from "next/link";

export default function Home() {
  const petals = [
    { label: "Web Projects", href: "/web-projects" },
    { label: "Resume", href: "/resume" },
    { label: "Certificates", href: "/certificates" },
    { label: "GitHub", href: "https://github.com/daisylaflamme/portfolio-nextjs", target: "_blank" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/desislavalaflamme/", target: "_blank" },
    { label: "About Me", href: "/about" },
  ];

  return (
    <nav className="flower_container">
        <Link href="/contact" className="flower_center ios-icon">
          Connect
        </Link>
        {petals.map((petal, index) => (
          <Link
            key={index}
            href={petal.href}
            target={petal.target ? petal.target : "_self"}
            title={petal.title ? petal.title : ""}
            className="flower_petal ios-icon"
          >
            {/* <span><img src='/in.png' alt={petal.label} width={24} height={24} /></span> */}
            <span>{petal.label}</span>
          </Link>
        ))}
    </nav>
    
  );
}
