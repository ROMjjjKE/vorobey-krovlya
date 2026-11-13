
(function(){
  'use strict';
  /* ---------- меню ---------- */
  var drawer=document.getElementById('drawer');
  var burger=document.querySelector('.burger');
  var closeBtn=drawer?drawer.querySelector('.drawer__close'):null;
  var lastFocus=null;
  function openD(){ if(!drawer) return; lastFocus=document.activeElement; drawer.hidden=false; drawer.classList.add('is-open');
    document.body.classList.add('is-locked'); document.body.style.overflow='hidden';
    if(burger) burger.setAttribute('aria-expanded','true'); if(closeBtn) closeBtn.focus(); }
  function closeD(){ if(!drawer) return; drawer.classList.remove('is-open'); drawer.hidden=true;
    document.body.classList.remove('is-locked'); document.body.style.overflow='';
    if(burger) burger.setAttribute('aria-expanded','false'); if(lastFocus) lastFocus.focus(); }
  if(burger) burger.addEventListener('click',openD);
  if(closeBtn) closeBtn.addEventListener('click',closeD);
  if(drawer){
    drawer.addEventListener('click',function(e){ if(e.target===drawer) closeD(); });
    drawer.querySelectorAll('a').forEach(function(a){ a.addEventListener('click',closeD); });
  }
  document.addEventListener('keydown',function(e){
    if(!drawer||!drawer.classList.contains('is-open')) return;
    if(e.key==='Escape'){ closeD(); return; }
    if(e.key==='Tab'){ var f=drawer.querySelectorAll('a,button'); if(!f.length) return;
      var first=f[0], last=f[f.length-1];
      if(e.shiftKey&&document.activeElement===first){ e.preventDefault(); last.focus(); }
      else if(!e.shiftKey&&document.activeElement===last){ e.preventDefault(); first.focus(); } }
  });
  window.addEventListener('resize',function(){ if(window.innerWidth>1080&&drawer&&drawer.classList.contains('is-open')) closeD(); });

  function num(id,def){ var el=document.getElementById(id); if(!el) return def; var v=parseFloat(String(el.value).replace(',','.')); return isFinite(v)?v:def; }
  function money(n){ return Math.round(n).toLocaleString('ru-RU').replace(/\u00A0/g,' '); }
  function dec(n,d){ return n.toFixed(d).replace('.',','); }

  /* ---------- конфигуратор кровли ---------- */
  var roof={ type:'dvu', material:'mc' };
  var MAT={ mc:{name:'Металлочерепица',f:['лист','листа','листов'],per:3.9,waste:1.12},
            pr:{name:'Профнастил',f:['лист','листа','листов'],per:2.3,waste:1.10},
            gc:{name:'Гибкая черепица',f:['упаковка','упаковки','упаковок'],per:3.0,waste:1.08},
            fz:{name:'Фальцевая кровля',f:['м² картины','м² картин','м² картин'],per:1,waste:1.06} };

  function roofCalc(){
    var L=num('r-l',10), W=num('r-w',8), a=num('r-a',30), ov=num('r-ov',0.5);
    var rad=a*Math.PI/180, c=Math.cos(rad), P=2*(L+2*ov)+2*(W+2*ov);
    var area=0, ridge=0, eaves=0, hip=0;
    if(roof.type==='dvu'){ var slope=(W/2+ov)/c; area=2*slope*(L+2*ov); ridge=L+2*ov; eaves=2*(L+2*ov); }
    else if(roof.type==='odno'){ area=((W+2*ov)/c)*(L+2*ov); ridge=0; eaves=2*(L+2*ov); }
    else if(roof.type==='valma'){ area=((L+2*ov)*(W+2*ov)/c)*1.02; ridge=Math.abs(L-W); eaves=P; hip=2*Math.sqrt(Math.pow(W/2,2)+Math.pow((W/2)/c,2)); }
    else { area=((L+2*ov)*(W+2*ov)/c)*1.16; ridge=L+2*ov; eaves=P; }
    var mat=MAT[roof.material], qty=Math.ceil(area*mat.waste/mat.per);
    var screws=Math.ceil(area*8), ins=Math.ceil(area*1.05), film=Math.ceil(area*2.1);
    var plural=function(n,a,b,c){ var n10=n%10,n100=n%100; if(n10===1&&n100!==11) return a; if(n10>=2&&n10<=4&&(n100<12||n100>14)) return b; return c; };
    var e=function(id,v){ var el=document.getElementById(id); if(el) el.textContent=v; };
    e('r-area',dec(area,1)+' м²'); e('r-qty', qty + ' ' + plural(qty, mat.f[0], mat.f[1], mat.f[2]));
    e('r-ridge',ridge>0?dec(ridge,1)+' м':'—'); e('r-eaves',dec(eaves,1)+' м');
    e('r-screws',screws+' шт'); e('r-ins',ins+' м²'); e('r-film',film+' м²');
    var t=document.getElementById('r-type');
    if(t){ var names={dvu:'Двускатная',odno:'Односкатная',valma:'Вальмовая',mans:'Мансардная ломаная'};
      t.textContent=names[roof.type]+' · '+dec(L,1)+'×'+dec(W,1)+' м · '+a+'°'; }
    var sum=document.getElementById('r-sum');
    if(sum){ sum.textContent='≈ '+dec(area,1)+' м²'; }
    drawRoof(L,W,a,ov);
  }

  function drawRoof(L,W,a,ov){
    var svg=document.getElementById('r-svg'); if(!svg) return;
    var box={w:340,h:200}, pad=26;
    var maxW=Math.max(W,L), scale=(box.w-2*pad)/Math.max(maxW,6);
    var wpx=W*scale, wallH=0.35*wpx;
    var eaveY=box.h-42, apexY=eaveY-wallH*0.62-Math.max(18,Math.min(78,Math.tan(a*Math.PI/180)*(wpx/2)*0.9));
    var cx=box.w/2, left=cx-wpx/2-ov*scale, right=cx+wpx/2+ov*scale;
    var wallL=cx-wpx/2, wallR=cx+wpx/2, wallTop=eaveY-wallH*0.62;
    var s='';
    s+='<line x1="10" y1="'+(eaveY+14)+'" x2="330" y2="'+(eaveY+14)+'" stroke="#0E6B4F" stroke-width="1.4"/>';
    s+='<rect x="'+wallL+'" y="'+wallTop+'" width="'+(wpx)+'" height="'+(eaveY-wallTop)+'" fill="#fff" stroke="#12181A" stroke-width="1.4"/>';
    if(roof.type==='odno'){
      s+='<path d="M'+left+' '+(eaveY-6)+' L'+right+' '+(apexY)+' L'+right+' '+(apexY+7)+' L'+left+' '+(eaveY+1)+' Z" fill="#CFE7DA" stroke="#0E6B4F" stroke-width="1.8"/>';
    } else if(roof.type==='valma'||roof.type==='mans'){
      s+='<path d="M'+left+' '+(eaveY-4)+' L'+cx+' '+(apexY)+' L'+right+' '+(eaveY-4)+'" fill="none" stroke="#0E6B4F" stroke-width="1.8"/>';
      s+='<path d="M'+left+' '+(eaveY-4)+' L'+cx+' '+(apexY)+' L'+right+' '+(eaveY-4)+' L'+(right)+' '+(eaveY+2)+' L'+cx+' '+(apexY+7)+' L'+left+' '+(eaveY+2)+' Z" fill="#CFE7DA" stroke="#0E6B4F" stroke-width="1.6"/>';
    } else {
      s+='<path d="M'+left+' '+(eaveY-4)+' L'+cx+' '+(apexY)+' L'+right+' '+(eaveY-4)+' L'+right+' '+(eaveY+2)+' L'+cx+' '+(apexY+7)+' L'+left+' '+(eaveY+2)+' Z" fill="#CFE7DA" stroke="#0E6B4F" stroke-width="1.8"/>';
      s+='<line x1="'+cx+'" y1="'+(apexY)+'" x2="'+cx+'" y2="'+eaveY+'" stroke="#0E6B4F" stroke-width="1" stroke-dasharray="3 3"/>';
    }
    s+='<line x1="'+wallL+'" y1="'+(eaveY+22)+'" x2="'+wallR+'" y2="'+(eaveY+22)+'" stroke="#12181A" stroke-width="1"/>';
    s+='<line x1="'+wallL+'" y1="'+(eaveY+18)+'" x2="'+wallL+'" y2="'+(eaveY+26)+'" stroke="#12181A" stroke-width="1"/>';
    s+='<line x1="'+wallR+'" y1="'+(eaveY+18)+'" x2="'+wallR+'" y2="'+(eaveY+26)+'" stroke="#12181A" stroke-width="1"/>';
    s+='<text x="'+cx+'" y="'+(eaveY+38)+'" text-anchor="middle" font-family="JetBrains Mono,monospace" font-size="10" fill="#48534D">'+dec(W,1)+' м</text>';
    s+='<text x="'+(right+8)+'" y="'+((apexY+eaveY)/2)+'" font-family="JetBrains Mono,monospace" font-size="10" fill="#0E6B4F">'+a+'°</text>';
    s+='<text x="12" y="20" font-family="JetBrains Mono,monospace" font-size="9" fill="#6B756F">СХЕМА · НЕ 3D-ВИЗУАЛИЗАЦИЯ</text>';
    svg.setAttribute('viewBox','0 0 340 200');
    svg.innerHTML=s;
  }

  document.querySelectorAll('.tab[data-roof]').forEach(function(b){
    b.addEventListener('click',function(){
      document.querySelectorAll('.tab[data-roof]').forEach(function(x){ x.setAttribute('aria-selected','false'); });
      b.setAttribute('aria-selected','true'); roof.type=b.getAttribute('data-roof'); roofCalc();
    });
  });
  var rmat=document.getElementById('r-mat-sel');
  if(rmat){ rmat.addEventListener('change',function(){ roof.material=rmat.value; roofCalc(); }); }
  ['r-l','r-w','r-a','r-ov'].forEach(function(id){
    var el=document.getElementById(id);
    if(el){ el.addEventListener('input',roofCalc); el.addEventListener('change',roofCalc); }
  });
  if(document.getElementById('r-svg')) roofCalc();

  /* ---------- калькулятор террасы ---------- */
  function terrCalc(){
    if(!document.getElementById('t-area')) return;
    var L=num('t-l',4), W=num('t-w',3), step=num('t-step',0.4);
    var kind=(document.getElementById('t-deck')||{}).value||'dpk';
    var area=L*W;
    var covers={dpk:{n:'ДПК',per:0.15*3},board:{n:'Террасная доска',per:0.14*4},tile:{n:'Плитка 60×60',per:0.36}};
    var k=covers[kind]||covers.dpk;
    var boards=Math.ceil(area*1.1/k.per);
    var lags=(Math.floor(W/step)+1)*L;
    var perimeter=2*(L+W);
    var posts=Math.ceil(perimeter/2);
    var railing=Math.ceil(perimeter);
    var e=function(id,v){ var el=document.getElementById(id); if(el) el.textContent=v; };
    e('t-area',dec(area,1)+' м²'); e('t-deck-n',k.n); e('t-boards',boards+' шт');
    e('t-lags',dec(lags,1)+' м.п.'); e('t-posts',posts+' шт'); e('t-rail',railing+' м.п.');
    var svg=document.getElementById('t-svg');
    if(svg){ var sc=Math.min(260/Math.max(L,1),150/Math.max(W,1)); var w=L*sc, h=W*sc;
      svg.setAttribute('viewBox','0 0 340 200');
      svg.innerHTML='<rect x="'+(170-w/2)+'" y="'+(100-h/2)+'" width="'+w+'" height="'+h+'" fill="#CFE7DA" stroke="#0E6B4F" stroke-width="1.8"/>'
        +'<rect x="'+(170-w/2-6)+'" y="'+(100-h/2-6)+'" width="'+(w+12)+'" height="'+(h+12)+'" fill="none" stroke="#12181A" stroke-width="1" stroke-dasharray="4 3"/>'
        +'<text x="170" y="190" text-anchor="middle" font-family="JetBrains Mono,monospace" font-size="10" fill="#48534D">'+dec(L,1)+' × '+dec(W,1)+' м · шаг лаг '+step+' м</text>'; }
  }
  ['t-l','t-w','t-step'].forEach(function(id){ var el=document.getElementById(id); if(el){ el.addEventListener('input',terrCalc); el.addEventListener('change',terrCalc); } });
  var td=document.getElementById('t-deck'); if(td) td.addEventListener('change',terrCalc);
  if(document.getElementById('t-area')) terrCalc();

  /* ---------- рассрочка ---------- */
  function instCalc(){
    if(!document.getElementById('i-sum-out')) return;
    var s=num('i-sum',8000), m=parseInt((document.getElementById('i-months')||{}).value||12,10);
    var pay=s/m;
    var e=function(id,v){ var el=document.getElementById(id); if(el) el.textContent=v; };
    e('i-sum-out',money(s)+' BYN'); e('i-pay',money(pay)+' BYN / мес');
    e('i-months-out',m+' мес'); e('i-first',money(pay)+' BYN');
  }
  ['i-sum','i-months'].forEach(function(id){ var el=document.getElementById(id); if(el){ el.addEventListener('input',instCalc); el.addEventListener('change',instCalc); } });
  if(document.getElementById('i-sum-out')) instCalc();

  /* ---------- формы в WhatsApp ---------- */
  document.querySelectorAll('form[data-wa]').forEach(function(f){
    f.addEventListener('submit',function(ev){
      ev.preventDefault();
      var d=new FormData(f), parts=[];
      var names={name:'Имя',phone:'Телефон',task:'Задача',msg:'Комментарий'};
      d.forEach(function(v,k){ if(String(v).trim()) parts.push((names[k]||k)+': '+String(v).trim()); });
      var txt='Заявка с сайта Воробей — кровля и террасы'+'%0A'+parts.join('%0A');
      var msg=f.querySelector('.form__msg');
      if(msg){ msg.textContent='Открываем WhatsApp с готовым сообщением…'; }
      window.open('https://wa.me/375298922178?text='+encodeURIComponent(txt).replace(/%20/g,'%20'),'_blank');
    });
  });
})();
