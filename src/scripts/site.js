// Mermaid remains CDN-hosted in the first stable release.
if (window.mermaid) {
mermaid.initialize({startOnLoad:true,theme:'base',themeVariables:{
  darkMode:true,
  background:'#16161D',
  primaryColor:'#223249',
  primaryTextColor:'#DCD7BA',
  primaryBorderColor:'#2D4F67',
  secondaryColor:'#1F1F28',
  tertiaryColor:'#2A2A37',
  lineColor:'#54546D',
  textColor:'#C8C093',
  mainBkg:'#223249',
  nodeBorder:'#2D4F67',
  clusterBkg:'#1F1F28',
  clusterBorder:'#363646',
  edgeLabelBackground:'#1F1F28',
  fontFamily:'Inter, sans-serif',
  fontSize:'13px'
}});
}

(function(){
  var main = document.querySelector('main');
  var aside = document.querySelector('aside');
  var navLinks = [].slice.call(document.querySelectorAll('#nav > a'));

  function slug(t){
    return t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'')
            .replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  }
  function norm(t){
    return t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');
  }

  /* ---------- anclas en encabezados ---------- */
  main.querySelectorAll('h2, h3').forEach(function(h){
    if(!h.id){
      var base = slug(h.textContent), id = base, k = 2;
      while(document.getElementById(id)) id = base + '-' + (k++);
      h.id = id;
    }
    var a = document.createElement('a');
    a.className = 'anchor'; a.href = '#' + h.id; a.textContent = '#';
    a.setAttribute('aria-label','Enlace a esta sección');
    h.appendChild(a);
  });

  /* ---------- sub-navegación con los h3 de cada sección ---------- */
  navLinks.forEach(function(link){
    var h2 = document.getElementById(link.getAttribute('href').slice(1));
    if(!h2) return;
    var subs = [], n = h2.nextElementSibling;
    while(n && n.tagName !== 'H2'){
      if(n.tagName === 'H3') subs.push(n);
      n = n.nextElementSibling;
    }
    if(!subs.length) return;
    var box = document.createElement('div');
    box.className = 'subnav';
    subs.forEach(function(h3){
      var a = document.createElement('a');
      a.href = '#' + h3.id;
      a.textContent = h3.firstChild.textContent.trim();
      box.appendChild(a);
    });
    link.parentNode.insertBefore(box, link.nextSibling);
    link._sub = box;
  });
  var subLinks = [].slice.call(document.querySelectorAll('.subnav a'));

  /* ---------- índice de búsqueda ---------- */
  /* el texto crudo pegaba las celdas sin espacio y arrastraba el fuente de
     los diagramas mermaid; se limpia sobre un clon antes de indexar */
  function textOf(el){
    if(el.classList && el.classList.contains('mermaid')) return '';
    var c = el.cloneNode(true);
    c.querySelectorAll && c.querySelectorAll('.mermaid, .anchor, .copy').forEach(function(x){ x.remove(); });
    c.querySelectorAll && c.querySelectorAll('td, th, li, p, dt, dd, h4').forEach(function(x){
      x.appendChild(document.createTextNode(' '));
    });
    return (c.textContent || '').replace(/\s+/g, ' ').trim();
  }

  var idx = [];
  main.querySelectorAll('h2[id]').forEach(function(h2){
    var title = h2.firstChild.textContent.trim();
    var n = h2.nextElementSibling, cur = null;
    function push(o){ if(o) idx.push(o); }
    cur = {id:h2.id, title:title, parent:'', text:''};
    var buf = [];
    while(n && n.tagName !== 'H2'){
      if(n.tagName === 'H3'){
        cur.text = buf.join(' '); push(cur); buf = [];
        cur = {id:n.id, title:n.firstChild.textContent.trim(), parent:title, text:''};
      } else {
        buf.push(textOf(n));
      }
      n = n.nextElementSibling;
    }
    cur.text = buf.join(' '); push(cur);
  });
  idx.forEach(function(e){ e._t = norm(e.title); e._x = norm(e.text); });

  /* ---------- superposición de búsqueda ---------- */
  var overlay = document.getElementById('searchOverlay');
  var input   = document.getElementById('searchInput');
  var results = document.getElementById('searchResults');
  var sel = 0, hits = [];

  function snippet(text, q){
    var i = norm(text).indexOf(q);
    if(i < 0) return text.slice(0,120);
    var a = Math.max(0, i - 34);
    return (a ? '…' : '') + text.slice(a, a + 130);
  }
  function mark(t, q){
    var i = norm(t).indexOf(q);
    if(i < 0 || !q) return t;
    return t.slice(0,i) + '<mark>' + t.slice(i, i+q.length) + '</mark>' + t.slice(i+q.length);
  }
  function render(){
    var q = norm(input.value.trim());
    results.innerHTML = '';
    if(!q){
      hits = idx.slice(0, 8);
    } else {
      hits = idx.map(function(e){
        var ti = e._t.indexOf(q), xi = e._x.indexOf(q);
        if(ti < 0 && xi < 0) return null;
        return {e:e, score: ti === 0 ? 0 : ti > 0 ? 1 : 2};
      }).filter(Boolean)
        .sort(function(a,b){ return a.score - b.score; })
        .slice(0, 24).map(function(r){ return r.e; });
    }
    if(!hits.length){
      results.innerHTML = '<div class="empty">Sin resultados</div>';
      return;
    }
    sel = 0;
    hits.forEach(function(e, i){
      var a = document.createElement('a');
      a.className = 'hit' + (i === 0 ? ' sel' : '');
      a.setAttribute('role','option');
      a.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
      a.href = '#' + e.id;
      a.innerHTML = (e.parent ? '<span class="p">' + e.parent + '</span>' : '') +
                    '<span class="t">' + mark(e.title, q) + '</span>' +
                    (q && e._x.indexOf(q) >= 0 ? '<span class="s">' + mark(snippet(e.text, q), q) + '</span>' : '');
      a.addEventListener('click', close);
      results.appendChild(a);
    });
  }
  function move(d){
    var els = results.querySelectorAll('.hit');
    if(!els.length) return;
    els[sel].classList.remove('sel'); els[sel].setAttribute('aria-selected','false');
    sel = (sel + d + els.length) % els.length;
    els[sel].classList.add('sel'); els[sel].setAttribute('aria-selected','true');
    els[sel].scrollIntoView({block:'nearest'});
  }
  var lastFocus = null;
  function open(){
    lastFocus = document.activeElement;
    overlay.classList.add('open'); input.value = ''; render(); input.focus();
  }
  function close(){
    overlay.classList.remove('open');
    if(lastFocus && lastFocus.focus) lastFocus.focus();   /* devolver el foco al origen */
  }

  document.getElementById('searchBtn').addEventListener('click', open);
  var sbm = document.getElementById('searchBtnM');
  if(sbm) sbm.addEventListener('click', open);
  input.addEventListener('input', render);
  overlay.addEventListener('click', function(e){ if(e.target === overlay) close(); });
  document.addEventListener('keydown', function(e){
    var typing = /^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName);
    if(!overlay.classList.contains('open')){
      if((e.key === '/' && !typing) || ((e.metaKey || e.ctrlKey) && e.key === 'k')){
        e.preventDefault(); open();
      }
      return;
    }
    if(e.key === 'Escape'){ close(); }
    else if(e.key === 'ArrowDown'){ e.preventDefault(); move(1); }
    else if(e.key === 'ArrowUp'){ e.preventDefault(); move(-1); }
    /* el foco no se escapa detrás del modal: Tab recorre los resultados */
    else if(e.key === 'Tab'){ e.preventDefault(); move(e.shiftKey ? -1 : 1); input.focus(); }
    else if(e.key === 'Enter'){
      e.preventDefault();
      var el = results.querySelector('.hit.sel');
      if(el){ location.hash = el.getAttribute('href'); close(); }
    }
  });

  /* ---------- copiar bloques de código ---------- */
  main.querySelectorAll('pre').forEach(function(pre){
    var wrap = document.createElement('div');
    wrap.className = 'codeblock';
    pre.parentNode.insertBefore(wrap, pre);
    wrap.appendChild(pre);
    var b = document.createElement('button');
    b.className = 'copy'; b.textContent = 'copiar';
    b.addEventListener('click', function(){
      navigator.clipboard.writeText(pre.textContent).then(function(){
        b.textContent = 'copiado'; b.classList.add('done');
        setTimeout(function(){ b.textContent = 'copiar'; b.classList.remove('done'); }, 1400);
      });
    });
    wrap.appendChild(b);
  });

  /* ---------- etiquetar celdas para el modo tarjeta en móvil ---------- */
  main.querySelectorAll('table').forEach(function(t){
    var hs = [].map.call(t.querySelectorAll('thead th'), function(th){
      return th.textContent.trim();
    });
    if(!hs.length) return;
    t.querySelectorAll('tbody tr').forEach(function(tr){
      [].forEach.call(tr.children, function(td, i){
        if(hs[i]) td.setAttribute('data-label', hs[i]);
      });
    });
  });

  /* ---------- aviso de scroll en tablas ---------- */
  function tables(){
    main.querySelectorAll('.tblwrap').forEach(function(t){
      t.classList.toggle('scrollable', t.scrollWidth > t.clientWidth + 4);
      t.onscroll = function(){
        t.classList.toggle('scrolled-end', t.scrollLeft + t.clientWidth >= t.scrollWidth - 4);
      };
    });
  }
  tables();
  window.addEventListener('resize', function(){
    tables();
    /* al cambiar el ancho, la altura de los sub-índices cambia: recalcular */
    navLinks.forEach(function(a){ if(a._sub) a._sub._open = null; });
    lastId = null; spy();
  });

  /* ---------- scrollspy ---------- */
  var heads = [].slice.call(main.querySelectorAll('h2[id], h3[id]'));
  var byId = {};
  navLinks.concat(subLinks).forEach(function(a){ byId[a.getAttribute('href').slice(1)] = a; });

  var lastId = null, userTouchedAside = 0;
  aside.addEventListener('wheel',      function(){ userTouchedAside = Date.now(); }, {passive:true});
  aside.addEventListener('touchstart', function(){ userTouchedAside = Date.now(); }, {passive:true});
  aside.addEventListener('mouseenter', function(){ userTouchedAside = Date.now(); });

  function spy(){
    var y = window.scrollY + 130, cur = null;
    for(var i = 0; i < heads.length; i++){
      if(heads[i].getBoundingClientRect().top + window.scrollY <= y) cur = heads[i]; else break;
    }
    if(!cur) cur = heads[0];
    if(!cur || cur.id === lastId) return;   /* solo trabaja cuando cambia de verdad */
    lastId = cur.id;

    var link = byId[cur.id];
    navLinks.concat(subLinks).forEach(function(a){
      a.classList.remove('active'); a.removeAttribute('aria-current');
    });
    if(link){ link.classList.add('active'); link.setAttribute('aria-current','true'); }

    /* la sección padre queda marcada y su sub-navegación se abre */
    var parentLink = link;
    if(link && link.parentNode.classList.contains('subnav')){
      parentLink = link.parentNode.previousElementSibling;
      if(parentLink) parentLink.classList.add('active');
    }
    navLinks.forEach(function(a){
      if(!a._sub) return;
      var open = (a === parentLink);
      if(open === a._sub._open) return;
      a._sub._open = open;
      a._sub.style.maxHeight = open ? a._sub.scrollHeight + 'px' : '0px';
      a._sub.classList.toggle('open', open);
    });

    /* mantener visible el ítem activo; nunca mientras el usuario toca la barra */
    if(link && window.innerWidth > 900 && Date.now() - userTouchedAside > 1200){
      var top = link.offsetTop, h = aside.clientHeight;
      if(top < aside.scrollTop + 70 || top > aside.scrollTop + h - 90){
        var want = Math.max(0, Math.min(top - h / 2, aside.scrollHeight - h));
        if(Math.abs(want - aside.scrollTop) > 8) aside.scrollTo({top: want, behavior: 'smooth'});
      }
    }
  }

  /* ---------- progreso, volver arriba ---------- */
  var bar = document.getElementById('progress');
  var top = document.getElementById('toTop');
  function onScroll(){
    var h = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + '%';
    top.classList.toggle('show', window.scrollY > 700);
    spy();
  }
  var tick = false;
  window.addEventListener('scroll', function(){
    if(tick) return;
    tick = true;
    requestAnimationFrame(function(){ onScroll(); tick = false; });
  }, {passive:true});
  top.addEventListener('click', function(){ window.scrollTo({top:0,behavior:'smooth'}); });

  /* ---------- navegación en móvil ---------- */
  var menu = document.getElementById('menuBtn'), scrim = document.getElementById('scrim');
  function drawer(v){ aside.classList.toggle('open', v); scrim.classList.toggle('open', v); }
  menu.addEventListener('click', function(){ drawer(!aside.classList.contains('open')); });
  scrim.addEventListener('click', function(){ drawer(false); });
  aside.addEventListener('click', function(e){ if(e.target.tagName === 'A') drawer(false); });

  onScroll();
})();
