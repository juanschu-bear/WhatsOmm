// WhatsOmm — typed model for an OPM perception report + an MVP fixture.
// The presentational component depends only on this type, so swapping the
// data source (Supabase wa_perception_reports) requires no visual changes.

export interface PerceptionReportData {
  locale?: 'de' | 'en' | 'es'
  ref: string
  date: string
  eyebrow: string
  guest: { name: string; role: string; company: string; initials: string }
  call: { duration: string; language: string; consent: boolean; recordingUrl: string | null }
  congruence: {
    score: number | null
    verbal: number | null
    signal: number | null
    mismatch: { pos: number; label: string } | null
    note: string
  }
  lucid: {
    paragraphs: string[]
    pull: string | null
    model: string
    words: number
    latency: string
    chunks: number
  }
  cygnus: {
    expression: string
    expressionPct: number | null
    aus: Array<{ name: string; value: number }>
    blendshapes: number[]
    frames: number
    resolution: string
  }
  oracle: {
    patterns: Array<{ icon: string; title: string; detail: string; conf: string }>
  }
  answers: Array<{ n: string; q: string; a: string; tag: { label: string; warn?: boolean } | null }>
  transcript: Array<{ speaker: 'clara' | 'guest'; name: string; text: string; t: string }>
  scheduling: Array<{ day: string; label: string; sub: string }>
}

export const SAMPLE_REPORT: PerceptionReportData = {
  ref: 'kf-33738551',
  date: '05 Jul 2026',
  eyebrow: 'Guest Brief · valantic',
  guest: { name: 'Justin Schiffmann', role: 'Head of Sales', company: 'valantic', initials: 'JS' },
  call: { duration: '4:12', language: 'DE', consent: true, recordingUrl: null },
  congruence: {
    score: 82,
    verbal: 88,
    signal: 71,
    mismatch: { pos: 63, label: 'mismatch 2:41' },
    note: 'Ein kurzer Bruch bei 2:41. Beim Thema Budget blieb die Wortwahl souverän, während die Signale kurz nachgaben. Kein Urteil, nur ein Punkt, den man im Gespräch nachfassen kann.',
  },
  lucid: {
    paragraphs: [
      'Justin trat offen und interessiert auf. Über weite Strecken deckten sich Worte und Signale: echtes Interesse an einer Lösung für die Vertriebssteuerung, getragen von ruhiger Aufmerksamkeit statt Höflichkeit.',
      'Nur beim Budget zeigte sich eine leichte Spannung zwischen Aussage und Ausdruck. Das ist kein Widerspruch, eher ein offener Punkt: Der Bedarf ist da, die interne Freigabe wirkt noch nicht abgesichert. Ein guter Anknüpfungspunkt fürs nächste Gespräch.',
    ],
    pull: 'Eine ambivalente Stelle, sonst durchgehend stimmig.',
    model: 'claude',
    words: 261,
    latency: '8.4s',
    chunks: 1,
  },
  cygnus: {
    expression: 'Neutral, aufmerksam',
    expressionPct: 73,
    aus: [
      { name: 'AU04 · Brow', value: 55 },
      { name: 'AU06 · Cheek', value: 35 },
      { name: 'AU07 · Lid', value: 25 },
      { name: 'AU17 · Chin', value: 48 },
    ],
    blendshapes: [40, 65, 30, 80, 55, 35, 70, 45, 60, 25, 50, 75, 40, 58, 33, 68],
    frames: 4,
    resolution: '1280×720',
  },
  oracle: {
    patterns: [
      { icon: '◇', title: 'Cross-modal Kongruenz', detail: 'Wort, Stimme und Ausdruck deckten sich', conf: '65%' },
      { icon: '◈', title: 'Signal-Ambivalenz', detail: 'ein Segment, Thema Budget', conf: '34%' },
      { icon: '◆', title: 'FACS-angereichert', detail: '4 Signale mit Aktionseinheiten belegt', conf: '4 / 4' },
    ],
  },
  answers: [
    { n: '01', q: 'Wie groß ist euer Vertriebsteam, und wie ist es aufgestellt?', a: 'Rund 40 im Sales, aufgeteilt in Inbound und Key Account.', tag: { label: 'hohe Sicherheit' } },
    { n: '02', q: 'Wie steuert ihr heute Gesprächsqualität und Coaching?', a: 'Stichprobenartig, viel Bauchgefühl, kaum systematisch nach Calls.', tag: null },
    { n: '03', q: 'Wo verliert ihr am ehesten Deals im Gespräch?', a: 'In der Mitte, wenn Interesse und echte Kaufbereitschaft auseinandergehen.', tag: { label: 'Kernbedarf' } },
    { n: '04', q: 'Was habt ihr bisher probiert?', a: 'Ein Gesprächsleitfaden und ein Analyse-Tool, beides zu oberflächlich.', tag: null },
    { n: '05', q: 'Bis wann wollt ihr eine Lösung im Einsatz haben?', a: 'Idealerweise Q4, abhängig von der internen Freigabe.', tag: { label: 'Signal weicher', warn: true } },
  ],
  transcript: [
    { speaker: 'clara', name: 'CLARA', text: 'Schön, dass du da bist, Justin. Bevor wir starten: Ich bin kein klassischer Bot, ich bin ein Extended Avatar. Einverstanden?', t: '0:04' },
    { speaker: 'guest', name: 'JUSTIN', text: 'Ja, klar, machen wir.', t: '0:11' },
    { speaker: 'clara', name: 'CLARA', text: 'Wie groß ist euer Vertriebsteam, und wie ist es aufgestellt?', t: '0:15' },
    { speaker: 'guest', name: 'JUSTIN', text: 'Wir sind rund 40 im Sales, aufgeteilt in Inbound und Key Account.', t: '0:22' },
    { speaker: 'clara', name: 'CLARA', text: 'Und wo verliert ihr am ehesten Deals im Gespräch?', t: '1:48' },
    { speaker: 'guest', name: 'JUSTIN', text: 'Meistens in der Mitte, wenn Interesse und echte Kaufbereitschaft auseinandergehen.', t: '1:55' },
    { speaker: 'clara', name: 'CLARA', text: 'Bis wann wollt ihr eine Lösung im Einsatz haben?', t: '2:38' },
    { speaker: 'guest', name: 'JUSTIN', text: 'Idealerweise Q4, das hängt aber noch an der internen Freigabe.', t: '2:41' },
  ],
  scheduling: [
    { day: 'Di', label: 'Dienstag, 14:00', sub: 'diese Woche' },
    { day: 'Mi', label: 'Mittwoch, 10:00', sub: 'diese Woche' },
    { day: 'Do', label: 'Donnerstag, ab 11:00', sub: 'flexibel' },
  ],
}
