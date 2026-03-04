import Link from "next/link";

export default function Home() {
  const petals = [
    { label: "Resume", href: "/resume" },
    { label: "Photography", href: "http://photography.daisylaflamme.net/portfolio.html", target: "_blank" },
    { label: "GitHub", href: "https://github.com/daisylaflamme", target: "_blank" },
    { label: "Email", href: "mailto:laflammedaisy@gmail.com", title: "laflammedaisy@gmail.com" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/desislavalaflamme/", target: "_blank" },
    { label: "Web Projects", href: "/web-projects" },
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
