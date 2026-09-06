import { useRef, useState } from 'react';
import type { LakeIndexEntry } from '../types';
import { appleDirectionsUrl, appleLocationUrl, googleDirectionsUrl, googleLocationUrl } from '../utils/mapLinks';

export function ExternalMapActions({ lake, compact = false }: { lake: LakeIndexEntry; compact?: boolean }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [copied, setCopied] = useState(false);
  const isApple = /Mac|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const entrance = lake.entrances?.[0];

  if (!lake.coordinates || lake.locationVerification?.status !== 'verified') {
    return <p className="map-action-unavailable">Location not sufficiently verified. Use the official source record instead.</p>;
  }

  const name = lake.aliases[0] || lake.name;
  const locationLinks = [
    { label: entrance ? 'Directions in Google Maps' : 'Open in Google Maps', href: googleLocationUrl(lake.coordinates), provider: 'google' },
    { label: entrance ? 'Directions in Apple Maps' : 'Open in Apple Maps', href: appleLocationUrl(name, lake.coordinates), provider: 'apple' }
  ].sort((a, b) => isApple ? Number(b.provider === 'apple') - Number(a.provider === 'apple') : Number(b.provider === 'google') - Number(a.provider === 'google'));

  const copyCoordinates = async () => {
    const [longitude, latitude] = lake.coordinates!;
    try {
      await navigator.clipboard.writeText(`${latitude}, ${longitude}`);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <>
      <button className={compact ? 'map-action compact' : 'map-action'} onClick={() => dialog.current?.showModal()}>
        <span aria-hidden="true">⌖</span> {entrance ? `Navigate to ${entrance.label}` : 'View lake location'}
      </button>
      <dialog ref={dialog} className="map-choice" onClose={() => setCopied(false)}>
        <form method="dialog">
          <button className="dialog-close" aria-label="Close map options">×</button>
          <p className="eyebrow">EXTERNAL MAPS</p>
          <h2>{entrance ? `Navigate to ${entrance.label}` : 'View lake location'}</h2>
          <p>{entrance
            ? `This entrance was verified on ${entrance.verifiedAt}.`
            : 'This pin identifies the lake, not a confirmed public entrance.'}</p>
          <div className="map-choice-actions">
            {locationLinks.map((link) => {
              const coordinates = entrance?.coordinates ?? lake.coordinates!;
              const href = entrance
                ? link.provider === 'apple' ? appleDirectionsUrl(coordinates) : googleDirectionsUrl(coordinates)
                : link.href;
              return <a key={link.provider} href={href} target="_blank" rel="noreferrer">{link.label}<span>↗</span></a>;
            })}
            <button type="button" onClick={copyCoordinates}>{copied ? 'Coordinates copied' : 'Copy coordinates'}<span>{copied ? '✓' : '＋'}</span></button>
          </div>
        </form>
      </dialog>
    </>
  );
}
