/******************************************
 * Caesar + Frequencies (EN/IT)
 * Plain JS - works in browser console or Node
 ******************************************/

// Profili di frequenza EN/IT (percentuali)
const LANG_PROFILES = {
    en: { A:8.2,B:1.5,C:2.8,D:4.3,E:12.7,F:2.2,G:2.0,H:6.1,I:7.0,J:0.15,K:0.77,L:4.0,M:2.4,N:6.7,O:7.5,P:1.9,Q:0.095,R:6.0,S:6.3,T:9.1,U:2.8,V:0.98,W:2.4,X:0.15,Y:2.0,Z:0.07 },
    it: { A:11.7,B:0.9,C:4.5,D:3.7,E:11.8,F:1.1,G:1.6,H:1.5,I:11.3,J:0.0,K:0.0,L:6.5,M:2.7,N:7.0,O:9.8,P:3.1,Q:0.5,R:6.4,S:4.9,T:5.6,U:3.0,V:2.1,W:0.0,X:0.0,Y:0.0,Z:1.1 }
  };
  
  const AZ = [..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"];
  
  // Normalizzazione testo (maiuscole, niente accenti, solo A-Z)
  function normalizeText(s) {
    return String(s ?? '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase()
      .replace(/[^A-Z]/g, '');
  }
  
  // Conteggi e frequenze relative
  function countFreq(s) {
    const t = normalizeText(s);
    const abs = Object.fromEntries(AZ.map(ch => [ch, 0]));
    for (const ch of t) abs[ch]++;                 // conta lettere
    const total = Math.max(t.length, 1);           // <<-- FIX: length (non "lenght")
    const rel = Object.fromEntries(
      AZ.map(ch => [ch, (abs[ch] / total) * 100])
    );
    return { abs, rel, total };
  }
  
  // Cifrario di Cesare
  function caesar(text, shift) {
    const n = ((shift % 26) + 26) % 26;
    return String(text).replace(/[A-Za-z]/g, ch => {
      const base = ch >= 'a' && ch <= 'z' ? 97 : 65;
      const code = ch.charCodeAt(0) - base;
      return String.fromCharCode(((code + n) % 26) + base);
    });
  }
  
  // Distanza chi-quadrato (più bassa = meglio)
  function chiSquare(obsRel, langRel) {
    let chi = 0;
    for (const ch of AZ) {
      const e = (langRel[ch] || 0) + 1e-9;
      const o = obsRel[ch] || 0;
      chi += ((o - e) ** 2) / e;
    }
    return chi;
  }
  
  // Miglior shift per una lingua
  function bestShiftForLang(cipherText, lang = 'en') {
    const profile = LANG_PROFILES[lang];
    let best = { shift: 0, score: Infinity, plaintext: String(cipherText) };
    for (let k = 0; k < 26; k++) {
      const cand = caesar(cipherText, -k);
      const fr = countFreq(cand).rel;
      const score = chiSquare(fr, profile);
      if (score < best.score) best = { shift: k, score, plaintext: cand };
    }
    return best;
  }
  
  // Auto: lingua + shift
  function autoDecode(cipherText, langs = ['en','it']) {
    let global = { lang: langs[0], shift: 0, score: Infinity, plaintext: String(cipherText) };
    for (const lang of langs) {
      const res = bestShiftForLang(cipherText, lang);
      if (res.score < global.score) global = { lang, ...res };
    }
    return global;
  }
  
  // Top N lettere (per debug)
  function topLetters(freqObj, n = 5) {
    return AZ.map(ch => ({ ch, p: freqObj.rel[ch] }))
             .sort((a,b) => b.p - a.p)
             .slice(0, n);
  }
  
  // ---- TEST ----
  const demo = "Cybersecurity is about protecting data.";
  const enc = caesar(demo, 3);
  const guess = autoDecode(enc, ['en','it']);
  console.log({ demo, enc, guess });          // atteso: shift ≈ 3, plaintext = demo
  
  const f = countFreq(demo);
  console.table(topLetters(f, 8));            // atteso: percentuali numeriche (no NaN)
  