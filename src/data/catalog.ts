import { z } from 'zod';
import rawCatalog from './lakes.json';
import type { LakeIndexEntry, LakeStatus } from '../types';

const statusSchema = z.enum(['not_field_checked', 'field_checked', 'report_in_progress', 'temporarily_inaccessible']);
const lakeSchema = z.object({
  id: z.string().regex(/^blr-lake-\d{3}$/),
  slug: z.string().min(1),
  name: z.string().min(1),
  aliases: z.array(z.string()),
  custodian: z.enum(['BBMP', 'BDA', 'KFD', 'BMRCL', 'LDA']),
  zone: z.string().min(1),
  ward: z.string().min(1),
  administrativeArea: z.string().min(1),
  status: statusSchema,
  coordinates: z.tuple([z.number().gte(77).lte(78), z.number().gte(12).lte(14)]).optional(),
  locationVerification: z.object({
    status: z.literal('verified'),
    method: z.enum(['official_source', 'geospatial_source', 'personal_visit']),
    verifiedAt: z.string(),
    sourceUrl: z.string().url()
  }).optional(),
  source: z.object({
    url: z.string().url(),
    publishedAt: z.string(),
    retrievedAt: z.string(),
    sourceSerial: z.string().nullable()
  })
}).superRefine((lake, context) => {
  if (Boolean(lake.coordinates) !== Boolean(lake.locationVerification)) {
    context.addIssue({ code: 'custom', message: 'Coordinates and explicit location verification metadata must be supplied together' });
  }
});

const parsed = z.array(lakeSchema).length(210).parse(rawCatalog);
const ids = new Set(parsed.map((lake) => lake.id));
const slugs = new Set(parsed.map((lake) => lake.slug));
if (ids.size !== parsed.length || slugs.size !== parsed.length) throw new Error('Lake IDs and slugs must be unique');

export const lakes = parsed.map((lake) => ({ ...lake, entrances: [] })) as LakeIndexEntry[];
export const locatedLakes = lakes.filter((lake) => lake.coordinates && lake.locationVerification?.status === 'verified');
export const statuses: LakeStatus[] = ['field_checked', 'report_in_progress', 'not_field_checked', 'temporarily_inaccessible'];
export const lakeBySlug = new Map(lakes.map((lake) => [lake.slug, lake]));

export const statusLabel: Record<LakeStatus, string> = {
  field_checked: 'Field-checked',
  report_in_progress: 'Report in progress',
  not_field_checked: 'Not yet field-checked',
  temporarily_inaccessible: 'Temporarily inaccessible'
};
