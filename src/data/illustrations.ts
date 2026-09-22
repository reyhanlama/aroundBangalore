// Editorial artwork represents the guide's atmosphere, never an individual lake or verified visit.
export const editorialIllustrations = [
  '/illustrations/lakeside-path.webp',
  '/illustrations/lake-bird.webp',
  '/illustrations/city-lake.webp'
] as const;

export function illustrationForSample(index: number) {
  return editorialIllustrations[index % editorialIllustrations.length];
}
