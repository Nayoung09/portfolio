/* 권나영 포트폴리오 공용 스크립트 */

/* ===== 방문 및 클릭 기록 (Google 스프레드시트) ===== */
var LOG_URL = 'https://script.google.com/macros/s/AKfycbzwsMRWniML65jmMjBWT5RRBcWmQO4HuXe6uwifXwtGyZuFevYff0E63KhtYtYiHv3G/exec';

(function(){
  var vid;
  try{ vid=localStorage.getItem('pf_vid'); if(!vid){ vid=Math.random().toString(36).slice(2,10); localStorage.setItem('pf_vid',vid); } }catch(e){ vid='no-storage'; }
  window.pfLog=function(event,label){
    if(!LOG_URL) return;
    var body=JSON.stringify({
      event:event, label:label||'', vid:vid,
      page:location.pathname, ref:document.referrer||'(직접 입력)',
      device:/Mobi|Android|iPhone/i.test(navigator.userAgent)?'모바일':'PC'
    });
    try{ fetch(LOG_URL,{method:'POST',mode:'no-cors',keepalive:true,headers:{'Content-Type':'text/plain;charset=utf-8'},body:body}).catch(function(){}); }catch(e){}
  };
  pfLog('visit', document.body.getAttribute('data-page') || document.title);
  document.addEventListener('click',function(e){
    var t=e.target.closest('[data-log]'); if(t) pfLog(t.getAttribute('data-log'), t.getAttribute('data-label') || t.textContent.replace(/\s+/g,' ').trim().slice(0,60));
  });
  // 어디까지 읽었는지: data-view 요소가 처음 화면에 들어올 때 한 번씩 기록
  if('IntersectionObserver' in window){
    var seen={};
    var io=new IntersectionObserver(function(en){ en.forEach(function(x){ var n=x.target.getAttribute('data-view'); if(x.isIntersecting&&!seen[n]){ seen[n]=1; pfLog('section_view',n); } }); },{threshold:0.25});
    document.querySelectorAll('[data-view]').forEach(function(el){ io.observe(el); });
  }
})();

/* ===== 상단 메뉴, 읽기 진행 바 ===== */
(function(){
  var gnb=document.querySelector('.gnb'), bar=document.querySelector('.reading-bar i');
  function sync(){
    if(gnb) gnb.classList.toggle('scrolled', window.scrollY>40);
    if(bar){ var h=document.documentElement.scrollHeight-innerHeight; bar.style.transform='scaleX('+(h>0?scrollY/h:0)+')'; }
  }
  addEventListener('scroll',sync,{passive:true}); sync();
})();

/* ===== 이메일 복사 ===== */
(function(){
  var toast=document.getElementById('toast'), timer;
  function show(msg){ if(!toast) return; toast.textContent=msg; toast.classList.add('show'); clearTimeout(timer); timer=setTimeout(function(){toast.classList.remove('show')},2000); }
  function fallback(text){ var t=document.createElement('textarea'); t.value=text; t.setAttribute('readonly',''); t.style.position='fixed'; t.style.opacity='0'; document.body.appendChild(t); t.select(); var ok=false; try{ ok=document.execCommand('copy'); }catch(e){} document.body.removeChild(t); return ok; }
  document.querySelectorAll('[data-mail]').forEach(function(btn){
    btn.addEventListener('click',function(){
      var mail=btn.getAttribute('data-mail');
      if(navigator.clipboard && window.isSecureContext){
        navigator.clipboard.writeText(mail).then(function(){show('메일이 복사되었습니다.')},function(){ show(fallback(mail)?'메일이 복사되었습니다.':mail); });
      } else { show(fallback(mail)?'메일이 복사되었습니다.':mail); }
    });
  });
})();

/* ===== 이미지 확대 ===== */
(function(){
  var lb=document.getElementById('lb'); if(!lb) return;
  var img=lb.querySelector('img');
  document.querySelectorAll('.zoom').forEach(function(b){
    b.addEventListener('click',function(){ var im=b.querySelector('img'); img.src=im.src; img.alt=im.alt; if(lb.showModal) lb.showModal(); else window.open(im.src); });
  });
  lb.querySelector('button').addEventListener('click',function(){lb.close()});
  lb.addEventListener('click',function(e){ if(e.target===lb) lb.close(); });
})();

/* ===== 오프닝 (홈 전용) ===== */
(function(){
  var root=document.documentElement, intro=document.getElementById('intro'); if(!intro) return;
  var tpl=intro.cloneNode(true), timers=[], raf, keyHandler;
  function fmt(v){ return Math.floor(v/60)+':'+('0'+v%60).slice(-2); }
  function clearAll(){ timers.forEach(clearTimeout); timers=[]; cancelAnimationFrame(raf); if(keyHandler) document.removeEventListener('keydown',keyHandler); }
  function play(){
    clearAll();
    var fresh=tpl.cloneNode(true); intro.replaceWith(fresh); intro=fresh;
    root.classList.add('intro-on');
    var tnum=intro.querySelector('#tnum'), rnum=intro.querySelector('#rnum');
    timers.push(setTimeout(function(){
      var start=performance.now(), dur=1800;
      (function tick(now){
        var k=Math.min(1,(now-start)/dur), e=1-Math.pow(1-k,3);
        tnum.textContent=fmt(Math.round(110-74*e));
        rnum.textContent='−'+(31.1*e).toFixed(1)+'%p';
        if(k<1){ raf=requestAnimationFrame(tick); } else { tnum.classList.add('done'); rnum.classList.add('done'); }
      })(start);
    },4500));
    intro.querySelectorAll('[data-close]').forEach(function(b){ b.addEventListener('click',close); });
    keyHandler=function(e){ if(e.key==='Escape'||e.key==='Enter'){ close(); } };
    document.addEventListener('keydown',keyHandler);
  }
  function close(){
    clearAll();
    try{ sessionStorage.setItem('introSeen','1'); }catch(e){}
    intro.classList.add('out');
    timers.push(setTimeout(function(){ root.classList.remove('intro-on'); intro.classList.remove('out'); window.scrollTo(0,0); },650));
  }
  if(/[?&]intro\b/.test(location.search)) root.classList.add('intro-on');
  if(root.classList.contains('intro-on')) play();
  var logo=document.querySelector('.logo[data-replay]');
  if(logo) logo.addEventListener('click',function(e){ e.preventDefault(); pfLog('intro_replay','로고'); play(); });
})();

/* ===== 커스텀 커서 ===== */
(function(){
  if(!matchMedia('(hover:hover) and (pointer:fine)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var c=document.createElement('div'); c.className='cursor'; c.setAttribute('aria-hidden','true'); c.innerHTML='<span>자세히 보기</span>'; document.body.appendChild(c);
  var x=-100,y=-100,cx=-100,cy=-100;
  var label=c.querySelector('span');
  function update(t){
    if(!t||!t.closest) return;
    var view=t.closest('.work,.next,.fm-head');
    c.classList.toggle('is-view',!!view);
    label.textContent = view && view.classList.contains('next') ? '다음 보기' : '자세히 보기';
    c.classList.toggle('is-link',!view && !!t.closest('a,button,summary,.zoom'));
    c.classList.toggle('on-dark-bg',!!t.closest('.dark-hero,.contact-band,.site-foot,.kv'));
  }
  addEventListener('mousemove',function(e){ x=e.clientX; y=e.clientY; c.classList.add('ready'); update(e.target); });
  addEventListener('scroll',function(){ if(x>=0) update(document.elementFromPoint(x,y)); },{passive:true});
  document.addEventListener('mouseleave',function(){ c.classList.remove('ready'); });
  (function loop(){ cx+=(x-cx)*.22; cy+=(y-cy)*.22; c.style.transform='translate3d('+cx+'px,'+cy+'px,0)'; requestAnimationFrame(loop); })();
})();

/* ===== 스크롤 등장, 숫자 올라가기 ===== */
(function(){
  if(!('IntersectionObserver' in window)){ document.querySelectorAll('[data-reveal]').forEach(function(el){el.classList.add('in')}); return; }
  var io=new IntersectionObserver(function(en){ en.forEach(function(x){ if(x.isIntersecting){ x.target.classList.add('in'); io.unobserve(x.target); } }); },{threshold:.15,rootMargin:'0px 0px -8% 0px'});
  document.querySelectorAll('[data-reveal]').forEach(function(el){ io.observe(el); });

  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  function run(el){
    var full=el.getAttribute('data-count'), m=full.match(/^([^0-9]*)([0-9]+(?:\.[0-9]+)?)(.*)$/);
    if(!m||reduce){ el.textContent=full; return; }
    var pre=m[1], target=parseFloat(m[2]), suf=m[3], dec=(m[2].split('.')[1]||'').length, start=performance.now(), dur=1400;
    (function tick(now){ var k=Math.min(1,(now-start)/dur), e=1-Math.pow(1-k,3);
      el.textContent=pre+(target*e).toFixed(dec)+suf; if(k<1) requestAnimationFrame(tick); else el.textContent=full; })(start);
  }
  var io2=new IntersectionObserver(function(en){ en.forEach(function(x){ if(x.isIntersecting){ run(x.target); io2.unobserve(x.target); } }); },{threshold:.6});
  document.querySelectorAll('[data-count]').forEach(function(el){ io2.observe(el); });
})();

/* ===== 상세 페이지 목차 현재 위치 ===== */
(function(){
  var links=document.querySelectorAll('.ch-nav a'); if(!links.length||!('IntersectionObserver' in window)) return;
  var io=new IntersectionObserver(function(en){ en.forEach(function(x){ if(x.isIntersecting){ links.forEach(function(a){ a.classList.toggle('on', a.getAttribute('href')==='#'+x.target.id); }); } }); },{rootMargin:'-40% 0px -55% 0px'});
  links.forEach(function(a){ var el=document.querySelector(a.getAttribute('href')); if(el) io.observe(el); });
})();
