// Фоли технического теста hd-test (и сцен hd-test-b/-c, которые реэкспортируют этот файл). Не контент.
// garageHum на всю сцену обрывается на последнем сэмпле — проверка, что стыки сцен в show.mjs не щёлкают;
// tick в 0.5 с от начала каждой сцены — метка, по которой проверяется, что звук сцены встал точно на её место в шоу.
export const SAMPLE_RATE = 48000;
export const PEAK_CEILING_DB = -3;

export function cues(TL) {
  const D = TL.duration;
  return [
    { id: 'hum',    type: 'garageHum', t: 0, dur: D, db: -9 },    // громко нарочно: оборванный на стыке гул щёлкнул бы без фейдов
    { id: 'marker', type: 'tick',      t: 0.5, db: -6 },
    ...((TL.badges || []).length ? [{ id: 'badges', type: 'bloop', t: TL.badges.map(b => b.from), db: -10 }] : []),
  ];
}
