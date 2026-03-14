import "./globals.css";
import Header from "./Header";
import NavMenu from "./NavMenu";
import Dock from "./Dock";
import Footer from "./Footer";

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

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
      <body className="font-inter pb-20 lg:pb-0 flex flex-col min-h-screen">
        <Header />
        <NavMenu />
        <div className="flex-1 flex flex-col">
          {children}
        </div>
        <Dock />
        <Footer />
      </body>
    </html>
  );
}
