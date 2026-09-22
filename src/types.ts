export type LakeStatus = 'not_field_checked' | 'field_checked' | 'report_in_progress' | 'temporarily_inaccessible';
export type Coordinates = [longitude: number, latitude: number];

export interface LocationVerification {
  status: 'verified';
  method: 'official_source' | 'geospatial_source' | 'personal_visit';
  verifiedAt: string;
  sourceUrl: string;
}

export interface LakeEntrance {
  id: string;
  label: string;
  coordinates: Coordinates;
  verification: 'authoritative_source' | 'personal_visit';
  verifiedAt: string;
  sourceUrl?: string;
}

export interface LakeSource {
  url: string;
  publishedAt: string;
  retrievedAt: string;
  sourceSerial: string | null;
}

export interface LakeIndexEntry {
  id: string;
  slug: string;
  name: string;
  aliases: string[];
  custodian: 'BBMP' | 'BDA' | 'KFD' | 'BMRCL' | 'LDA';
  zone: string;
  ward: string;
  administrativeArea: string;
  status: LakeStatus;
  coordinates?: Coordinates;
  locationVerification?: LocationVerification;
  boundary?: GeoJSON.Feature<GeoJSON.Polygon>;
  entrances?: LakeEntrance[];
  duplicateCandidateIds?: string[];
  source: LakeSource;
}

export type ObservationState = 'observed' | 'unknown' | 'not_checked';

export interface SegmentObservation {
  category: 'shade' | 'smell' | 'crowd' | 'surface' | 'lighting';
  state: ObservationState;
  value?: string;
  segmentIds: string[];
}

export interface Visit {
  id: string;
  visitedAt: string;
  time: string;
  weather: string;
  note: string;
  observations: SegmentObservation[];
}

export interface ActivityEvidence {
  source: 'strava' | 'apple_fitness' | 'gpx' | 'other';
  capturedAt: string;
  screenshotSrc?: string;
  originalTrackSrc?: string;
  distanceKm?: number;
  durationMinutes?: number;
  elevationGainMetres?: number;
  route?: GeoJSON.Feature<GeoJSON.LineString>;
}

export interface EvidenceCitation {
  id: string;
  title: string;
  url: string;
  publishedAt?: string;
  retrievedAt: string;
  note?: string;
}

export interface EnvironmentalMeasurement {
  measuredAt: string;
  parameter: string;
  value: number;
  unit: string;
  sourceId: string;
}

export interface ReportPhoto {
  src: string;
  alt: string;
  caption?: string;
  takenAt: string;
}

export interface Rating {
  category: 'shade' | 'surface' | 'calmness' | 'wayfinding';
  score: number;
  note?: string;
}

export interface LakeReport {
  lakeSlug: string;
  verification: 'verified' | 'sample';
  summary: string;
  route?: GeoJSON.Feature<GeoJSON.LineString>;
  activity?: ActivityEvidence;
  visits: Visit[];
  ratings?: Rating[];
  photos: ReportPhoto[];
  evidence?: EvidenceCitation[];
  measurements?: EnvironmentalMeasurement[];
}

declare global {
  namespace GeoJSON {
    interface LineString { type: 'LineString'; coordinates: number[][] }
    interface Polygon { type: 'Polygon'; coordinates: number[][][] }
    interface Feature<G> { type: 'Feature'; properties: Record<string, unknown>; geometry: G }
  }
}
