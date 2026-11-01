#!/usr/bin/env node
/* apply-map-fix.js
   اعمال ۶ پچ روی app.js و تولید نسخه کامل پچ‌شده.
   استفاده:  node apply-map-fix.js app.js app.patched.js
   اگر هیچ بلوکی پیدا نشود، فایل خروجی نوشته نمی‌شود (پروژه نیمه‌پچ نمی‌ماند).
*/
const fs = require('fs');
const { execFileSync } = require('child_process');

const srcPath = process.argv[2] || 'app.js';
const outPath = process.argv[3] || 'app.patched.js';

if (!fs.existsSync(srcPath)) { console.error('فایل پیدا نشد: ' + srcPath); process.exit(1); }
let text = fs.readFileSync(srcPath, 'utf8');

const BLOCKS = [
  {
    id: 1,
    name: 'Map reliability section (tiles + invalidateSize)',
    re: /\/\/ ===== Map reliability \(Leaflet\) =====[\s\S]*?try\{ hookLeaflet\(\); \}catch\(_\)\{\}/,
    repl: String.raw`/* ===== Map reliability (Leaflet) ===== */
let _leafletP=null;
window.__mapDiag=window.__mapDiag||[];
document.addEventListener('securitypolicyviolation',e=>{ try{ window.__mapDiag.push('CSP-blocked: '+String(e.blockedURI).replace(/^https?:\/\//,'').split('/')[0]+' ('+e.violatedDirective+')'); }catch(_){} });

// منبع اصلی CARTO (بدون کلید، پایدارتر برای ترافیک سایت) — OSM پشتیبان دوم
const TILE_SOURCES=[
  {u:'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',s:'abcd',a:'© OpenStreetMap © CARTO'},
  {u:'https://tile.openstreetmap.org/{z}/{x}/{y}.png',s:'abc',a:'© OpenStreetMap'},
  {u:'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',s:'abc',a:'Tiles © Esri'},
  {u:'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',s:'abc',a:'© OpenTopoMap'}
];

// invalidateSize تکراری تا وقتی کانتینر واقعاً اندازه بگیرد (انیمیشن دیالوگ)
function fixMapSize(map, ms){
  if(!map) return;
  const step=50, max=Math.max(1,Math.ceil((ms||1200)/step));
  let n=0, iv=null;
  const once=()=>{ try{ const el=map.getContainer(); if(el && el.offsetWidth && el.offsetHeight) map.invalidateSize({animate:false}); }catch(_){} };
  once();
  iv=setInterval(()=>{ once(); if(++n>=max){ clearInterval(iv); iv=null; } }, step);
  try{ map.on('unload', ()=>{ if(iv) clearInterval(iv); }); }catch(_){}
}
function prepMapContainer(el){
  if(!el) return;
  el.style.position='relative';
  el.style.zIndex='0';
  el.style.isolation='isolate';
}

function hookLeaflet(){
  if(window._lfHooked||typeof L==='undefined') return;
  window._lfHooked=1;
  try{
    const pin='<svg xmlns="http://www.w3.org/2000/svg" width="30" height="42" viewBox="0 0 30 42"><path d="M15 1C7.3 1 1 7.2 1 14.8 1 25 15 41 15 41s14-16 14-26.2C29 7.2 22.7 1 15 1z" fill="#0e7a4b" stroke="#fff" stroke-width="2"/><circle cx="15" cy="15" r="5.5" fill="#fff"/></svg>';
    L.Marker.prototype.options.icon=L.icon({iconUrl:'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(pin),iconSize:[30,42],iconAnchor:[15,41],popupAnchor:[0,-36]});
  }catch(_){}
  L.Map.addInitHook(function(){
    const m=this;
    prepMapContainer(m.getContainer());
    fixMapSize(m, 1600);
    if(window.ResizeObserver){
      let last=0;
      const ro=new ResizeObserver(()=>{
        const el=m.getContainer(); if(!el) return;
        if(!el.offsetWidth||!el.offsetHeight) return;
        const now=Date.now(); if(now-last<120) return; last=now;
        try{ m.invalidateSize({animate:false}); }catch(_){}
      });
      try{ ro.observe(m.getContainer()); }catch(_){}
      m.on('unload',()=>ro.disconnect());
    }
  });
  L.TileLayer.addInitHook(function(){
    if(!this.options._osm) return;
    const self=this; let errs=0, ok=false, timer=null, exhausted=false;
    const arm=()=>{ clearTimeout(timer); timer=setTimeout(()=>{ if(!ok && self._map && !exhausted) next(); },8000); };
    const next=()=>{
      const cur=self.options._srcIdx||0;
      const idx=cur+1;
      if(idx>=TILE_SOURCES.length){
        exhausted=true; clearTimeout(timer);
        toast('تصاویر نقشه بارگذاری نمی‌شود؛ اینترنت را بررسی کنید.');
        return;
      }
      self.options._srcIdx=idx; errs=0; ok=false;
      const prev=TILE_SOURCES[cur], s=TILE_SOURCES[idx];
      self.options.subdomains=s.s.split(''); self.options.attribution=s.a;
      self.options.detectRetina=/\{r\}/.test(s.u);
      try{
        if(self._map&&self._map.attributionControl){
          self._map.attributionControl.removeAttribution(prev.a);
          self._map.attributionControl.addAttribution(s.a);
        }
      }catch(_){}
      self.setUrl(s.u); arm();
    };
    this.on('tileload',()=>{ ok=true; clearTimeout(timer); });
    this.on('tileerror',()=>{ if(!ok && ++errs>=3) next(); });
    this.on('add',arm);
    this.on('remove',()=>clearTimeout(timer));
  });
}
function ensureLeaflet(){
  if(typeof L!=='undefined'){ hookLeaflet(); return Promise.resolve(true); }
  if(_leafletP) return _leafletP;
  const loadJs=(u,ms)=>new Promise((res,rej)=>{
    const s=document.createElement('script'); s.src=u; s.async=true;
    const to=setTimeout(()=>{ s.remove(); rej(new Error('timeout')); },ms);
    s.onload=()=>{ clearTimeout(to); res(); };
    s.onerror=()=>{ clearTimeout(to); s.remove(); rej(new Error('load-failed')); };
    document.head.appendChild(s);
  });
  _leafletP=(async()=>{
    if(!document.querySelector('link[data-lf]')){
      ['./vendor/leaflet/leaflet.css','https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css','https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css','https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'].forEach(href=>{
        try{ const l=document.createElement('link'); l.rel='stylesheet'; l.href=href; l.dataset.lf='1'; document.head.appendChild(l); }catch(_){}
      });
    }
    const urls=[
      './vendor/leaflet/leaflet.js',
      'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js',
      'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js',
      'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    ];
    for(let round=0; round<2; round++){
      for(const u of urls){
        if(typeof L!=='undefined'){ hookLeaflet(); return true; }
        try{ await loadJs(u, 12000); if(typeof L!=='undefined'){ hookLeaflet(); return true; } window.__mapDiag.push(u.replace(/^https?:\/\//,'').split('/')[0]+': not-leaflet'); }
        catch(e){ window.__mapDiag.push((u.startsWith('.')?'local':u.replace(/^https?:\/\//,'').split('/')[0])+': '+(e&&e.message||'err')); }
      }
    }
    return typeof L!=='undefined';
  })();
  _leafletP.then(ok=>{ if(!ok) _leafletP=null; });
  return _leafletP;
}
function mapFail(el, retry){
  if(typeof el==='string') el=document.getElementById(el);
  if(!el) return;
  const diag=(window.__mapDiag||[]).slice(-6).join(' | ');
  el.innerHTML='<div style="height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;padding:12px;text-align:center;font-size:12px;color:var(--mu)"><div>🗺️ کتابخانه‌ی نقشه بارگذاری نشد</div><button type="button" class="capsule-btn primary" data-retry>تلاش دوباره</button><small style="direction:ltr;opacity:.65;font-size:10px;word-break:break-all">'+esc(diag||'no-diagnostics')+'</small></div>';
  const b=el.querySelector('[data-retry]'); if(b) b.onclick=()=>{ _leafletP=null; window.__mapDiag=[]; el.innerHTML='<div style="padding:12px;text-align:center;font-size:12px;color:var(--mu)">در حال بارگذاری…</div>'; ensureLeaflet().then(ok=>{ if(ok){ el.innerHTML=''; retry&&retry(); } else mapFail(el,retry); }); };
}
function baseTiles(){
  const s=TILE_SOURCES[0];
  return L.tileLayer(s.u,{maxZoom:19,subdomains:s.s.split(''),attribution:s.a,detectRetina:true,_osm:true,_srcIdx:0});
}
try{ hookLeaflet(); }catch(_){}`
  },
  {
    id: 2,
    name: 'open-radius-modal-btn handler',
    re: /document\.getElementById\("open-radius-modal-btn"\)\.onclick = \(\) => \{[\s\S]*?\n\};/,
    repl: String.raw`document.getElementById("open-radius-modal-btn").onclick = () => {
  const dlg = document.getElementById("radius-dlg");
  if(dlg.open) return;
  if(typeof L === 'undefined') { toast('در حال بارگذاری نقشه...'); ensureLeaflet().then(ok => { if(ok) document.getElementById("open-radius-modal-btn").click(); else toast('نقشه در دسترس نیست؛ اینترنت را بررسی کنید.'); }); return; }
  destroyRadiusMap();
  dlg.showModal();
  requestAnimationFrame(() => requestAnimationFrame(() => {
    if(!dlg.open) return;
    prepMapContainer(document.getElementById('radius-map-container'));
    radiusMap = L.map('radius-map-container').setView([radiusCenterLat, radiusCenterLng], 10);
    fixMapSize(radiusMap, 1600);
    baseTiles().addTo(radiusMap);
    radiusMarker = L.marker([radiusCenterLat, radiusCenterLng], {draggable: true}).addTo(radiusMap);
    radiusCircle = L.circle([radiusCenterLat, radiusCenterLng], {
      radius: radiusMaxKm * 1000, color: '#0e7a4b', fillColor: '#37b676', fillOpacity: 0.2
    }).addTo(radiusMap);
    const updateMapCenter = (lat, lng) => {
      radiusCenterLat = lat; radiusCenterLng = lng;
      radiusMarker.setLatLng([lat, lng]); radiusCircle.setLatLng([lat, lng]);
    };
    radiusMarker.on('dragend', function() {
      const pos = radiusMarker.getLatLng();
      updateMapCenter(pos.lat, pos.lng);
    });
    radiusMap.on('click', function(e) { updateMapCenter(e.latlng.lat, e.latlng.lng); });
    document.getElementById("radius-slider").oninput = function() {
      radiusMaxKm = +this.value;
      document.getElementById("radius-val").textContent = radiusMaxKm + " ک‌م";
      if(radiusCircle) radiusCircle.setRadius(radiusMaxKm * 1000);
    };
    document.getElementById("radius-slider").value = radiusMaxKm;
    document.getElementById("radius-val").textContent = radiusMaxKm + " ک‌م";
  }));
};`
  },
  {
    id: 3,
    name: 'initMapPicker function',
    re: /function initMapPicker\(lat, lng, _attempts = 0\) \{[\s\S]*?\n\}/,
    repl: String.raw`function initMapPicker(lat, lng, _attempts = 0) {
  if(typeof L === 'undefined') { ensureLeaflet().then(ok => { if(ok) initMapPicker(lat, lng, _attempts); else { toast('نقشه بارگذاری نشد؛ اینترنت را بررسی کنید.'); mapFail('map-picker-container', () => initMapPicker(lat, lng)); } }); return; }
  if(!Number.isFinite(lat) || !Number.isFinite(lng)) { lat = 34.5553; lng = 69.2075; }
  const mapContainer = document.getElementById('map-picker-container');
  if(!mapContainer || !document.getElementById("add").open) {
    if (_attempts < 60) setTimeout(() => initMapPicker(lat, lng, _attempts + 1), 100);
    return;
  }
  if(mapPicker) { try{ mapPicker.remove(); }catch(e){}; mapPicker = null; }
  pickerMarker = null;
  prepMapContainer(mapContainer);
  mapPicker = L.map('map-picker-container').setView([lat, lng], 13);
  fixMapSize(mapPicker, 1600);
  baseTiles().addTo(mapPicker);
  pickerMarker = L.marker([lat, lng], {draggable: true}).addTo(mapPicker);
  pickerMarker.on('dragend', function() {
    const pos = pickerMarker.getLatLng();
    document.getElementById("form-lat").value = pos.lat;
    document.getElementById("form-lng").value = pos.lng;
  });
  mapPicker.on('click', function(e) {
    pickerMarker.setLatLng(e.latlng);
    document.getElementById("form-lat").value = e.latlng.lat;
    document.getElementById("form-lng").value = e.latlng.lng;
  });
}`
  },
  {
    id: 4,
    name: 'drawAdMap',
    re: /const drawAdMap = \(\) => \{[\s\S]*?\n  \};/,
    repl: String.raw`const drawAdMap = () => {
    const container = document.getElementById('ad-view-map');
    if(!container || typeof L === 'undefined') return;
    if(window._adViewMap) { try { window._adViewMap.remove(); } catch(e) {} window._adViewMap = null; }
    const latNum = Number(a.lat);
    const lngNum = Number(a.lng);
    const lat = Number.isFinite(latNum) && latNum >= 20 && latNum <= 40 ? latNum : 34.5553;
    const lng = Number.isFinite(lngNum) && lngNum >= 55 && lngNum <= 80 ? lngNum : 69.2075;
    prepMapContainer(container);
    const map = L.map('ad-view-map').setView([lat, lng], 13);
    fixMapSize(map, 1200);
    baseTiles().addTo(map);
    L.marker([lat, lng]).addTo(map).bindPopup(esc(a.t)).openPopup();
    window._adViewMap = map;
  };`
  },
  {
    id: 5,
    name: 'global dialog toggle listener',
    re: /let radiusCircle = null;/,
    repl: String.raw`let radiusCircle = null;

// هر بار یک دیالوگ حاوی نقشه باز شد، اندازه را تازه کن
document.addEventListener('toggle', e => {
  const dlg = e.target;
  if(!dlg || dlg.tagName !== 'DIALOG' || !dlg.open) return;
  try{
    if(dlg.id === 'radius-dlg') fixMapSize(radiusMap, 1600);
    else if(dlg.id === 'add') fixMapSize(mapPicker, 1600);
    else if(dlg.id === 'dlg') fixMapSize(window._adViewMap, 1200);
  }catch(_){}
}, true);`
  },
  {
    id: 6,
    name: 'goToStep picker delay',
    re: /if\(n===TOTAL_STEPS\) setTimeout\([^\n]*\n/,
    repl: String.raw`if(n===TOTAL_STEPS) setTimeout(()=>{
    const latv=parseFloat(document.getElementById("form-lat").value);
    const lngv=parseFloat(document.getElementById("form-lng").value);
    initMapPicker(Number.isFinite(latv)?latv:34.5553, Number.isFinite(lngv)?lngv:69.2075);
  }, 260);
`
  }
];

let failed = 0;
for (const b of BLOCKS) {
  if (!b.re.test(text)) { console.error('✗ بلوک ' + b.id + ' پیدا نشد: ' + b.name); failed++; continue; }
  text = text.replace(b.re, () => b.repl);
  console.log('✓ بلوک ' + b.id + ' اعمال شد: ' + b.name);
}

if (failed) { console.error('\n' + failed + ' بلوک ناموفق — خروجی نوشته نشد.'); process.exit(2); }

fs.writeFileSync(outPath, text, 'utf8');
console.log('\nنوشته شد: ' + outPath + '  (' + text.length + ' کاراکتر)');

try {
  execFileSync(process.execPath, ['--check', outPath], { stdio: 'inherit' });
  console.log('✓ بررسی سینتکس پاس شد.');
} catch (e) {
  console.error('✗ خطای سینتکس در خروجی — فایل اصلی دست‌نخورده است.');
  process.exit(3);
}
