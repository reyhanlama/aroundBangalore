import { Link, useParams } from 'react-router-dom';
import { LakeIdentityHero } from '../components/LakeIdentityHero';
import { custodianLabel, lakeBySlug, lakes } from '../data/catalog';
import { previewReportBySlug, sampleReports } from '../data/reports';
import { illustrationForSample } from '../data/illustrations';

export function LakeDetailPage() {
  const { slug = '' } = useParams();
  const lake = lakeBySlug.get(slug);
  const report = previewReportBySlug.get(slug);
  if (!lake) return <div className="page-wrap missing"><h1>Lake not found.</h1><Link to="/">Return to all lakes</Link></div>;

  const displayName = lake.aliases[0] || lake.name;
  const correctionUrl = `https://github.com/reyhanlama/aroundBangalore/issues/new?${new URLSearchParams({
    title: `Catalogue correction: ${displayName}`,
    body: `Lake record: ${lake.id}\n\nWhat should be corrected?\n`
  })}`;
  const related = lakes
    .filter((item) => item.id !== lake.id && (item.zone === lake.zone || item.custodian === lake.custodian))
    .sort((a, b) => Number(b.zone === lake.zone) - Number(a.zone === lake.zone) || a.name.localeCompare(b.name))
    .slice(0, 3);
  const possibleDuplicates = lakes.filter((item) => lake.duplicateCandidateIds?.includes(item.id));

  if (report) {
    const visit = report.visits[0];
    const isSample = report.verification === 'sample';
    return (
      <article className="report-page page-wrap">
        <LakeIdentityHero lake={lake} summary={report.summary} reportDate={visit.visitedAt} isSample={isSample} hasVisitNotes />
        {isSample && <aside className="sample-disclaimer report-sample-disclaimer"><span>DEMO</span><div><b>Preview content—not a claim about this lake.</b><p>Every observation, score and activity value below is placeholder data for reviewing the product flow.</p></div></aside>}
        {isSample && <figure className="report-editorial-art"><img src={illustrationForSample(Math.max(0, sampleReports.findIndex((item) => item.lakeSlug === lake.slug)))} alt="Conceptual city-lake artwork; not a photograph or verified view of this lake" /><figcaption>Editorial illustration · sample visit, not a verified lake view</figcaption></figure>}
        {report.activity && <section className="activity-strip" aria-label="Activity summary"><div><span>Distance</span><b>{report.activity.distanceKm ?? '—'} km</b></div><div><span>Moving time</span><b>{report.activity.durationMinutes ?? '—'} min</b></div><div><span>Elevation</span><b>{report.activity.elevationGainMetres ?? '—'} m</b></div><div><span>Imported from</span><b>{report.activity.source.replace('_', ' ')}</b></div></section>}
        <section id="official-record" className="report-section evidence-section">
          <p className="eyebrow">WHAT THIS LAKE IS</p>
          <h2>A little context.</h2>
          <dl className="source-facts"><div><dt>Official name</dt><dd>{lake.name}</dd></div><div><dt>Maintaining authority</dt><dd>{custodianLabel[lake.custodian]} ({lake.custodian})</dd></div><div><dt>Source area</dt><dd>{lake.zone}</dd></div></dl>
        </section>
        <section id="visit-notes" className="report-section observation-section">
          <p className="eyebrow">{isSample ? 'SAMPLE OBSERVATIONS' : 'WHAT WE OBSERVED'}</p>
          <h2>{isSample ? 'How a visit note could read' : `Field notes from ${visit.visitedAt}`}</h2>
          <p className="visit-note">{visit.note}</p>
          <div className="observation-list">{visit.observations.map((item) => <div key={item.category}><b>{item.category.replace('_', ' ')}</b><span>{item.value || item.state.replace('_', ' ')}</span></div>)}</div>
        </section>
        {report.ratings && <section className="report-section rating-section"><p className="eyebrow">{isSample ? 'SAMPLE SCORES' : 'VISIT RATINGS'}</p><h2>A quick read of this particular visit.</h2><div className="rating-list">{report.ratings.map((rating) => <div key={rating.category}><span>{rating.category}</span><i><b style={{ width: `${rating.score * 20}%` }} /></i><strong>{rating.score}/5</strong></div>)}</div><p>Ratings describe one dated visit, not a permanent quality score for the lake.</p></section>}
        <section className="report-section evidence-footer"><p className="eyebrow">{isSample ? 'ABOUT THIS PREVIEW' : 'FIELD EVIDENCE'}</p><p>{isSample ? 'No activity file, route or photograph has been verified for this sample. Replace these placeholders before publishing.' : `Visit time: ${visit.time} · ${visit.weather}. Routes and photographs appear here only when their source files have been verified.`}</p></section>
      </article>
    );
  }

  return (
    <article className="lake-entry page-wrap">
      <LakeIdentityHero lake={lake} />

      <section className="field-status-panel">
        <span className="record-marker" aria-hidden="true" />
        <div><p className="eyebrow">THE NEXT CHAPTER</p><h2>First-hand notes are still to come.</h2><p>This lake is in the directory. A personal visit will help us describe its paths, access and surroundings.</p></div>
      </section>

      <div className="knowledge-grid">
        <section id="official-record" className="knowledge-section known-section">
          <p className="eyebrow">KNOWN FROM OFFICIAL RECORDS</p>
          <h2>What the catalogue tells us</h2>
          <dl className="source-facts">
            <div><dt>Official name</dt><dd>{lake.name}</dd></div>
            <div><dt>Alternate names</dt><dd>{lake.aliases.length ? lake.aliases.join(', ') : 'None recorded'}</dd></div>
            <div><dt>Maintaining authority</dt><dd>{custodianLabel[lake.custodian]} ({lake.custodian})</dd></div>
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

      {possibleDuplicates.length > 0 && <aside className="identity-note"><p className="eyebrow">IDENTITY NOTE</p><h2>A similarly named official record is kept separate.</h2><p>Nadi does not merge catalogue entries without stronger evidence.</p>{possibleDuplicates.map((item) => <Link key={item.id} to={`/lakes/${item.slug}`}>Compare with {item.name} <span>→</span></Link>)}</aside>}

      {related.length > 0 && <section className="related-records"><p className="eyebrow">RELATED CATALOGUE RECORDS</p><h2>More from this custodian or source area</h2>{related.map((item) => <Link key={item.id} to={`/lakes/${item.slug}`}><span>{item.aliases[0] || item.name}</span><small>{item.custodian} · {item.zone}</small><b>→</b></Link>)}</section>}
    </article>
  );
}
