import type { LakeReport } from '../types';

// Publish reports only after a dated personal visit has been supplied and verified.
// Draft shells intentionally stay out of the public application.
export const reports: LakeReport[] = [];
export const reportBySlug = new Map(reports.map((report) => [report.lakeSlug, report]));
