// Сгенерировано voice/build.mjs из TIMELINE.voice — не редактировать руками (правь timeline.js и пересобирай).
// lines: t/dur — секунды; words — [[слово, момент появления]…]; talk — речевые окна (рот шевелится); file: null — заглушка без аудио (нет ключа TTS).
// subs — фразы субтитров (≤6 слов / ≤42 символов), используются, если в TIMELINE нет своих subs.
const VOICE = {
  lines: [
    { id: "t1", who: "tolyan", t: 0.4, dur: 3.37, file: "episodes/hd-test-b/voice/bea34303c5da.mp3", words: [["Scene", 0.509], ["two.", 0.832], ["The", 1.155], ["kettle", 2.587], ["stays.", 3.233]], talk: [[0.509, 1.331], [2.439, 3.556]] },
    { id: "s1", who: "sanek", t: 4, dur: 2.717, file: "episodes/hd-test-b/voice/7bc6bb72766f.mp3", words: [["Same", 4.132], ["garage,", 4.338], ["different", 4.749], ["angle.", 5.775]], talk: [[4.132, 5.103], [5.511, 6.186]] },
  ],
  subs: [
    { from: 0.509, to: 4, who: "tolyan", words: [["Scene", 0.509], ["two.", 0.832], ["The", 1.155], ["kettle", 2.587], ["stays.", 3.233]] },
    { from: 4.132, to: 6.636, who: "sanek", words: [["Same", 4.132], ["garage,", 4.338], ["different", 4.749], ["angle.", 5.775]] },
  ],
};
