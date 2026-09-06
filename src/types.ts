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
  ratings?: {
    runability: number;
    environment: number;
    comfort: number;
    experience: number;
  };
}

export interface LakeReport {
  lakeSlug: string;
  verification: 'verified';
  summary: string;
  route?: GeoJSON.Feature<GeoJSON.LineString>;
  visits: Visit[];
  photos: Array<{ src: string; alt: string; takenAt: string }>;
}

declare global {
  namespace GeoJSON {
    interface LineString { type: 'LineString'; coordinates: number[][] }
    interface Polygon { type: 'Polygon'; coordinates: number[][][] }
    interface Feature<G> { type: 'Feature'; properties: Record<string, unknown>; geometry: G }
  }
}
