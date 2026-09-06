import { Link } from 'react-router-dom';

export function FieldNotesPage() {
  return (
    <div className="notes-page page-wrap">
      <header className="page-heading"><p className="eyebrow">THE LIVING NOTEBOOK</p><h1>Field notes,<br /><span>when they are ready.</span></h1><p>Every published observation will remain tied to a real place, visit and date.</p></header>
      <section className="notes-empty">
        <span className="empty-note-mark" aria-hidden="true">01</span>
        <div><p className="eyebrow">EDITORIAL STATUS</p><h2>No field notes published yet.</h2><p>Five lake records are being prepared for future visits. We will publish them only after the notes, locations and evidence have been personally verified.</p><Link className="primary-action" to="/lakes">Browse the official directory <span>→</span></Link></div>
      </section>
      <section className="publishing-checklist"><p className="eyebrow">WHAT A PUBLISHED NOTE WILL INCLUDE</p><div><span>01</span><p><b>Lake identity</b>Official names, custody and sources.</p></div><div><span>02</span><p><b>Dated observations</b>What was seen, where and when.</p></div><div><span>03</span><p><b>Field evidence</b>Verified photography, coordinates and GPX where available.</p></div><div><span>04</span><p><b>Change over time</b>Later visits remain comparable to earlier ones.</p></div></section>
    </div>
  );
}
