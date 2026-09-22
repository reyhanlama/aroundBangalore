import { Link } from 'react-router-dom';
import { custodianLabel, statusLabel } from '../data/catalog';
import type { LakeIndexEntry } from '../types';
import { AtlasMap } from './AtlasMap';
import { ExternalMapActions } from './ExternalMapActions';
import { LakeLoopGlyph } from './LakeLoopGlyph';

type LakeIdentityHeroProps = {
  lake: LakeIndexEntry;
  summary?: string;
  reportDate?: string;
  isSample?: boolean;
  hasVisitNotes?: boolean;
};

const ignoreMapSelection = () => undefined;

export function LakeIdentityHero({ lake, summary, reportDate, isSample = false, hasVisitNotes = false }: LakeIdentityHeroProps) {
  const displayName = lake.aliases[0] || lake.name;
  const hasVerifiedMap = Boolean(lake.coordinates && lake.locationVerification?.status === 'verified');
  const fieldLabel = isSample ? 'Sample preview' : statusLabel[lake.status];

  return (
    <>
      <section className={`lake-identity-stage ${hasVerifiedMap ? 'has-verified-map' : 'has-illustrated-identity'}`}>
        <div className="lake-identity-visual" aria-label={hasVerifiedMap ? `Verified map location for ${displayName}` : undefined}>
          {hasVerifiedMap
            ? <AtlasMap lakes={[lake]} selected={lake} onSelect={ignoreMapSelection} compact cinematic />
            : <div className="lake-identity-loop"><LakeLoopGlyph seed={lake.id} /><span>Illustrative identity · location not verified</span></div>}
        </div>
        <div className="lake-identity-shade" aria-hidden="true" />
        <div className="lake-identity-copy">
          <Link className="identity-back-link" to="/">← All lakes</Link>
          <p className="eyebrow">{isSample ? 'SAMPLE FIELD NOTE · NOT FIELD-CHECKED' : reportDate ? `FIELD NOTE · ${reportDate}` : 'BENGALURU LAKE RECORD'}</p>
          <h1>{displayName}</h1>
          {lake.aliases[0] && <p className="identity-official-name">Official record: {lake.name}</p>}
          {summary && <p className="identity-summary">{summary}</p>}
        </div>
        <div className="lake-identity-facts" aria-label="Lake at a glance">
          <div><small>FIELD STATUS</small><b>{fieldLabel}</b></div>
          <div><small>LOCATION</small><b>{hasVerifiedMap ? 'Verified map pin' : 'Not mapped'}</b></div>
          <div><small>MAINTAINED BY</small><b>{custodianLabel[lake.custodian]}</b></div>
        </div>
      </section>

      <nav className="lake-action-dock" aria-label="Lake actions">
        {hasVerifiedMap && <Link to={`/explore?lake=${lake.slug}`}><span aria-hidden="true">⌖</span> Full map</Link>}
        {hasVerifiedMap && <ExternalMapActions lake={lake} compact />}
        <a href={hasVisitNotes ? '#visit-notes' : '#official-record'}><span aria-hidden="true">↓</span> {hasVisitNotes ? 'Visit notes' : 'Lake record'}</a>
        <a href={lake.source.url} target="_blank" rel="noreferrer"><span aria-hidden="true">↗</span> Source</a>
      </nav>
    </>
  );
}
