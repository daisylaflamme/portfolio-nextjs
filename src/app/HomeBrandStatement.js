/** Centered brand statement under the home flower navigation. */
export default function HomeBrandStatement() {
  return (
    <section className="home-brand" aria-label="Design philosophy">
      <div className="home-brand__motto">
        <span className="home-brand__rule" aria-hidden="true" />
        <p className="home-brand__eyebrow">Design • Develop • Create Impact</p>
        <span className="home-brand__rule" aria-hidden="true" />
      </div>
      <p className="home-brand__tagline">
        Thoughtful experiences for a more human-centered web
      </p>
    </section>
  );
}
