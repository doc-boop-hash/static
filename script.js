(function(){
  "use strict";
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  try { gsap.registerPlugin(ScrollTrigger); } catch(e){}

  /* ---------- Preloader ---------- */
  var preNum = document.getElementById('preNum');
  var pct = 0;
  var preTimer = setInterval(function(){
    pct = Math.min(100, pct + (reduced ? 100 : Math.random()*18+6));
    preNum.textContent = 'LOADING REEL — ' + Math.floor(pct) + '%';
    if (pct >= 100){
      clearInterval(preTimer);
      finishPreloader();
    }
  }, reduced ? 10 : 160);

  function finishPreloader(){
    var pre = document.getElementById('preloader');
    setTimeout(function(){
      pre.classList.add('done');
      document.getElementById('hud').classList.add('show');
      runHeroIntro();
      setTimeout(function(){ pre.remove(); }, 700);
    }, reduced ? 0 : 260);
  }

  /* ---------- Hero intro ---------- */
  function runHeroIntro(){
    var lines = document.querySelectorAll('.hero__title em');
    if (window.gsap && !reduced){
      gsap.fromTo(lines, {yPercent:110}, {yPercent:0, duration:1.1, ease:'power4.out', stagger:0.12});
      gsap.from(['.hero__role','.hero__pillars','.hero__tag','.hero__scroll'], {opacity:0, y:16, duration:.9, stagger:.1, delay:.35, ease:'power2.out'});
      gsap.to('.hero__img', {opacity:1, y:0, scale:1, duration:1.3, ease:'power3.out', delay:.2});
    } else {
      var img = document.querySelector('.hero__img');
      if (img){ img.style.opacity = 1; img.style.transform = 'none'; }
    }
  }

  /* ---------- Scroll reveals (replay every time an element enters/leaves view) ---------- */
  var reveals = document.querySelectorAll('.reveal, .scene, .skillcat li, .role');
  if ('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        entry.target.classList.toggle('in', entry.isIntersecting);
      });
    }, {threshold:.2, rootMargin:'0px 0px -8% 0px'});
    reveals.forEach(function(el){ io.observe(el); });

    // stagger skill chips within each category
    document.querySelectorAll('.skillcat').forEach(function(cat){
      var items = cat.querySelectorAll('li');
      items.forEach(function(li, i){ li.style.transitionDelay = (i*70)+'ms'; });
    });

    // stagger profile meta lines
    document.querySelectorAll('.profile__meta').forEach(function(meta){
      var items = meta.querySelectorAll('div');
      items.forEach(function(div, i){ div.style.transitionDelay = (.5 + i*.12)+'s'; });
    });
  } else {
    reveals.forEach(function(el){ el.classList.add('in'); });
  }

  /* ---------- Profile quote typewriter (retypes every time it scrolls into view) ---------- */
  var pq = document.getElementById('profileQuote');
  var pqText = '"Senior Producer and writer with 8+ years across non-fiction, branded entertainment, documentary and original IP development, taking projects from idea and research through scripting, production and multi-platform delivery."';
  var pqRun = 0;
  function typeProfileQuote(){
    pq.classList.add('in');
    var run = ++pqRun;
    var i = 0;
    pq.innerHTML = '';
    var span = document.createElement('span');
    pq.appendChild(span);
    var cursor = document.createElement('span');
    cursor.className = 'practice__cursor';
    pq.appendChild(cursor);
    if (reduced){ span.textContent = pqText; cursor.remove(); return; }
    (function tick(){
      if (run !== pqRun) return;
      span.textContent = pqText.slice(0, i);
      i++;
      if (i <= pqText.length){
        requestAnimationFrame(function(){ setTimeout(tick, 18); });
      } else {
        cursor.remove();
      }
    })();
  }
  if (pq){
    if ('IntersectionObserver' in window){
      var ioQuote = new IntersectionObserver(function(entries){
        entries.forEach(function(e){
          if (e.isIntersecting){ typeProfileQuote(); }
          else { pq.classList.remove('in'); pqRun++; }
        });
      }, {threshold:.4});
      ioQuote.observe(pq);
    } else { typeProfileQuote(); }
  }

  /* ---------- Stat counters (recount every time they scroll into view) ---------- */
  function animateCount(el){
    var target = parseFloat(el.dataset.count);
    if (isNaN(target)) return;
    var dur = 1400;
    var leading = el.dataset.leading || '';
    var run = (el._countRun = (el._countRun||0) + 1);
    var t0 = null;
    function step(ts){
      if (run !== el._countRun) return;
      if (!t0) t0 = ts;
      var p = Math.min(1, (ts - t0) / dur);
      var eased = 1 - Math.pow(1-p, 3);
      var val = Math.floor(eased * target);
      el.childNodes[0].textContent = leading + val;
      if (p < 1) requestAnimationFrame(step);
    }
    if (reduced){ el.childNodes[0].textContent = leading + target; }
    else requestAnimationFrame(step);
  }
  var statEls = document.querySelectorAll('.stat__num[data-count]');
  if ('IntersectionObserver' in window){
    var ioStat = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if (e.isIntersecting){ animateCount(e.target); }
        else { e.target._countRun = (e.target._countRun||0) + 1; e.target.childNodes[0].textContent = (e.target.dataset.leading||'') + '0'; }
      });
    }, {threshold:.5});
    statEls.forEach(function(el){
      el.insertBefore(document.createTextNode('0'), el.firstChild);
      ioStat.observe(el);
    });
  }

  /* ---------- Timeline fill ---------- */
  if (window.gsap && window.ScrollTrigger){
    gsap.to('#timelineFill', {
      height:'100%', ease:'none',
      scrollTrigger:{ trigger:'#experience', start:'top 70%', end:'bottom 85%', scrub:true }
    });
  }

  /* ---------- Awards marquee ---------- */
  var awards = [
    {name:'Asian Academy Creative Awards 2025', tag:'National Winner — Best Branded Programme', proj:'Maidaan Saaf'},
    {name:'Asian Academy Creative Awards 2025', tag:'National Winner — Best Lifestyle Programme', proj:'Roots of My Platter S3'},
    {name:'SCREENXX + Indian Marketing Awards', tag:'Gold', proj:'Vivo Imagine'},
    {name:'Indian Telly Streaming Awards', tag:'Best Indian Documentary', proj:'Plastic Fantastic'}
  ];
  var track = document.getElementById('marqueeTrack');
  function buildMarquee(list){
    return list.map(function(a){
      return '<span class="marquee__item">'+a.name+' <small>'+a.tag+'</small><span class="sep">·</span>'+a.proj+'</span>';
    }).join('');
  }
  track.innerHTML = buildMarquee(awards) + buildMarquee(awards);

  /* ---------- Typewriter (retypes every time it scrolls into view) ---------- */
  var tw = document.getElementById('typewriter');
  var fullText = 'I write the way I produce — chasing a true line, then cutting until only that line remains.';
  var twRun = 0;
  function typeIt(){
    var run = ++twRun;
    var i = 0;
    tw.innerHTML = '';
    var span = document.createElement('span');
    tw.appendChild(span);
    var cursor = document.createElement('span');
    cursor.className = 'practice__cursor';
    tw.appendChild(cursor);
    if (reduced){ span.textContent = fullText; return; }
    (function tick(){
      if (run !== twRun) return;
      span.textContent = fullText.slice(0, i);
      i++;
      if (i <= fullText.length) requestAnimationFrame(function(){ setTimeout(tick, 26); });
    })();
  }
  if ('IntersectionObserver' in window){
    var ioType = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if (e.isIntersecting){ typeIt(); }
        else { twRun++; }
      });
    }, {threshold:.6});
    ioType.observe(tw);
  } else { typeIt(); }

  /* ---------- Copy buttons ---------- */
  document.querySelectorAll('[data-copy]').forEach(function(btn){
    btn.addEventListener('click', function(){
      var val = btn.getAttribute('data-copy');
      var done = function(){ var old = btn.textContent; btn.textContent='COPIED'; setTimeout(function(){ btn.textContent = old; }, 1400); };
      if (navigator.clipboard && navigator.clipboard.writeText){
        navigator.clipboard.writeText(val).then(done).catch(function(){
          var r = document.createRange(); r.selectNode(btn.parentElement);
          window.getSelection().removeAllRanges(); window.getSelection().addRange(r);
          done();
        });
      }
    });
  });

  /* ---------- HUD timecode ---------- */
  var hudTime = document.getElementById('hudTime');
  var startT = Date.now();
  function pad(n){ return (n<10?'0':'')+n; }
  function tickHud(){
    var s = Math.floor((Date.now()-startT)/1000);
    var h = pad(Math.floor(s/3600)), m = pad(Math.floor((s%3600)/60)), sec = pad(s%60);
    hudTime.textContent = 'REC ' + h + ':' + m + ':' + sec;
    if (!reduced) requestAnimationFrame(tickHud);
  }
  tickHud();

  /* ---------- Desktop-only chrome: custom cursor, grain, tilt ---------- */
  if (fine){
    var cursor = document.getElementById('cursor');
    var cx=0, cy=0, mx=0, my=0;
    window.addEventListener('pointermove', function(e){ mx=e.clientX; my=e.clientY; });
    (function loop(){ cx += (mx-cx)*.2; cy += (my-cy)*.2; cursor.style.transform='translate('+cx+'px,'+cy+'px)'; requestAnimationFrame(loop); })();
    document.querySelectorAll('a, button, .card, [data-magnet]').forEach(function(el){
      el.addEventListener('pointerenter', function(){ cursor.classList.add('hover'); });
      el.addEventListener('pointerleave', function(){ cursor.classList.remove('hover'); });
    });

    document.querySelectorAll('[data-tilt]').forEach(function(card){
      card.addEventListener('pointermove', function(e){
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left)/r.width - .5, py = (e.clientY - r.top)/r.height - .5;
        card.style.transform = 'rotateX('+(py*-7)+'deg) rotateY('+(px*7)+'deg) translateZ(0)';
      });
      card.addEventListener('pointerleave', function(){ card.style.transform=''; });
    });
  }

  /* film grain */
  var canvas = document.getElementById('grain');
  var ctx = canvas.getContext('2d');
  function sizeCanvas(){ canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
  sizeCanvas();
  window.addEventListener('resize', sizeCanvas);
  function drawGrain(){
    var w = canvas.width, h = canvas.height;
    var idata = ctx.createImageData(w, h);
    var buffer = new Uint32Array(idata.data.buffer);
    for (var i=0;i<buffer.length;i++){
      var v = (Math.random()*255)|0;
      buffer[i] = (20<<24) | (v<<16) | (v<<8) | v;
    }
    ctx.putImageData(idata, 0, 0);
  }
  drawGrain();
  if (!reduced){
    setInterval(drawGrain, 110);
  }

})();
