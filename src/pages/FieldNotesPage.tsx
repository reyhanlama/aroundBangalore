import { Link } from 'react-router-dom';
import { reports } from '../data/reports';
import { lakeBySlug } from '../data/catalog';

export function FieldNotesPage() {
  return (
    <div className="notes-page page-wrap">
      <header className="page-heading"><p className="eyebrow">THE LIVING NOTEBOOK</p><h1>Field notes,<br /><span>visit by visit.</span></h1><p>Conditions change. Every observation stays tied to when it was seen.</p></header>
      <div className="draft-banner"><b>DEMO CONTENT</b><span>These five report structures are ready for your verified visits, GPX tracks and photography.</span></div>
      <section className="notes-timeline">
        {reports.map((report, index) => {
          const lake = lakeBySlug.get(report.lakeSlug)!;
          const visit = report.visits[0];
          return <Link key={report.lakeSlug} to={`/lakes/${report.lakeSlug}`} className="note-row"><div className="timeline-date"><b>{visit.visitedAt.slice(8)}</b><span>SEP</span></div><div><small>DRAFT {String(index + 1).padStart(2,'0')}</small><h2>{lake.aliases[0] || lake.name}</h2><p>{report.summary}</p></div><span className="row-arrow">↗</span></Link>;
        })}
      </section>
    </div>
  );
}
