import type { LakeStatus } from '../types';
import { statusLabel } from '../data/catalog';

export function StatusTag({ status }: { status: LakeStatus }) {
  return <span className={`status-tag status-${status}`}>{statusLabel[status]}</span>;
}
