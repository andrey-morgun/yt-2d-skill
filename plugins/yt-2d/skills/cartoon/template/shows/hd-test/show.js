// ─── Шоу «hd-test» — технический тест сборки из сцен (этап 1.3): три сцены 1920×1080 встык ───
// Сборка: node show.mjs hd-test [out/hd-test.mp4] --preview --sfx
const SHOW = {
  scenes: ['hd-test', 'hd-test-c', 'hd-test-b'],   // hd-test-c (4.51 с → обрезан по видео до 4.5 с) — в середине: его стык проверяет фейды
};
