import { Link } from 'react-router-dom';
import { lakeBySlug } from '../data/catalog';
import { reports, sampleReports } from '../data/reports';
import { illustrationForSample } from '../data/illustrations';

function compactDate(value: string) {
  return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(`${value}T12:00:00`));
}

export function FieldNotesPage() {
  const visibleReports = reports.length ? reports : sampleReports;
  const showingSamples = reports.length === 0;

  return (
    <div className="notes-page page-wrap">
      <header className="page-heading"><p className="eyebrow">THE LIVING NOTEBOOK</p><h1>From the water’s edge.</h1><p>Short, dated observations from each visit—without asking you to track another activity.</p></header>
      {showingSamples && <aside className="sample-disclaimer"><span>DEMO</span><div><b>These are sample field notes.</b><p>The structure is real; the observations, scores and activity values are placeholders. They do not describe current lake conditions.</p></div></aside>}
      <section className="field-note-index" aria-label={showingSamples ? 'Sample field notes' : 'Published field notes'}>
        {visibleReports.map((report, index) => {
          const lake = lakeBySlug.get(report.lakeSlug);
          const visit = report.visits[0];
          if (!lake || !visit) return null;
          return <Link className="field-note-row" key={report.lakeSlug} to={`/lakes/${report.lakeSlug}`}><span className="note-index">{String(index + 1).padStart(2, '0')}</span>{showingSamples && <img className="note-row-art" src={illustrationForSample(index)} alt="Conceptual editorial artwork, not a photograph of this lake" loading="lazy" />}<div className="note-main"><p className="eyebrow">{showingSamples ? 'SAMPLE REPORT · ILLUSTRATED' : 'FIELD NOTE'} · {compactDate(visit.visitedAt)}</p><h2>{lake.aliases[0] || lake.name}</h2><p>{report.summary}</p></div><dl><div><dt>Distance</dt><dd>{report.activity?.distanceKm ? `${report.activity.distanceKm} km` : '—'}</dd></div><div><dt>Time</dt><dd>{report.activity?.durationMinutes ? `${report.activity.durationMinutes} min` : '—'}</dd></div><div><dt>Source</dt><dd>{report.activity?.source.replace('_', ' ') ?? 'Notes'}</dd></div></dl><span className="note-arrow" aria-hidden="true">→</span></Link>;
        })}
      </section>
      <section className="publishing-checklist"><p className="eyebrow">WHAT A PUBLISHED NOTE WILL INCLUDE</p><div><span>01</span><p><b>Lake identity</b>Official names, custody and sources.</p></div><div><span>02</span><p><b>Dated observations</b>What was seen, where and when.</p></div><div><span>03</span><p><b>Field evidence</b>Verified photography, coordinates and GPX where available.</p></div><div><span>04</span><p><b>Change over time</b>Later visits remain comparable to earlier ones.</p></div></section>
      <Link className="notes-directory-link" to="/">Browse all 210 lake records <span>→</span></Link>
    </div>
  );
}
