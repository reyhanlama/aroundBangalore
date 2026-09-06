import { Link, useParams } from 'react-router-dom';
import { ExternalMapActions } from '../components/ExternalMapActions';
import { StatusTag } from '../components/StatusTag';
import { lakeBySlug, lakes } from '../data/catalog';
import { reportBySlug } from '../data/reports';

export function LakeDetailPage() {
  const { slug = '' } = useParams();
  const lake = lakeBySlug.get(slug);
  const report = reportBySlug.get(slug);
  if (!lake) return <div className="page-wrap missing"><h1>Lake not found.</h1><Link to="/lakes">Return to all lakes</Link></div>;

  const displayName = lake.aliases[0] || lake.name;
  const correctionUrl = `https://github.com/reyhanlama/aroundBangalore/issues/new?${new URLSearchParams({
    title: `Catalogue correction: ${displayName}`,
    body: `Lake record: ${lake.id}\n\nWhat should be corrected?\n`
  })}`;
  const related = lakes
    .filter((item) => item.id !== lake.id && (item.zone === lake.zone || item.custodian === lake.custodian))
    .sort((a, b) => Number(b.zone === lake.zone) - Number(a.zone === lake.zone) || a.name.localeCompare(b.name))
    .slice(0, 3);

  if (report) {
    const visit = report.visits[0];
    return (
      <article className="report-page page-wrap">
        <header className="record-header verified-header">
          <Link className="back-link" to={`/?lake=${lake.slug}`}>← Back to map</Link>
          <p className="eyebrow">FIELD-CHECKED · {visit.visitedAt}</p>
          <h1>{displayName}</h1>
          <p>{report.summary}</p>
          <ExternalMapActions lake={lake} />
        </header>
        <section className="report-section evidence-section">
          <p className="eyebrow">WHAT THIS LAKE IS</p>
          <h2>Official identity and field evidence, kept separate.</h2>
          <dl className="source-facts"><div><dt>Official name</dt><dd>{lake.name}</dd></div><div><dt>Custodian</dt><dd>{lake.custodian}</dd></div><div><dt>Source area</dt><dd>{lake.zone}</dd></div></dl>
        </section>
        <section className="report-section observation-section">
          <p className="eyebrow">WHAT WE OBSERVED</p>
          <h2>Field notes from {visit.visitedAt}</h2>
          <p className="visit-note">{visit.note}</p>
          <div className="observation-list">{visit.observations.map((item) => <div key={item.category}><b>{item.category.replace('_', ' ')}</b><span>{item.value || item.state.replace('_', ' ')}</span></div>)}</div>
        </section>
        <section className="report-section evidence-footer"><p className="eyebrow">FIELD EVIDENCE</p><p>Visit time: {visit.time} · {visit.weather}. Routes and photographs appear here only when their source files have been verified.</p></section>
      </article>
    );
  }

  return (
    <article className="lake-entry page-wrap">
      <header className="record-header">
        <Link className="back-link" to="/lakes">← All lakes</Link>
        <p className="record-meta">{lake.custodian} · {lake.zone}</p>
        <h1>{displayName}</h1>
        {lake.aliases[0] && <p className="official-name">Official record: {lake.name}</p>}
        <StatusTag status={lake.status} />
        <div className="record-actions">
          {lake.coordinates && <Link className="secondary-action" to={`/?lake=${lake.slug}`}>See on Nadi map</Link>}
          <ExternalMapActions lake={lake} />
        </div>
      </header>

      <section className="field-status-panel">
        <span className="record-marker" aria-hidden="true" />
        <div><p className="eyebrow">FIELD STATUS</p><h2>Not yet field-checked.</h2><p>Nadi has not visited this lake. We make no claims about current access, paths, conditions, habitat or safety.</p></div>
      </section>

      <div className="knowledge-grid">
        <section className="knowledge-section known-section">
          <p className="eyebrow">KNOWN FROM OFFICIAL RECORDS</p>
          <h2>What the catalogue tells us</h2>
          <dl className="source-facts">
            <div><dt>Official name</dt><dd>{lake.name}</dd></div>
            <div><dt>Alternate names</dt><dd>{lake.aliases.length ? lake.aliases.join(', ') : 'None recorded'}</dd></div>
            <div><dt>Custodian</dt><dd>{lake.custodian}</dd></div>
            <div><dt>Ward</dt><dd>{lake.ward}</dd></div>
            <div><dt>Source area</dt><dd>{lake.zone}</dd></div>
            <div><dt>Administrative area</dt><dd>{lake.administrativeArea}</dd></div>
            <div><dt>Location</dt><dd>{lake.locationVerification ? <>Verified against a geospatial source · {lake.locationVerification.verifiedAt}<br /><a href={lake.locationVerification.sourceUrl} target="_blank" rel="noreferrer">Open coordinate source ↗</a></> : 'Not sufficiently verified for mapping'}</dd></div>
            <div><dt>Source date</dt><dd>{lake.source.publishedAt}</dd></div>
            <div><dt>Retrieved</dt><dd>{lake.source.retrievedAt}</dd></div>
          </dl>
          <div className="record-links"><a className="source-link" href={lake.source.url} target="_blank" rel="noreferrer">View official inventory source ↗</a><a className="source-link" href={correctionUrl} target="_blank" rel="noreferrer">Suggest a catalogue correction ↗</a></div>
        </section>

        <section className="knowledge-section unknown-section">
          <p className="eyebrow">NOT YET KNOWN</p>
          <h2>What requires a field visit</h2>
          <ul className="unknown-list">
            <li>Current public access</li>
            <li>Confirmed entrances</li>
            <li>Water-edge and habitat conditions</li>
            <li>Paths, lighting and safety</li>
            <li>Changes since the source record</li>
          </ul>
          <p>Missing observations remain unknown until a dated visit can support them.</p>
        </section>
      </div>

      {related.length > 0 && <section className="related-records"><p className="eyebrow">RELATED CATALOGUE RECORDS</p><h2>More from this custodian or source area</h2>{related.map((item) => <Link key={item.id} to={`/lakes/${item.slug}`}><span>{item.aliases[0] || item.name}</span><small>{item.custodian} · {item.zone}</small><b>→</b></Link>)}</section>}
    </article>
  );
}
