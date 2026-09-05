export function AboutPage() {
  return (
    <div className="about-page page-wrap">
      <header className="page-heading"><p className="eyebrow">ABOUT NADI</p><h1>Observed on foot.<br /><span>Honest about gaps.</span></h1><p>Nadi joins an official lake catalogue with a smaller, carefully visited field guide.</p></header>
      <section className="principles">
        <article><span>01</span><h2>Catalogue is not endorsement</h2><p>A listed lake may not be accessible, restored or suitable for a visit. Until we go, it remains unassessed.</p></article>
        <article><span>02</span><h2>Time is part of the data</h2><p>Smell, paths, crowds and water edges change. Observations always retain their visit date and time.</p></article>
        <article><span>03</span><h2>Unknown stays unknown</h2><p>Nadi does not turn missing observations into assumptions. “Not checked” is useful information.</p></article>
      </section>
      <section className="source-panel"><p className="eyebrow">CATALOGUE SOURCE</p><h2>210-record launch snapshot</h2><p>Compiled from Government of Karnataka authority lists made available through OpenCity. The inventory is versioned because official custody and records can change.</p><a href="https://data.opencity.in/dataset/bengaluru-lakes-and-their-maintainers" target="_blank" rel="noreferrer">Open source dataset ↗</a><small>Source publication: 2024 · Retrieved: 05 Sep 2026</small></section>
    </div>
  );
}
