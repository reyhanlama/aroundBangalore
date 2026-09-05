import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { lakeBySlug } from '../data/catalog';
import { reportBySlug } from '../data/reports';
import { StatusTag } from '../components/StatusTag';

export function LakeDetailPage() {
  const { slug = '' } = useParams();
  const lake = lakeBySlug.get(slug);
  const report = reportBySlug.get(slug);
  const [observation, setObservation] = useState('shade');
  if (!lake) return <div className="page-wrap missing"><h1>Lake not found.</h1><Link to="/lakes">Return to all lakes</Link></div>;

  if (!report) return (
    <div className="lake-entry page-wrap">
      <Link className="back-link" to="/lakes">← All lakes</Link>
      <div className="entry-hero"><p>{lake.custodian} · {lake.zone}</p><h1>{lake.name}</h1><StatusTag status={lake.status} /></div>
      <section className="unrated-panel"><span className="big-diamond" /><div><p className="eyebrow">FIELD STATUS</p><h2>Not yet field-checked.</h2><p>Nadi has not visited this lake, so there are no claims about access, paths, conditions or experience.</p></div></section>
      <dl className="source-facts"><div><dt>Ward</dt><dd>{lake.ward}</dd></div><div><dt>Custodian</dt><dd>{lake.custodian}</dd></div><div><dt>Catalogue retrieved</dt><dd>{lake.source.retrievedAt}</dd></div></dl>
      <a className="source-link" href={lake.source.url} target="_blank" rel="noreferrer">View inventory source ↗</a>
    </div>
  );

  const visit = report.visits[0];
  return (
    <article className="report-page">
      <header className="report-hero">
        <Link className="back-link" to={`/?lake=${lake.slug}`}>← Back to map</Link>
        <div className="hero-contours" aria-hidden="true"><i /><i /><i /><i /></div>
        <div className="report-title"><p>{lake.zone} · {lake.custodian}</p><h1>{lake.aliases[0] || lake.name}</h1><span>{report.distanceKm} KM · {report.surface}</span></div>
      </header>
      {report.verification === 'sample' && <div className="draft-banner"><b>DEMO FIELD REPORT</b><span>This illustrates the format. Replace it with verified visit data before publishing.</span></div>}
      <section className="report-section report-summary"><p className="eyebrow">THE CURRENT NOTE</p><h2>{report.summary}</h2><div className="visit-stamp"><span>{visit.visitedAt}</span><span>{visit.time}</span><span>{visit.weather}</span></div></section>
      <section className="report-section route-observations">
        <header><p className="eyebrow">AROUND THE LOOP</p><h2>Conditions belong<br />to a place.</h2></header>
        <div className="route-graphic" aria-label={`Route observation: ${observation}`}><svg viewBox="0 0 420 330"><path className="route-muted" d="M61 171C52 78 160 38 264 74s109 125 63 186-139 58-205 27-55-77-61-116Z"/><path className={`route-focus focus-${observation}`} d="M61 171C52 78 160 38 264 74s109 125 63 186-139 58-205 27-55-77-61-116Z"/><circle cx="61" cy="171" r="8" /></svg></div>
        <div className="observation-tabs">{visit.observations.slice(0,4).map((item) => <button key={item.category} className={observation === item.category ? 'active' : ''} onClick={() => setObservation(item.category)}><b>{item.category}</b><span>{item.value || item.state.replace('_',' ')}</span></button>)}</div>
      </section>
      <section className="report-section note-section"><p className="eyebrow">LATEST FIELD NOTE</p><blockquote>“{visit.note}”</blockquote><div className="photo-pending">DOCUMENTARY PHOTOGRAPHY PENDING VERIFIED FIELD VISIT</div></section>
    </article>
  );
}
