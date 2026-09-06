export function AboutPage() {
  return (
    <div className="about-page page-wrap">
      <header className="page-heading"><p className="eyebrow">ABOUT NADI</p><h1>A field guide<br /><span>that shows its gaps.</span></h1><p>Nadi joins an official lake catalogue with a smaller set of dated, personally verified observations.</p></header>

      <section className="principles">
        <article><span>01</span><h2>Catalogue is not endorsement</h2><p>A listed lake may not be accessible, restored or suitable for a visit. Until we go, it remains unassessed.</p></article>
        <article><span>02</span><h2>Place and time are part of the evidence</h2><p>Conditions change. Every observation retains the location, date and source that support it.</p></article>
        <article><span>03</span><h2>Unknown stays unknown</h2><p>Nadi does not turn missing observations into assumptions. “Not checked” is useful information.</p></article>
      </section>

      <section className="method-section">
        <p className="eyebrow">HOW TO READ NADI</p><h2>Four statuses, two kinds of verification.</h2>
        <dl className="glossary">
          <div><dt>Not yet field-checked</dt><dd>An official record exists, but Nadi has not made a dated personal visit.</dd></div>
          <div><dt>Report in progress</dt><dd>A visit has taken place, but its evidence and writing are not ready to publish.</dd></div>
          <div><dt>Field-checked</dt><dd>A dated personal observation has been reviewed and published.</dd></div>
          <div><dt>Temporarily inaccessible</dt><dd>A dated source or visit indicates access is currently restricted. The date must stay visible.</dd></div>
          <div><dt>Location verified</dt><dd>The catalogue coordinate is sufficiently supported to show on the map. This does not confirm an entrance.</dd></div>
          <div><dt>Entrance verified</dt><dd>A specific public entrance has an authoritative source or dated field confirmation.</dd></div>
        </dl>
      </section>

      <section className="method-section evidence-method">
        <p className="eyebrow">FIELD METHOD</p><h2>What we record—and what we never infer.</h2>
        <div className="method-columns"><div><h3>Recorded during visits</h3><p>Visit time, observation location, water edge, habitat, access, paths, photographs and visible changes.</p></div><div><h3>Never inferred from absence</h3><p>Safety, accessibility, environmental quality, route suitability or current conditions.</p></div></div>
      </section>

      <section className="offline-panel"><p className="eyebrow">OFFLINE USE</p><h2>The directory travels with you.</h2><p>After the app is installed, the shell and complete text directory remain available offline. Previously opened reports are cached. Basemap tiles require a connection and show a clear offline state when unavailable.</p></section>

      <section className="source-panel"><p className="eyebrow">CATALOGUE SOURCE</p><h2>210-record launch snapshot</h2><p>Compiled from Government of Karnataka authority lists made available through OpenCity. Original spelling and possible duplication are retained where automatic merging could hide uncertainty.</p><a href="https://data.opencity.in/dataset/bengaluru-lakes-and-their-maintainers" target="_blank" rel="noreferrer">Open source dataset ↗</a><a href="https://site.bbmp.gov.in/departmentwebsites/Lakes/index.html" target="_blank" rel="noreferrer">Open BBMP Lakes Department ↗</a><small>Source publication: 2024 · Retrieved: 05 Sep 2026 · Snapshot version: 2026.09</small></section>
    </div>
  );
}
