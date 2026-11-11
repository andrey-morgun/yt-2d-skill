// Фоли rig-test: шаги болванчика — точно в моменты постановки стоп (src/path.js walkSteps: та же фаза, что у рига).
import { createRequire } from 'node:module';
const { walkSteps } = createRequire(import.meta.url)('../../src/path.js');

export const SAMPLE_RATE = 48000;
export const PEAK_CEILING_DB = -3;

export function cues(TL) {
  const steps = walkSteps(TL, 'dummy');
  return [
    { id: 'stepL', type: 'woodTick', t: steps.filter(s => s.foot === 'L').map(s => s.t), db: -14, pan: -.15 },
    { id: 'stepR', type: 'woodTick', t: steps.filter(s => s.foot === 'R').map(s => s.t), db: -15, pan: .15 },
  ];
}
