import Education from "@/components/Education";
import GoToTop from "../GoToTop";

export default function CertificatesPage() {
  return (
    <main className="font-inter min-h-screen py-8 px-4 md:px-8" id="main-content">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-display text-[clamp(2rem,5vw,3rem)] font-bold tracking-tight text-fg mb-8">Education and certificates</h1>
        <Education />
      </div>
      <GoToTop />
    </main>
  );
}
