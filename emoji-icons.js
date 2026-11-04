/* افغان‌بازار — تبدیل ایموجی به آیکن SVG سبک (v53)
   - ایموجی‌های متن صفحه (دسته‌ها، دکمه‌ها، عنوان‌ها، وضعیت‌ها) خودکار به SVG تبدیل می‌شوند
   - داخل <option>، پیام‌های toast، textarea و input دست‌نخورده می‌ماند (ایموجی داخل option حذف می‌شود) */
(function(){
  'use strict';
  var NS='http://www.w3.org/2000/svg';
  var SYM={
    grid:'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    home:'<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
    car:'<path d="M5 17H3v-5l2-5h14l2 5v5h-2"/><path d="M3 12h18"/><circle cx="7.5" cy="17" r="2"/><circle cx="16.5" cy="17" r="2"/><path d="M9.5 17h5"/>',
    laptop:'<rect x="4" y="5" width="16" height="11" rx="1.5"/><path d="M2 20h20"/>',
    basket:'<path d="M3 10h18l-2 10H5z"/><path d="M8 10l3-6M16 10l-3-6"/>',
    sofa:'<path d="M5 11V8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3"/><path d="M3 13a2 2 0 0 1 4 0v2h10v-2a2 2 0 0 1 4 0v5H3z"/><path d="M5 18v2M19 18v2"/>',
    shirt:'<path d="M8 3L3 6l2 4 3-1v12h8V9l3 1 2-4-5-3a4 4 0 0 1-8 0z"/>',
    sheep:'<path d="M5 14a3 3 0 0 1 2-5 3.5 3.5 0 0 1 6-1 3 3 0 0 1 3 5v2H5z"/><path d="M7 16v4M14 16v4"/><ellipse cx="19" cy="12" rx="2" ry="2.6"/>',
    nut:'<path d="M12 3c4 0 7 4 7 9a7 7 0 0 1-14 0c0-5 3-9 7-9z"/><path d="M12 3v6M8 11l4-2 4 2"/>',
    wrench:'<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-.6-.6-2.4z"/>',
    tools:'<path d="M11 8l5-5 5 5-5 5z"/><path d="M12.5 11.5L4 20l1 1 8.5-8.5"/>',
    briefcase:'<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18"/>',
    book:'<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5M8 7h7"/>',
    ball:'<circle cx="12" cy="12" r="9"/><path d="M12 7l4 3-1.5 5h-5L8 10z"/><path d="M12 3v4M16 10l5-1M14.5 15l3 4M9.5 15l-3 4M8 10L3 9"/>',
    music:'<path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>',
    wheat:'<path d="M12 22V8"/><path d="M12 8c-3 0-4-2-4-4 3 0 4 2 4 4zM12 8c3 0 4-2 4-4-3 0-4 2-4 4zM12 14c-3 0-4-2-4-4 3 0 4 2 4 4zM12 14c3 0 4-2 4-4-3 0-4 2-4 4z"/>',
    building:'<rect x="5" y="3" width="10" height="18"/><path d="M9 7h2M9 11h2M9 15h2M15 21h5V10h-5"/>',
    gear:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
    drop:'<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/>',
    bag:'<path d="M6 7h12l1 14H5z"/><path d="M9 7a3 3 0 0 1 6 0"/>',
    dl:'<rect x="6" y="2" width="12" height="20" rx="2.5"/><path d="M12 8v6M9.5 11.5L12 14l2.5-2.5"/>',
    globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
    bookopen:'<path d="M2 5h7a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H2zM22 5h-7a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h8z"/>',
    contrast:'<circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor"/>',
    lock:'<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
    sparkle:'<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 17v4M17 19h4"/>',
    folder:'<path d="M3 6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
    camera:'<path d="M3 8a2 2 0 0 1 2-2h2l2-2h6l2 2h2a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><circle cx="12" cy="13" r="4"/>',
    rocket:'<path d="M12 15l-3-3a22 22 0 0 1 2-4 12 12 0 0 1 11-5c0 3-1 8-5 11a22 22 0 0 1-4 2z"/><path d="M9 12H4s.5-3 2-4c1.6-.9 5 0 5 0M12 15v5s3-.5 4-2c.9-1.6 0-5 0-5M5 15c-1.5 1.3-2 5-2 5s3.7-.5 5-2"/>',
    up:'<path d="M12 19V5M5 12l7-7 7 7"/>',
    checkc:'<circle cx="12" cy="12" r="9"/><path d="M8 12.5l3 3 5-6"/>',
    xc:'<circle cx="12" cy="12" r="9"/><path d="M9 9l6 6M15 9l-6 6"/>',
    coins:'<ellipse cx="12" cy="6" rx="8" ry="3"/><path d="M4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/>',
    clip:'<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4h6v3H9zM9 12h6M9 16h4"/>',
    flag:'<path d="M5 21V4M5 4h12l-2 4 2 4H5"/>',
    ban:'<circle cx="12" cy="12" r="9"/><path d="M5.6 5.6l12.8 12.8"/>',
    smile:'<circle cx="12" cy="12" r="9"/><path d="M8 14s1.5 2.5 4 2.5S16 14 16 14M9 9.5h.01M15 9.5h.01"/>',
    map:'<path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2z"/><path d="M9 4v14M15 6v14"/>',
    mic:'<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
    rec:'<circle cx="12" cy="12" r="6" fill="currentColor"/>',
    wifi:'<path d="M2 9a15 15 0 0 1 20 0M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0"/><circle cx="12" cy="19.5" r=".7" fill="currentColor"/>',
    help:'<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 1.7-2.5 2-2.5 4M12 17h.01"/>',
    zap:'<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
    dot:'<circle cx="12" cy="12" r="7" fill="currentColor" stroke="none"/>'
  };
  // ایموجی → [شناسهٔ symbol, رنگ اختیاری]. شناسه‌های i-* از sprite موجود صفحه می‌آیند.
  var MAP={
    '🗂':['e-grid'],'🏠':['e-home'],'🚗':['e-car'],'📱':['i-smartphone'],'💻':['e-laptop'],'🧺':['e-basket'],'🛋':['e-sofa'],'👕':['e-shirt'],
    '🐑':['e-sheep'],'🌰':['e-nut'],'🔧':['e-wrench'],'🛠':['e-tools'],'💼':['e-briefcase'],'📚':['e-book'],'⚽':['e-ball'],'🎸':['e-music'],
    '📦':['i-package'],'🌾':['e-wheat'],'🏗':['e-building'],'⚙':['e-gear'],'🧼':['e-drop'],'🛍':['e-bag'],'🛒':['i-cart'],'📲':['e-dl'],
    '🌐':['e-globe'],'🛡':['i-shield'],'📖':['e-bookopen'],'🌓':['e-contrast'],'🔔':['i-bell'],'⚖':['i-scale'],'🔐':['e-lock'],'📥':['i-inbox'],
    '✨':['e-sparkle'],'🎉':['e-sparkle'],'📁':['e-folder'],'📂':['e-folder'],'📷':['e-camera'],'🚀':['e-rocket'],'⬆':['e-up'],'✅':['e-checkc','var(--ac)'],
    '⭐':['i-star','var(--gd)',1],'⚠':['i-warning','#e0a800'],'📍':['i-map-pin'],'💰':['e-coins'],'💸':['e-coins'],'📞':['i-phone'],'👁':['i-eye'],
    '📝':['i-note'],'❌':['e-xc','var(--dg)'],'📋':['e-clip'],'🟢':['e-dot','#0e7a4b'],'🟡':['e-dot','#e0a800'],'🟠':['e-dot','#e0701a'],
    '🔴':['e-dot','var(--dg)'],'⚪':['e-dot','#aab7b0'],'🚩':['e-flag','var(--dg)'],'🔄':['i-refresh'],'💬':['i-chat'],'⛔':['e-ban','var(--dg)'],
    '🚫':['e-ban','var(--dg)'],'👋':['e-smile'],'🔍':['i-search'],'📭':['i-inbox'],'💔':['i-heart'],'🏪':['i-store'],'👤':['i-user'],'🗺':['e-map'],
    '🎤':['e-mic'],'⏺':['e-rec','var(--dg)'],'📡':['e-wifi'],'🔗':['i-link'],'❓':['e-help'],'⚡':['e-zap','#e0a800']
  };
  var keys=Object.keys(MAP).sort(function(a,b){return b.length-a.length});
  var RE=new RegExp('('+keys.join('|')+')[\\uFE0E\\uFE0F]?','g');
  var SKIP='script,style,title,textarea,input,svg,#toast,[data-no-emo]';

  function sprite(){
    if(document.getElementById('emo-sprite')) return;
    var s=document.createElementNS(NS,'svg'); s.setAttribute('id','emo-sprite'); s.setAttribute('aria-hidden','true');
    s.style.cssText='position:absolute;width:0;height:0;overflow:hidden';
    var h=''; for(var k in SYM) h+='<symbol id="e-'+k+'" viewBox="0 0 24 24">'+SYM[k]+'</symbol>';
    s.innerHTML=h; document.body.insertBefore(s,document.body.firstChild);
  }
  function css(){
    var st=document.createElement('style');
    st.textContent='.emo{width:1em;height:1em;vertical-align:-.14em;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;flex:none;display:inline-block}'+
      '.emo.f{fill:currentColor}'+
      '.ph .emo{color:var(--ac);opacity:.75;stroke-width:1.5}.tile .emo,.step-cat-tile .emo{color:var(--ac);stroke-width:1.7;width:1.25em;height:1.25em}'+
      '#tour-ic .emo{color:var(--ac);stroke-width:1.5}.cat .emo{margin-inline-end:2px}';
    document.head.appendChild(st);
  }
  function make(m){
    var e=MAP[m]; if(!e) return null;
    var s=document.createElementNS(NS,'svg'); s.setAttribute('class','emo'+(e[2]?' f':'')); s.setAttribute('aria-hidden','true');
    if(e[1]) s.style.color=e[1];
    var u=document.createElementNS(NS,'use'); u.setAttribute('href','#'+e[0]); s.appendChild(u); return s;
  }
  function fix(t){
    var p=t.parentNode; if(!p||p.nodeType!==1) return;
    var v=t.nodeValue; if(!v) return; RE.lastIndex=0; if(!RE.test(v)) return;
    if(p.nodeName==='OPTION'){ t.nodeValue=v.replace(RE,'').replace(/^\s+/,''); return; }
    if(p.closest&&p.closest(SKIP)) return;
    RE.lastIndex=0;
    var f=document.createDocumentFragment(),last=0,m;
    while((m=RE.exec(v))){
      if(m.index>last) f.appendChild(document.createTextNode(v.slice(last,m.index)));
      var s=make(m[1]); if(s) f.appendChild(s); else f.appendChild(document.createTextNode(m[0]));
      last=m.index+m[0].length;
    }
    if(last<v.length) f.appendChild(document.createTextNode(v.slice(last)));
    p.replaceChild(f,t);
  }
  function scan(n){
    if(n.nodeType===3){ fix(n); return; }
    if(n.nodeType!==1||n.nodeName==='SVG'||n.nodeName==='svg') return;
    var w=document.createTreeWalker(n,NodeFilter.SHOW_TEXT,null),a=[],x;
    while((x=w.nextNode())) a.push(x);
    for(var i=0;i<a.length;i++) fix(a[i]);
  }
  var q=new Set(),raf=0;
  function flush(){ raf=0; var a=Array.from(q); q.clear(); for(var i=0;i<a.length;i++) if(a[i].isConnected) scan(a[i]); }
  function init(){
    sprite(); css(); scan(document.body);
    new MutationObserver(function(ms){
      for(var i=0;i<ms.length;i++){
        var m=ms[i];
        if(m.type==='characterData'){ q.add(m.target); }
        else for(var j=0;j<m.addedNodes.length;j++) q.add(m.addedNodes[j]);
      }
      if(q.size&&!raf) raf=requestAnimationFrame(flush);
    }).observe(document.body,{childList:true,subtree:true,characterData:true});
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();
