/* ---------------- Görsel ayarlar ---------------- */
const SCEN_COLOR = {"is-kazasi":["var(--sun-t)","#e0a800"], urun:["var(--teal-t)","var(--teal)"], veri:["var(--red-t)","var(--violet)"], reklam:["var(--orange-t)","var(--pink)"]};
const CH = {
  "X":{c:"#1d1d1f",ab:"X"}, "Instagram":{c:"#e0337a",ab:"IG"}, "TikTok":{c:"#0aa8b0",ab:"TT"}, "LinkedIn":{c:"#1666c5",ab:"in"},
  "Haber":{c:"#f07c00",ab:"HB"}, "Basın":{c:"#c99700",ab:"BS"}, "İç kanal":{c:"#4a4744",ab:"İÇ"}, "Şikâyet sitesi":{c:"#e5463a",ab:"ŞK"}
};
const CH_ORDER = ["X","Instagram","TikTok","LinkedIn","Haber","Basın","İç kanal","Şikâyet sitesi"];
const chOf = k => CH[k] || {c:"#6b5f84", ab:String(k || "?").slice(0, 2).toUpperCase()};

/* ---------------- Durum ---------------- */
const $ = s => document.querySelector(s);
const state = {scen: SCENARIOS[0], minute: 0, timer: null, speed: 1, twist: false, twistAt: null, lastPlan: null, view: "taslak"};
let downloads = null;
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------------- Yardımcılar ---------------- */
const fmtNum = n => n >= 1e6 ? (n/1e6).toFixed(1).replace(".", ",") + " M" : n >= 1e3 ? Math.round(n/1e3) + " B" : String(n);
const pad = n => String(n).padStart(2, "0");
const sentiment = d => d <= -0.35 ? "neg" : d >= 0.3 ? "pos" : "mid";
const MOOD = {neg:"Olumsuz", mid:"Kararsız", pos:"Olumlu"};
function el(tag, attrs = {}, ...kids){
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) { if (k === "class") e.className = v; else if (k === "text") e.textContent = v; else e.setAttribute(k, v); }
  for (const k of kids) if (k != null) e.append(k);
  return e;
}
function withMarks(target, text){
  target.textContent = "";
  String(text || "").split(/(\[[^\]]+\])/g).forEach(part => {
    if (/^\[[^\]]+\]$/.test(part)) target.append(el("mark", {text: part}));
    else if (part) target.append(document.createTextNode(part));
  });
}
function visibleSignals(){
  const s = state.scen;
  const list = s.sinyaller.filter(x => x.t <= state.minute);
  if (state.twist && s.gelisme) list.push({...s.gelisme, t: state.twistAt, twist: true});
  return list.sort((a, b) => a.t - b.t);
}

/* ---------------- SCCT modeli ---------------- */
function scct(){
  const s = state.scen, sig = visibleSignals();
  const rep = $("#rep").value, hist = $("#hist").checked;
  const kume = state.twist && s.gelisme?.kume ? s.gelisme.kume : s.kume;
  const order = ["kurban", "kaza", "onlenebilir"];
  const why = [`Olay türü: ${CLUSTERS[kume].ad.toLowerCase()} (${CLUSTERS[kume].sor}).`];
  let score = CLUSTERS[kume].base, eff = kume;
  if (hist){ score += 12; why.push("Geçmişte benzer kriz var: kamuoyu krizi bir üst kümeden algılar."); }
  if (rep === "zayif"){ score += 10; why.push("İtibar zayıf: kurumun söylediklerine güven düşük."); }
  else if (rep === "orta"){ score += 4; }
  else { score -= 4; why.push("İtibar güçlü: güven var, ama sınırsız değil."); }
  if ((hist || rep === "zayif") && kume !== "onlenebilir") eff = order[order.indexOf(kume) + 1];
  if (state.twist && s.gelisme?.agirlastiran){ score += 8; why.push(s.gelisme.agirlastiran + "."); }
  const reach = sig.reduce((a, x) => a + (x.erisim || 0), 0);
  const negRatio = sig.length ? sig.filter(x => x.duygu <= -0.35).length / sig.length : 0;
  score += negRatio * 12 + Math.min(12, reach / 60000);
  if (reach > 300000) why.push(`Yayılım yüksek: tahmini ${fmtNum(reach)} kişiye ulaştı.`);
  if (state.twist) why.push("Yeni gelişme kriz türünü yeniden değerlendirmeyi gerektiriyor.");
  if (eff !== kume) why.push(`Bu yüzden strateji "${CLUSTERS[eff].ad.toLowerCase()}" düzeyinde seçilmeli.`);
  score = Math.max(5, Math.min(98, Math.round(score)));
  return {kume, eff, score, why, reach, negRatio, sig};
}
function weatherOf(n){
  if (n < 35) return ["Hafif rüzgâr", "Durum kontrol altında, ama izlemeyi bırakma."];
  if (n < 60) return ["Bulutlu, dikkat", "Konu büyüyebilir; ilk açıklama gecikmemeli."];
  if (n < 80) return ["Fırtına yaklaşıyor", "Kriz ekibi masada olmalı, saatler değil dakikalar önemli."];
  return ["Kasırga", "Kurumun itibarı doğrudan risk altında."];
}

/* ---------------- Radar ---------------- */
const radar = {cv: null, ctx: null, w: 0, dpr: 1, angle: 0, born: new Map(), colors: {}};
function readColors(){
  const cs = getComputedStyle(document.documentElement);
  ["--coral","--tang","--teal","--sun","--stage-text","--line","--muted","--violet"].forEach(k => radar.colors[k] = cs.getPropertyValue(k).trim());
}
function sizeRadar(){
  const cv = radar.cv, r = cv.getBoundingClientRect();
  radar.dpr = Math.min(2, window.devicePixelRatio || 1);
  radar.w = r.width;
  cv.width = Math.round(r.width * radar.dpr); cv.height = Math.round(r.width * radar.dpr);
}
function hash(str){ let h = 2166136261; for (const ch of str) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return (h >>> 0) / 4294967295; }
function blipPos(x){
  const idx = Math.max(0, CH_ORDER.indexOf(x.kanal));
  const sector = Math.PI * 2 / CH_ORDER.length;
  const a = -Math.PI / 2 + idx * sector + (hash(x.metin) - .5) * sector * .7;
  const sev = (1 - (x.duygu ?? 0)) / 2;           /* 0 olumlu → 1 çok olumsuz */
  const r = .24 + (1 - sev) * 1.05 + (hash(x.kaynak + x.t) - .5) * .12;
  return [a, Math.min(.9, Math.max(.16, r))];
}
function drawRadar(now){
  const {ctx, w, dpr, colors} = radar; if (!ctx || !w) return;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, w);
  const c = w / 2, R = w / 2 - 26;
  const text = colors["--stage-text"] || "#fff";
  ctx.strokeStyle = colors["--line"] || "#ebe6e0"; ctx.lineWidth = 1;
  for (let i = 1; i <= 4; i++){ ctx.beginPath(); ctx.arc(c, c, R * i / 4, 0, Math.PI * 2); ctx.stroke(); }
  const sector = Math.PI * 2 / CH_ORDER.length;
  ctx.font = `600 ${Math.max(10, w / 46)}px Onest, system-ui, sans-serif`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  CH_ORDER.forEach((name, i) => {
    const a0 = -Math.PI / 2 + i * sector - sector / 2;
    ctx.beginPath(); ctx.moveTo(c, c); ctx.lineTo(c + Math.cos(a0) * R, c + Math.sin(a0) * R); ctx.stroke();
    const a = -Math.PI / 2 + i * sector;
    ctx.fillStyle = colors["--muted"] || "#6f6862";
    ctx.fillText(name === "Şikâyet sitesi" ? "Şikâyet" : name, c + Math.cos(a) * (R + 14), c + Math.sin(a) * (R + 14));
  });
  /* tarama ışını */
  if (!reduceMotion){
    radar.angle = (now / 4000 * Math.PI * 2) % (Math.PI * 2);
    const g = ctx.createConicGradient ? ctx.createConicGradient(radar.angle - Math.PI / 3, c, c) : null;
    if (g){
      g.addColorStop(0, "rgba(179,18,46,0)"); g.addColorStop(1/6 - .001, "rgba(179,18,46,.14)"); g.addColorStop(1/6, "rgba(179,18,46,0)"); g.addColorStop(1, "rgba(179,18,46,0)");
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(c, c, R, 0, Math.PI * 2); ctx.fill();
    }
    ctx.strokeStyle = "rgba(179,18,46,.55)"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(c, c); ctx.lineTo(c + Math.cos(radar.angle) * R, c + Math.sin(radar.angle) * R); ctx.stroke();
  }
  /* noktalar */
  visibleSignals().forEach(x => {
    const key = x.twist ? "twist" : x.t + x.kaynak;
    if (!radar.born.has(key)) radar.born.set(key, now);
    const age = now - radar.born.get(key);
    const [a, rr] = blipPos(x);
    const px = c + Math.cos(a) * rr * R, py = c + Math.sin(a) * rr * R;
    const col = x.twist ? colors["--sun"] : colors[{neg:"--coral", mid:"--tang", pos:"--teal"}[sentiment(x.duygu)]];
    const size = 4 + Math.log10((x.erisim || 0) + 10) * (x.twist ? 2.6 : 1.7);
    if (!reduceMotion && age < 1800){
      const p = age / 1800;
      ctx.strokeStyle = col; ctx.globalAlpha = 1 - p; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(px, py, size + p * (x.twist ? 70 : 34), 0, Math.PI * 2); ctx.stroke();
      ctx.globalAlpha = 1;
    }
    let glow = 0;
    if (!reduceMotion){ let d = Math.abs(((radar.angle - a) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2)); glow = d < .5 ? 1 - d / .5 : 0; }
    ctx.fillStyle = col; ctx.shadowColor = col; ctx.shadowBlur = 8 + glow * 18;
    ctx.beginPath(); ctx.arc(px, py, size * (1 + glow * .25), 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
  });
  /* merkez: kurum */
  const ab = state.scen.kurum.split(/\s+/).filter(Boolean).slice(0, 2).map(s => s[0]).join("").toLocaleUpperCase("tr");
  ctx.fillStyle = colors["--violet"]; ctx.beginPath(); ctx.arc(c, c, Math.max(18, w / 18), 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#fff"; ctx.font = `800 ${Math.max(12, w / 30)}px Unbounded, system-ui, sans-serif`; ctx.fillText(ab, c, c + 1);
}
function radarLoop(now){ drawRadar(now); if (!reduceMotion) requestAnimationFrame(radarLoop); }

/* ---------------- Çizim ---------------- */
const PLAY_SVG = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 4.5v15l13-7.5z"/></svg>';
const PAUSE_SVG = '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4.5" width="4" height="15" rx="1"/><rect x="14" y="4.5" width="4" height="15" rx="1"/></svg>';
const AGAIN_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M4 12a8 8 0 1 0 2.4-5.7"/><path d="M4 4v4h4"/></svg>';

const ICONS = {
  "is-kazasi":'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21V10l6 4V10l6 4V6h6v15z"/><path d="M7 17h2M13 17h2"/></svg>',
  urun:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8h12l-1.5 12h-9z"/><path d="M5 5h14v3H5z"/></svg>',
  veri:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>',
  reklam:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10v4h4l6 5V5L7 10z"/><path d="M17 8a5 5 0 0 1 0 8"/></svg>',
  ozel:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>'
};
function renderScenList(){
  const box = $("#scenList"); box.textContent = "";
  SCENARIOS.forEach(s => {
    const [bg, fg] = SCEN_COLOR[s.id] || ["var(--blue-t)", "var(--blue)"];
    const b = el("button", {type: "button", class: "choice", role: "listitem", style: `--c:${bg};--cc:${fg}`});
    const ic = el("span", {class: "ic"}); ic.innerHTML = ICONS[s.id] || ICONS.ozel;
    b.append(ic, el("h3", {text: s.baslik}), el("p", {text: s.kurum + ". " + s.ozet.split(". ")[0].replace(/\.$/, "") + "."}), el("span", {class: "go", text: "Masayı kur →"}));
    b.onclick = () => startScen(s.id);
    box.append(b);
  });
}

/* ---------------- Adımlar ---------------- */
let step = "secim", chosen = false;
function goStep(t){
  if (t !== "secim" && !chosen) t = "secim";
  step = t;
  ["secim", "yonet", "plan"].forEach(k => $("#st-" + k).hidden = k !== t);
  const order = ["secim", "yonet", "plan"];
  document.querySelectorAll(".steps button").forEach(b => {
    const k = b.dataset.step;
    if (k === t) b.setAttribute("aria-current", "step"); else b.removeAttribute("aria-current");
    b.dataset.done = order.indexOf(k) < order.indexOf(t) ? "1" : "0";
    b.disabled = k !== "secim" && !chosen;
  });
  $("#opening").hidden = !(currentTab === "masa" && t === "secim");
  if (t === "yonet") requestAnimationFrame(() => { sizeRadar(); drawRadar(performance.now()); });
  if (t === "plan") preparePlan();
  if (t === "secim" && !$("#opening").hidden) requestAnimationFrame(() => { netBuild(); });
  window.scrollTo({top: 0, behavior: "auto"});
}
function preparePlan(){
  $("#planTitle").textContent = `${state.scen.kurum} · T+${pad(state.minute)} dk`;
  const stale = !state.lastPlan || state.lastPlan._twist !== state.twist || state.lastPlan._scen !== state.scen.id;
  if (stale){ state.view = "taslak"; renderPlan(readyPlan()); }
}
function startScen(id){
  selectScen(id); chosen = true;
  const ov = $("#setup");
  $("#setupEyebrow").textContent = "Kriz masası kuruluyor";
  $("#setupTitle").textContent = state.scen.kurum;
  $("#setupSub").textContent = state.scen.baslik;
  ov.hidden = false; ov.classList.remove("done", "go"); void ov.offsetWidth; ov.classList.add("go");
  let finished = false;
  const finish = () => { if (finished) return; finished = true; ov.classList.add("done"); setTimeout(() => { ov.hidden = true; ov.classList.remove("go", "done"); }, 450); goStep("yonet"); play(); };
  setTimeout(() => { $("#setupEyebrow").textContent = "✓ Kriz masası kuruldu"; }, reduceMotion ? 300 : 1500);
  setTimeout(finish, reduceMotion ? 900 : 2700);
  ov.onclick = finish;
}

let shown = new Set();
function renderFeed(){
  const sig = visibleSignals().slice().reverse();
  const feed = $("#feed"); feed.textContent = "";
  if (!sig.length){ feed.append(el("li", {class: "empty", text: "Saati başlattığında paylaşımlar burada belirecek."})); return; }
  sig.forEach(x => {
    const key = x.twist ? "twist" : x.t + x.kaynak;
    const ch = chOf(x.kanal), s = sentiment(x.duygu);
    const li = el("li", {class: "post"},
      x.twist ? el("span", {class: "flag", text: "SON DAKİKA"}) : null,
      el("div", {class: "row"},
        el("span", {class: "av", style: `background:${ch.c}`, text: ch.ab}),
        el("div", {class: "who"}, el("b", {text: x.kaynak}), el("small", {text: x.kanal})),
        el("time", {text: "T+" + pad(x.t)})),
      el("p", {text: x.metin}),
      el("div", {class: "foot"}, el("span", {class: "mood", "data-s": s, text: MOOD[s]}), x.erisim ? el("span", {class: "mono", text: fmtNum(x.erisim) + " kişi gördü"}) : el("span", {text: "Doğrudan mesaj"})));
    if (x.twist) li.classList.add("twist");
    if (!shown.has(key)){ li.classList.add("fresh"); shown.add(key); }
    feed.append(li);
  });
}

function renderTicker(){
  const sig = visibleSignals().slice().reverse().slice(0, 6);
  const run = $("#tickerRun"); run.textContent = "";
  const items = sig.length ? sig : [{t: 0, kanal: "Kriz Masası", metin: "Bir senaryo seç ve saati başlat. Gündem burada akacak."}];
  items.forEach(x => run.append(el("span", {}, el("b", {text: "T+" + pad(x.t) + " · " + x.kanal}), document.createTextNode(x.metin))));
}

function renderGauges(){
  const r = scct();
  $("#kSig").textContent = r.sig.length;
  $("#kReach").textContent = fmtNum(r.reach);
  $("#kNeg").textContent = "%" + Math.round(r.negRatio * 100);
  $("#riskNum").textContent = r.score;
  $("#needle").style.transform = `rotate(${-90 + r.score * 1.8}deg)`;
  const [w, ws] = weatherOf(r.score);
  $("#weather").textContent = w;
  const pill = $("#clusterPill"); pill.dataset.c = r.kume; pill.textContent = CLUSTERS[r.kume].ad;
  const wl = $("#whyList"); wl.textContent = ""; r.why.forEach(t => wl.append(el("li", {text: t})));
  $("#stratName").textContent = STRATS[r.eff].ad;
  $("#stratText").textContent = STRATS[r.eff].metin;
}

function renderClock(){
  $("#clock").firstChild.nodeValue = "T+" + pad(state.minute);
  $("#prog").style.width = (state.minute / 60 * 100) + "%";
  const pb = $("#playBtn");
  if (state.timer){ pb.innerHTML = PAUSE_SVG; pb.setAttribute("aria-label", "Duraklat"); }
  else if (state.minute >= 60){ pb.innerHTML = AGAIN_SVG; pb.setAttribute("aria-label", "Baştan oynat"); }
  else { pb.innerHTML = PLAY_SVG; pb.setAttribute("aria-label", state.minute ? "Devam et" : "Başlat"); }
  $("#twistBtn").disabled = state.twist || !state.scen.gelisme;
}

function renderAll(){ renderClock(); renderFeed(); renderGauges(); renderTicker(); if (reduceMotion) drawRadar(performance.now()); }

/* ---------------- Saat ---------------- */
function tick(){ state.minute = Math.min(60, state.minute + 1); if (state.minute >= 60) stop(); renderAll(); }
function play(){
  if (state.timer) return;
  if (state.minute >= 60){ reset(); }
  state.timer = setInterval(tick, 2000 / state.speed); renderClock();
}
function stop(){ clearInterval(state.timer); state.timer = null; renderClock(); }
function reset(){
  stop(); state.minute = 0; state.twist = false; state.twistAt = null; state.lastPlan = null;
  shown = new Set(); radar.born = new Map();
  $("#planOut").hidden = true; $("#stamp").classList.remove("on");
  setStatus("");
  renderAll();
}
function selectScen(id){
  const s = SCENARIOS.find(x => x.id === id); if (!s) return;
  state.scen = s;
  $("#kurumAd").textContent = s.kurum; $("#scenEyebrow").textContent = s.baslik + " · " + s.sektor;
  $("#scenSummary").textContent = s.ozet;
  reset();
}

/* ---------------- Plan ---------------- */
function setStatus(t, err, busy){
  const s = $("#aiStatus"); s.textContent = ""; s.classList.toggle("err", !!err);
  if (busy) s.append(el("span", {class: "dots"}, el("i"), el("i"), el("i")));
  s.append(document.createTextNode(t));
}
function readyPlan(){
  const s = state.scen, r = scct(); if (!s.hazir) return null;
  const h = s.hazir;
  return {
    kume: r.kume, risk: r.score, strateji: STRATS[r.eff].ad,
    degerlendirme: `${CLUSTERS[r.kume].ad}: ${CLUSTERS[r.kume].sor}. ${STRATS[r.eff].metin}`,
    ilk_aciklama: state.twist ? h.aciklamaG : h.aciklama,
    taslak: state.twist ? h.taslakG : h.taslak,
    sorular: h.sorular,
    kanal_plani: state.twist ? [...h.plan, {zaman: "Gelişmeden sonra", aksiyon: "Yeni bilgiyi ilk açıklamanın yayınlandığı kanallardan, aynı sözcüyle paylaş. Önceki açıklamada geçersiz kalan cümleleri açıkça düzelt."}] : h.plan,
    dogrulanacaklar: h.dogrula, kacinilacaklar: h.kacin
  };
}
function renderPlan(p){
  p._twist = state.twist; p._scen = state.scen.id;
  state.lastPlan = p;
  $("#planOut").hidden = false;
  renderStatement();
  const ass = $("#pAssess"); ass.textContent = "";
  ass.append(el("span", {class: "pill", "data-c": CLUSTERS[p.kume] ? p.kume : "kaza", text: (CLUSTERS[p.kume]?.ad || p.kume) + " · risk " + p.risk}),
    el("strong", {style: "font-family:var(--f-display);font-size:20px", text: p.strateji}),
    el("p", {style: "margin:0", text: p.degerlendirme || ""}));
  const qa = $("#pQA"); qa.textContent = "";
  (p.sorular || []).forEach(q => { qa.append(el("dt", {text: q.soru})); const dd = el("dd"); withMarks(dd, q.cevap); qa.append(dd); });
  const pl = $("#pPlan"); pl.textContent = "";
  (p.kanal_plani || []).forEach(x => pl.append(el("li", {}, el("b", {text: x.zaman}), el("span", {text: x.aksiyon}))));
  const fill = (id, arr) => { const u = $(id); u.textContent = ""; (arr || []).forEach(t => u.append(el("li", {text: t}))); };
  fill("#pVerify", p.dogrulanacaklar); fill("#pAvoid", p.kacinilacaklar);
  document.querySelectorAll("#approve input").forEach(c => c.checked = false);
  updateApprove();
}
function renderStatement(){
  const p = state.lastPlan; if (!p) return;
  const draft = state.view === "taslak" && p.taslak;
  const text = draft ? p.taslak : p.ilk_aciklama;
  const blk = $(".statement-blk"); blk.dataset.v = draft ? "taslak" : "son";
  const src = $("#planSource"); src.dataset.k = draft ? "taslak" : "hazir"; src.textContent = draft ? "Yayınlanmamalı" : "Yayına hazır";
  const hits = toneCheck(text);
  withMarksTone($("#pStatement"), text, hits.map(h => h[0]));
  renderTone(draft ? text : text + "\n" + (p.sorular || []).map(q => q.cevap).join("\n"));
  $("#pHint").textContent = draft ? "Dalgalı çizgili ifadeler kurumu olaydan uzaklaştırıyor. Neyin yanlış olduğunu konuşup düzeltmeye geç." : "Sarı alanları sen doldurursun: bunlar doğrulanması gereken bilgiler.";
  $("#copyStatement").hidden = !!draft;
  document.querySelectorAll("#draftToggle button").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.v === (draft ? "taslak" : "son"))));
  setStatus(draft ? "Bu taslak, AI'a kural vermeden yazdırıldığında sık çıkan hataları gösteriyor." : "Kurumsal iletişimci aynı metni olayın sahibi olarak, somut adımlarla yeniden yazdı.");
}
function withMarksTone(target, text, bad){
  target.textContent = "";
  const esc = bad.map(b => b.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).sort((a, b) => b.length - a.length);
  const re = esc.length ? new RegExp("(" + esc.join("|") + ")", "giu") : null;
  String(text || "").split(/(\[[^\]]+\])/g).forEach(part => {
    if (/^\[[^\]]+\]$/.test(part)){ target.append(el("mark", {text: part})); return; }
    if (!re){ if (part) target.append(document.createTextNode(part)); return; }
    part.split(re).forEach((seg, i) => { if (!seg) return; if (i % 2) target.append(el("span", {class: "bad", text: seg})); else target.append(document.createTextNode(seg)); });
  });
}
function updateApprove(){
  const all = [...document.querySelectorAll("#approve input")].every(c => c.checked);
  const canPdf = !!downloads || !window.claude;
  $("#pdfBtn").hidden = !canPdf;
  $("#pdfBtn").disabled = !all || !canPdf; $("#copyPlan").disabled = !all;
  $("#stamp").classList.toggle("on", all);
  const st = $("#pdfStatus"); st.classList.remove("err");
  st.textContent = all ? (canPdf ? "Mühür basıldı. PDF'i indirip portföyüne ekleyebilirsin." : "Mühür basıldı. Planı kopyalayıp kendi belgene yapıştırabilirsin.") : "Dört kutu da işaretlenince plan indirilebilir.";
}
function planText(p){
  const s = state.scen;
  const lines = [`KRİZ İLETİŞİM PLANI · ${s.kurum}`, `Senaryo: ${s.baslik} (T+${pad(state.minute)} dk)`, "",
    `Kriz kümesi: ${CLUSTERS[p.kume]?.ad || p.kume} · Risk: ${p.risk} · Strateji: ${p.strateji}`, p.degerlendirme || "", "", "İLK AÇIKLAMA", p.ilk_aciklama, "", "GAZETECİ SORULARI"];
  (p.sorular || []).forEach(q => lines.push("S: " + q.soru, "C: " + q.cevap));
  lines.push("", "KANAL PLANI"); (p.kanal_plani || []).forEach(x => lines.push(`${x.zaman}: ${x.aksiyon}`));
  lines.push("", "YAYINDAN ÖNCE DOĞRULA"); (p.dogrulanacaklar || []).forEach(x => lines.push("- " + x));
  lines.push("", "KAÇIN"); (p.kacinilacaklar || []).forEach(x => lines.push("- " + x));
  lines.push("", "Kriz Masası · İKÇÜ Halkla İlişkiler ve Reklamcılık · Senaryo kurgusaldır.");
  return lines.join("\n");
}


/* ---------------- Ton kontrolü ---------------- */
const W = body => new RegExp(`(?<!\\p{L})(?:${body})(?!\\p{L})`, "giu");
const TONE_RULES = [
  [W("(?:dikkatle )?(?:izliyoruz|takip ediyoruz)"), "Kurum olayın sahibi, seyircisi değil. Ne yaptığını söyle."],
  [W("haberdar(?:ız|iz)"), "Haberdar olmak yetmez. Ne yaptığını söyle."],
  [W("görüyoruz|fark ettik|anlaşılmaktadır|anlaşılıyor"), "Sorumluluğu sonradan keşfetmiş gibi duruyor."],
  [W("(?:çok )?ciddiye alıyoruz"), "Klişe. Yerine somut bir adım yaz."],
  [W("talihsiz|üzücü|yaşanan"), "Olayı kurumdan uzaklaştırır."],
  [W("(?:olası|muhtemel) mağduriyet\\p{L}*"), "Mağduriyeti küçültür."],
  [W("hassasiyet\\p{L}*"), "Klişe; ne yaptığını açıkça söyle."],
  [W("yanlış anlaş\\p{L}*"), "Suçu okura yükler."],
  [W("yeterince"), "Sorumluluğu hafifletir."],
  [W("\\p{L}*(?:alınma|verilme|yapılma)d\\p{L}*|\\p{L}+(?:ılmaktadır|ilmektedir|ulmaktadır|ülmektedir|ılmıştır|ilmiştir|ulmuştur|ülmüştür|ılacaktır|ilecektir|ulacaktır|ülecektir|ınmaktadır|inmektedir|ınmıştır|inmiştir|unmuştur|ünmüştür|ınacaktır|inecektir)|\\p{L}*ediliyor"), "Edilgen çatı: kimin ne yaptığı belli değil."],
  [W("kamuoyunun bilgisine sunarız|kamuoyunu bilgilendiririz"), "Bürokratik kapanış. İnsanlara doğrudan konuş."],
  [W("mümkün değil\\p{L}*"), "İnceleme bitmeden inkâr etme."],
  [W("güvenlidir"), "Doğrulanmadan verilen güvence."],
  [W("(?:herhangi bir )?sorumluluğu(?:muz)? (?:yok\\p{L}*|olmadığını|bulunmamaktadır)"), "Önce sorumluluğu reddetmek, mağdura ilgiyi unutturur."],
  [W("bağlamından koparıl\\p{L}*"), "Kanıtı küçümsemek öfkeyi büyütür."],
  [W("\\p{L}+(?:mışız|mişiz|muşuz|müşüz)"), "Duyulan geçmiş zaman sorumluluğu uzaklaştırır; \"-dık\" ile yaz."],
  [W("\\p{L}+(?:dıysa|diyse|duysa|düyse|tıysa|tiyse|tuysa|tüyse)"), "Koşullu sorumluluk: \"eğer öyleyse\" diye üstlenilmez."]
];
function toneCheck(text){
  const clean = String(text).replace(/\[[^\]]*\]/g, " ");
  const hits = [];
  const seen = new Map();
  TONE_RULES.forEach(([re, why]) => { (clean.match(re) || []).forEach(m => { const k = m.toLocaleLowerCase("tr"); seen.set(k, seen.has(k) ? [seen.get(k)[0], seen.get(k)[1] + " " + why] : [m, why]); }); });
  return [...seen.values()];
}
function renderTone(text){
  const box = $("#tone"); if (!box) return;
  box.textContent = "";
  const hits = toneCheck(text);
  if (!hits.length){ box.dataset.ok = "1"; box.append(el("b", {text: "Ton kontrolü: temiz"}), el("span", {text: "Kurum etken çatıyla, olayın sahibi olarak konuşuyor."})); return; }
  box.dataset.ok = "0";
  box.append(el("b", {text: `Ton kontrolü: ${hits.length} sorunlu ifade`}));
  const ul = el("ul"); hits.forEach(([m, why]) => ul.append(el("li", {}, el("q", {text: m}), document.createTextNode(" " + why)))); box.append(ul);
}

/* ---------------- PDF ---------------- */
let pdfLib = null;
function loadPdfLib(){
  if (pdfLib) return pdfLib;
  pdfLib = new Promise((res, rej) => {
    const sc = document.createElement("script");
    sc.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
    sc.onload = () => res(window.html2pdf); sc.onerror = () => { pdfLib = null; rej(new Error("load")); };
    document.head.append(sc);
  });
  return pdfLib;
}
async function makePdf(){
  const p = state.lastPlan; if (!p) return;
  const st = $("#pdfStatus"); st.classList.remove("err"); st.textContent = "PDF hazırlanıyor...";
  $("#pdfBtn").disabled = true;
  try {
    const h2p = await loadPdfLib();
    const s = state.scen, doc = $("#pdfdoc"); doc.textContent = "";
    const sec = (t, ...k) => doc.append(el("h2", {text: t}), ...k);
    doc.append(el("h1", {text: "Kriz İletişim Planı"}), el("p", {class: "muted", text: `${s.kurum} · ${s.baslik} · T+${pad(state.minute)} dk · İnsan onaylı`}));
    sec("Durum değerlendirmesi", el("p", {text: `Kriz kümesi: ${CLUSTERS[p.kume]?.ad || p.kume} · Risk puanı: ${p.risk} · Strateji: ${p.strateji}`}), el("p", {text: p.degerlendirme || ""}));
    sec("İlk açıklama", el("div", {class: "box", text: p.ilk_aciklama}));
    const qa = el("div"); (p.sorular || []).forEach(q => qa.append(el("p", {}, el("strong", {text: q.soru})), el("p", {class: "muted", text: q.cevap})));
    sec("Gazeteci soruları", qa);
    const ul = el("ul"); (p.kanal_plani || []).forEach(x => ul.append(el("li", {}, el("strong", {text: x.zaman + ": "}), document.createTextNode(x.aksiyon))));
    sec("Kanal planı", ul);
    const v = el("ul"); (p.dogrulanacaklar || []).forEach(x => v.append(el("li", {text: x})));
    const a = el("ul"); (p.kacinilacaklar || []).forEach(x => a.append(el("li", {text: x})));
    sec("Yayından önce doğrulanacaklar", v); sec("Kaçınılacaklar", a);
    doc.append(el("p", {class: "muted", style: "margin-top:20px;font-size:11px", text: "Kriz Masası · İzmir Katip Çelebi Üniversitesi Halkla İlişkiler ve Reklamcılık · 19 Ekim 2026. Senaryo ve kurum kurgusaldır."}));
    const blob = await h2p().set({margin: 10, image: {type: "jpeg", quality: 0.95}, html2canvas: {scale: 2, backgroundColor: "#ffffff"}, jsPDF: {unit: "mm", format: "a4"}, pagebreak: {mode: ["css", "legacy"]}}).from(doc).outputPdf("blob");
    const name = "kriz-plani-" + s.kurum.toLocaleLowerCase("tr").replace(/[^a-z0-9çğıöşü]+/gi, "-").replace(/^-|-$/g, "") + ".pdf";
    if (downloads) await downloads.save({filename: name, data: blob});
    else { const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name; document.body.append(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000); }
    st.textContent = "PDF kaydedildi.";
  } catch (e) {
    st.classList.add("err");
    st.textContent = e?.code === "declined" ? "İndirme iptal edildi." : "PDF oluşturulamadı. 'Planın tamamını kopyala' ile metni alabilirsin.";
  } finally { $("#pdfBtn").disabled = ![...document.querySelectorAll("#approve input")].every(c => c.checked); }
}
async function copy(text, btn){
  const old = btn.textContent;
  try { await navigator.clipboard.writeText(text); btn.textContent = "Kopyalandı"; }
  catch { btn.textContent = "Kopyalanamadı, metni seç"; }
  setTimeout(() => btn.textContent = old, 1800);
}

/* ---------------- Prompt kütüphanesi ---------------- */
const CAT_COLOR = {"Kriz":"var(--coral)", "Basın":"var(--tang)", "Sosyal medya":"var(--pink)", "Paydaş":"var(--teal)", "Reklam":"var(--violet)", "Ölçüm":"var(--blue)", "Kariyer":"var(--sun)"};
let pCat = "Tümü";
function renderPrompts(){
  const cats = ["Tümü", ...new Set(PROMPTS.map(p => p.kat))];
  const f = $("#pFilters"); f.textContent = "";
  cats.forEach(c => { const b = el("button", {type: "button", "aria-pressed": String(c === pCat), text: c}); b.onclick = () => { pCat = c; renderPrompts(); }; f.append(b); });
  const g = $("#pGrid"); g.textContent = "";
  PROMPTS.filter(p => pCat === "Tümü" || p.kat === pCat).forEach(p => {
    const btn = el("button", {class: "btn", type: "button", text: "Kopyala"}); btn.onclick = () => copy(p.metin, btn);
    g.append(el("article", {class: "pcard", style: `--c:${CAT_COLOR[p.kat] || "var(--violet)"}`},
      el("header", {}, el("div", {}, el("span", {class: "eyebrow", text: p.kat}), el("h3", {text: p.baslik})), btn),
      el("p", {text: p.ne}), el("pre", {text: p.metin})));
  });
}

/* ---------------- Açılış: yayılan paylaşım ağı ---------------- */
const net = {cv: null, ctx: null, w: 0, h: 0, dpr: 1, nodes: [], edges: [], adj: [], next: 0, visible: true, col: {}};
const HUBS = ["X", "TikTok", "Haber", "Instagram", "LinkedIn", "TV", "WhatsApp"];
function netColors(){
  const cs = getComputedStyle(document.documentElement);
  ["--violet", "--sun", "--muted", "--line", "--ink", "--surface"].forEach(k => net.col[k] = cs.getPropertyValue(k).trim());
}
function netBuild(){
  if (!net.cv) return;
  const r = net.cv.getBoundingClientRect(); if (!r.width) return;
  net.dpr = Math.min(2, window.devicePixelRatio || 1); net.w = r.width; net.h = r.height;
  net.cv.width = Math.round(r.width * net.dpr); net.cv.height = Math.round(r.height * net.dpr);
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const n = Math.max(28, Math.min(95, Math.round(net.w * net.h / 9500)));
  net.nodes = Array.from({length: n}, (_, i) => ({x: rnd() * net.w, y: rnd() * net.h, ph: rnd() * 6.28, sp: .4 + rnd() * .6, hub: i < HUBS.length ? HUBS[i] : null, lit: -1, hop: 0}));
  net.edges = []; net.adj = net.nodes.map(() => []);
  net.nodes.forEach((a, i) => {
    const near = net.nodes.map((b, j) => [j, (a.x - b.x) ** 2 + (a.y - b.y) ** 2]).filter(([j]) => j !== i).sort((p, q) => p[1] - q[1]).slice(0, 3);
    near.forEach(([j]) => { if (!net.adj[i].includes(j)){ net.adj[i].push(j); net.adj[j].push(i); net.edges.push([i, j]); } });
  });
  net.next = 0;
}
function netIgnite(now){
  if (!net.nodes.length) return;
  const right = net.nodes.map((nd, i) => i).filter(i => net.nodes[i].x > net.w * .45);
  const pool = right.length ? right : net.nodes.map((_, i) => i);
  const src = pool[Math.floor(Math.random() * pool.length)];
  net.nodes.forEach(nd => { nd.lit = -1; nd.hop = 0; });
  const q = [src]; net.nodes[src].lit = now;
  while (q.length){
    const i = q.shift();
    net.adj[i].forEach(j => { if (net.nodes[j].lit < 0){ net.nodes[j].hop = net.nodes[i].hop + 1; net.nodes[j].lit = net.nodes[i].lit + 260 + Math.random() * 260; q.push(j); } });
  }
  net.next = now + 6500;
}
function netPos(nd, now){ const t = reduceMotion ? 0 : now / 1000 * nd.sp; return [nd.x + Math.cos(nd.ph + t) * 6, nd.y + Math.sin(nd.ph + t * 1.3) * 6]; }
function netDraw(now){
  const {ctx, w, h, dpr, col} = net; if (!ctx || !w) return;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, w, h);
  if (!reduceMotion && now > net.next) netIgnite(now);
  const P = net.nodes.map(nd => netPos(nd, now));
  const fadeL = x => w < 900 ? .35 : Math.min(1, .15 + Math.max(0, (x - w * .3) / (w * .45)));
  const lit = nd => { if (nd.lit < 0 || now < nd.lit) return 0; const a = now - nd.lit; return a < 2600 ? 1 - a / 2600 : 0; };
  ctx.lineWidth = 1;
  net.edges.forEach(([i, j]) => {
    const a = net.nodes[i], b = net.nodes[j], f = Math.min(fadeL(P[i][0]), fadeL(P[j][0]));
    ctx.strokeStyle = col["--line"]; ctx.globalAlpha = .9 * f;
    ctx.beginPath(); ctx.moveTo(P[i][0], P[i][1]); ctx.lineTo(P[j][0], P[j][1]); ctx.stroke();
    if (a.lit >= 0 && b.lit >= 0){
      const [s, e] = a.lit < b.lit ? [i, j] : [j, i];
      if (now > net.nodes[s].lit){
        const span = Math.max(1, net.nodes[e].lit - net.nodes[s].lit), p = Math.min(1, (now - net.nodes[s].lit) / span), fade = lit(net.nodes[e]) || (p < 1 ? 1 : 0);
        if (fade > 0){
          ctx.strokeStyle = net.nodes[s].hop < 2 ? col["--violet"] : col["--sun"]; ctx.globalAlpha = fade * f; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(P[s][0], P[s][1]); ctx.lineTo(P[s][0] + (P[e][0] - P[s][0]) * p, P[s][1] + (P[e][1] - P[s][1]) * p); ctx.stroke(); ctx.lineWidth = 1;
        }
      }
    }
  });
  net.nodes.forEach((nd, i) => {
    const [x, y] = P[i], f = fadeL(x), k = lit(nd);
    const hot = nd.hop < 2 ? col["--violet"] : col["--sun"];
    ctx.globalAlpha = f;
    if (k > 0){
      const age = now - nd.lit;
      if (age < 900){ ctx.strokeStyle = hot; ctx.globalAlpha = f * (1 - age / 900); ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, 4 + age / 900 * 22, 0, 6.283); ctx.stroke(); ctx.lineWidth = 1; ctx.globalAlpha = f; }
      ctx.fillStyle = hot; ctx.beginPath(); ctx.arc(x, y, nd.hub ? 6 + k * 3 : 3 + k * 2.5, 0, 6.283); ctx.fill();
    } else {
      ctx.fillStyle = col["--line"]; ctx.beginPath(); ctx.arc(x, y, nd.hub ? 5 : 2.6, 0, 6.283); ctx.fill();
    }
    if (nd.hub && f > .5){
      ctx.font = "700 11px 'JetBrains Mono', monospace"; const tw = ctx.measureText(nd.hub).width;
      ctx.globalAlpha = f * (k > 0 ? 1 : .55);
      ctx.fillStyle = k > 0 ? hot : col["--surface"]; ctx.strokeStyle = k > 0 ? hot : col["--line"];
      const bx = x + 9, by = y - 20, bw = tw + 14, bh = 20;
      ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(bx, by, bw, bh, 6); else ctx.rect(bx, by, bw, bh); ctx.fill(); ctx.stroke();
      ctx.fillStyle = k > 0 ? (nd.hop < 2 ? "#fff" : "#26221f") : col["--muted"]; ctx.textBaseline = "middle"; ctx.textAlign = "left";
      ctx.fillText(nd.hub, bx + 7, by + bh / 2 + 1);
    }
  });
  ctx.globalAlpha = 1;
}
function netLoop(now){ if (net.visible && !$("#opening").hidden) netDraw(now); requestAnimationFrame(netLoop); }

/* ---------------- Geri sayım ---------------- */
const LESSON = new Date("2026-10-19T10:00:00+03:00").getTime(), LESSON_END = LESSON + 90 * 60000;
function countdown(){
  const now = Date.now(); let d = Math.max(0, LESSON - now);
  if (now >= LESSON && now < LESSON_END) $("#cdLabel").textContent = "Ders şu an sürüyor";
  else if (now >= LESSON_END) $("#cdLabel").textContent = "Ders tamamlandı, katıldığın için teşekkürler";
  const D = Math.floor(d / 864e5); d -= D * 864e5; const H = Math.floor(d / 36e5); d -= H * 36e5; const M = Math.floor(d / 6e4); d -= M * 6e4; const S = Math.floor(d / 1e3);
  $("#cdD").textContent = pad(D); $("#cdH").textContent = pad(H); $("#cdM").textContent = pad(M); $("#cdS").textContent = pad(S);
}

/* ---------------- Sekmeler ---------------- */
let currentTab = "masa";
function setTab(t, scroll){
  if (!["masa", "promptlar", "rehber"].includes(t)) t = "masa";
  currentTab = t;
  document.querySelectorAll("[data-view]").forEach(s => s.hidden = s.dataset.view !== t);
  document.querySelectorAll(".tabs a").forEach(a => { if (a.dataset.tab === t) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current"); });
  $("#opening").hidden = !(t === "masa" && step === "secim");
  if (t === "masa") requestAnimationFrame(() => { sizeRadar(); drawRadar(performance.now()); netBuild(); });
  if (scroll) window.scrollTo({top: 0, behavior: "auto"});
}
function showTab(){ setTab(location.hash.slice(1)); }
document.querySelectorAll('a[href^="#"]').forEach(a => {
  const t = a.getAttribute("href").slice(1);
  if (!["masa", "promptlar", "rehber"].includes(t) || a.id === "startCta") return;
  a.addEventListener("click", e => { e.preventDefault(); setTab(t, true); try { history.replaceState(null, "", "#" + t); } catch {} });
});

document.querySelectorAll(".steps button").forEach(b => b.onclick = () => goStep(b.dataset.step));
document.querySelectorAll("[data-goto]").forEach(b => b.onclick = () => goStep(b.dataset.goto));
$("#toPlan").onclick = () => goStep("plan");

/* ---------------- Bağlantılar ---------------- */
$("#playBtn").onclick = () => state.timer ? stop() : play();
$("#speedBtn").onclick = () => {
  state.speed = state.speed === 1 ? 2 : state.speed === 2 ? 4 : 1;
  $("#speedBtn").textContent = "Hız " + state.speed + "×"; $("#speedBtn").setAttribute("aria-pressed", String(state.speed > 1));
  if (state.timer){ stop(); play(); }
};
$("#skipBtn").onclick = () => { stop(); state.minute = 60; renderAll(); };
$("#resetBtn").onclick = reset;
$("#twistBtn").onclick = () => {
  if (state.twist || !state.scen.gelisme) return;
  state.twist = true; state.twistAt = Math.max(1, state.minute);
  renderAll();

};
$("#rep").onchange = renderGauges; $("#hist").onchange = renderGauges;
document.querySelectorAll("#draftToggle button").forEach(b => b.onclick = () => { state.view = b.dataset.v; renderStatement(); });
$("#approve").addEventListener("change", updateApprove);
$("#copyStatement").onclick = e => state.lastPlan && copy(state.lastPlan.ilk_aciklama, e.currentTarget);
$("#copyPlan").onclick = e => state.lastPlan && copy(planText(state.lastPlan), e.currentTarget);
$("#pdfBtn").onclick = makePdf;
window.addEventListener("hashchange", showTab);
window.addEventListener("resize", () => { sizeRadar(); drawRadar(performance.now()); netBuild(); netDraw(performance.now()); });
$("#startCta").onclick = e => { e.preventDefault(); setTab("masa"); goStep("secim"); requestAnimationFrame(() => $("#v-masa").scrollIntoView({behavior: reduceMotion ? "auto" : "smooth", block: "start"})); };
new MutationObserver(() => { readColors(); netColors(); drawRadar(performance.now()); }).observe(document.documentElement, {attributes: true, attributeFilter: ["data-theme"]});

/* ---------------- Başlangıç ---------------- */
radar.cv = $("#radar"); radar.ctx = radar.cv.getContext("2d"); readColors();
renderScenList(); renderPrompts(); selectScen(SCENARIOS[0].id); showTab(); goStep("secim");
sizeRadar();
if (reduceMotion) drawRadar(performance.now()); else requestAnimationFrame(radarLoop);
document.fonts?.ready.then(() => drawRadar(performance.now()));
net.cv = $("#net"); net.ctx = net.cv.getContext("2d"); netColors(); netBuild();
new IntersectionObserver(es => { net.visible = es[0].isIntersecting; }).observe($("#opening"));
if (reduceMotion){ netIgnite(performance.now() - 1200); netDraw(performance.now()); } else { netIgnite(performance.now()); requestAnimationFrame(netLoop); }
countdown(); setInterval(countdown, 1000);

(async () => {
  try { if (window.claude?.use) downloads = await claude.use("downloads"); } catch { downloads = null; }
  updateApprove();
})();
