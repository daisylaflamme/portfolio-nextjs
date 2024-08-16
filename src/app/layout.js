import "./globals.css";
import Header from "./Header";
import NavMenu from "./NavMenu";

export const metadata = {
  title: "Daisy Laflamme | Senior UI & Front-End Engineer Portfolio",
  description: "Portfolio of Daisy Laflamme, Senior UI and Front-End Engineer specializing in modern UI architecture, Angular and React development, e-commerce interfaces, design systems, and high-quality user experience engineering.",
  icons: {
    icon: "/images/daisy.ico",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-inter">
        <Header />
        <NavMenu />
        {children}
      </body>
    </html>
  );
}
