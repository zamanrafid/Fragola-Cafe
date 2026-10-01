// Fragola Cafe v2 — premium interactions, mobile-first
(function(){
"use strict";
const $=s=>document.querySelector(s), $$=s=>document.querySelectorAll(s);

/* Preloader */
window.addEventListener('load',()=>setTimeout(()=>$('#preloader').classList.add('hide'),600));
setTimeout(()=>$('#preloader').classList.add('hide'),2500); // fallback

/* Progress bar + toTop — rAF throttled (no shake/jank) */
const prog=$('#progress'),toTopBtn=$('#toTop');
let ticking=false;
function onScroll(){
  const h=document.documentElement;
  const max=h.scrollHeight-h.clientHeight;
  const p=max>0?h.scrollTop/max:0;
  prog.style.transform='scaleX('+p+')';
  toTopBtn.classList.toggle('show',h.scrollTop>600||window.scrollY>600);
  ticking=false;
}
addEventListener('scroll',()=>{if(!ticking){ticking=true;requestAnimationFrame(onScroll)}},{passive:true});
onScroll();
toTopBtn.addEventListener('click',()=>scrollTo({top:0,behavior:'smooth'}));

/* Theme (dark/light) */
const themeBtn=$('#themeBtn');
const saved=localStorage.getItem('fragola-theme');
if(saved)document.documentElement.dataset.theme=saved;
syncIcon();
themeBtn.addEventListener('click',()=>{
  const cur=document.documentElement.dataset.theme==='dark'?'light':'dark';
  document.documentElement.dataset.theme=cur;localStorage.setItem('fragola-theme',cur);syncIcon();
});
function syncIcon(){themeBtn.textContent=document.documentElement.dataset.theme==='dark'?'☀️':'🌙'}

/* Nav */
const nav=$('#navMenu'),burger=$('#hamburger');
burger.addEventListener('click',()=>{
  const o=nav.classList.toggle('open');burger.classList.toggle('open',o);
  burger.setAttribute('aria-expanded',o);
});
nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');burger.classList.remove('open');closeDrawer();}));
// active link on scroll
const secs=['home','about','services','menu','offers','gallery','team','faq','visit','reserve'];
const links=[...nav.querySelectorAll('.nav-link')];
const io2=new IntersectionObserver(es=>es.forEach(e=>{
  if(e.isIntersecting){links.forEach(l=>l.classList.toggle('active',l.getAttribute('href')==='#'+e.target.id))}
}),{rootMargin:'-40% 0px -55% 0px'});
secs.forEach(id=>{const el=document.getElementById(id);if(el)io2.observe(el)});

/* Typing effect */
const words=['Strawberry Cloud Latte','Fresh Tiramisu','Buttery Croissants','100% Arabica','Weekend Brunch'];
let wi=0,ci=0,del=false;const typ=$('#typing');
(function type(){
  const w=words[wi];
  typ.textContent=w.slice(0,ci);
  if(!del){ci++;if(ci>w.length){del=true;return setTimeout(type,1400)}}
  else{ci--;if(ci===0){del=false;wi=(wi+1)%words.length}}
  setTimeout(type,del?35:70);
})();

/* Counters */
const cio=new IntersectionObserver(es=>es.forEach(e=>{
  if(!e.isIntersecting)return;cio.unobserve(e.target);
  const el=e.target,end=+el.dataset.count;let s=0;
  const t=setInterval(()=>{s+=Math.max(1,Math.ceil(end/40));if(s>=end){s=end;clearInterval(t)}el.textContent=s},50);
}),{threshold:.5});
$$('.count').forEach(el=>cio.observe(el));

/* Tabs + Search */
const tabs=$$('.tab');
tabs.forEach(t=>t.addEventListener('click',()=>activate(t)));
function activate(t){
  tabs.forEach(x=>x.classList.remove('active'));t.classList.add('active');
  $$('.menu-panel').forEach(p=>p.classList.remove('active'));
  $('#panel-'+t.dataset.tab).classList.add('active');
  filter($('#menuSearch').value);
}
$('#menuSearch').addEventListener('input',e=>filter(e.target.value));
function filter(q){
  q=(q||'').toLowerCase().trim();let found=0;
  $$('.menu-item').forEach(it=>{
    const hit=!q||it.dataset.name.includes(q);
    it.style.display=hit?'':'none';if(hit)found++;
  });
  $('#noResult').style.display=found?'none':'block';
  // if searching, show all panels
  $$('.menu-panel').forEach(p=>{
    if(!q){p.classList.toggle('active',p.id==='panel-'+($('.tab.active').dataset.tab))}
    else{const any=[...p.querySelectorAll('.menu-item')].some(i=>i.style.display!=='none');p.classList.toggle('active',any)}
  });
}

/* Cart + Drawer */
let cart=JSON.parse(localStorage.getItem('fragola-cart')||'[]');
const drawer=$('#cartDrawer'),bg=$('#drawerBg');
function save(){localStorage.setItem('fragola-cart',JSON.stringify(cart))}
function totals(){return cart.reduce((s,i)=>s+i.price,0)}
function render(){
  const box=$('#cartList'),box2=$('#cartList2');
  const label=`(${cart.length})`;
  $('#cartCount').textContent=label;$('#cartCount2').textContent=label;$('#cartCountMini').textContent=cart.length;
  const t='$'+totals().toFixed(2);
  $('#cartTotal').textContent=t;$('#cartTotal2').textContent=t;
  if(!cart.length){box.innerHTML='<li class="muted">No items yet — tap “Add +” on menu.</li>';box2.innerHTML='<li class="muted">Cart is empty.</li>'}
  else{
    const html=cart.map((c,i)=>`<li>${c.name} — $${c.price.toFixed(2)} <button data-i="${i}">✕</button></li>`).join('');
    box.innerHTML=html;box2.innerHTML=html;
    [...box.querySelectorAll('button'),...box2.querySelectorAll('button')].forEach(b=>b.addEventListener('click',()=>{cart.splice(+b.dataset.i,1);save();render()}));
  }
  const wa='https://wa.me/10012345678?text='+encodeURIComponent('Hi Fragola! I want to order: '+cart.map(c=>c.name).join(', ')+' (Total '+t+')');
  $('#waOrder').href=wa;
}
document.addEventListener('click',e=>{
  const b=e.target.closest('[data-order]');if(!b)return;
  cart.push({name:b.dataset.order,price:+(b.dataset.price||5)});save();render();
  b.textContent='Added ✓';setTimeout(()=>b.textContent='Add +',1100);
  openDrawer();
});
$('#clearCart').addEventListener('click',()=>{cart=[];save();render()});
function openDrawer(){drawer.classList.add('open');bg.classList.add('show')}
function closeDrawer(){drawer.classList.remove('open');bg.classList.remove('show')}
$('#cartOpen').addEventListener('click',openDrawer);
$('#cartClose').addEventListener('click',closeDrawer);
bg.addEventListener('click',closeDrawer);
$('#checkoutBtn').addEventListener('click',closeDrawer);
render();

/* Countdown to Sunday 11PM */
function tick(){
  const n=new Date(),d=new Date(n);
  d.setDate(n.getDate()+((7-n.getDay())%7));d.setHours(23,0,0,0);
  if(d<n)d.setDate(d.getDate()+7);
  let s=Math.floor((d-n)/1000);
  const dd=Math.floor(s/86400);s%=86400,hh=Math.floor(s/3600),mm=Math.floor(s%3600/60),ss=s%60;
  const p=v=>String(v).padStart(2,'0');
  $('#cdD').textContent=p(dd);$('#cdH').textContent=p(hh);$('#cdM').textContent=p(mm);$('#cdS').textContent=p(ss);
}
setInterval(tick,1000);tick();
$('#copyBtn').addEventListener('click',()=>{
  navigator.clipboard&&navigator.clipboard.writeText('FRAGOLA20');
  $('#copyBtn').textContent='Copied ✓';setTimeout(()=>$('#copyBtn').textContent='Copy',1200);
});

/* Slider */
const slides=$('#slides'),n=slides.children.length,dotsBox=$('#dots');
let idx=0,timer;
for(let i=0;i<n;i++){const d=document.createElement('button');d.setAttribute('aria-label','Review '+(i+1));if(!i)d.classList.add('active');d.addEventListener('click',()=>go(i));dotsBox.appendChild(d)}
function go(i){idx=(i+n)%n;slides.style.transform=`translateX(-${idx*100}%)`;dotsBox.querySelectorAll('button').forEach((d,k)=>d.classList.toggle('active',k===idx));restart()}
function restart(){clearInterval(timer);timer=setInterval(()=>go(idx+1),5000)}
$('#prev').addEventListener('click',()=>go(idx-1));$('#next').addEventListener('click',()=>go(idx+1));
let sx=0;slides.addEventListener('touchstart',e=>sx=e.touches[0].clientX,{passive:true});
slides.addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-sx;if(Math.abs(dx)>40)go(idx+(dx<0?1:-1))},{passive:true});
restart();

/* FAQ */
$$('.acc').forEach(a=>{
  const btn=a.querySelector('.acc-btn'),body=a.querySelector('.acc-body');
  btn.addEventListener('click',()=>{
    const open=a.classList.contains('open');
    $$('.acc').forEach(x=>{x.classList.remove('open');x.querySelector('.acc-body').style.maxHeight=null});
    if(!open){a.classList.add('open');body.style.maxHeight=body.scrollHeight+'px'}
  });
});

/* Hours */
const h=new Date().getHours();
const txt=(h<7||h>=23)?'Closed Now • Opens 7:00 AM':(h>=22?'Open Now • Closes 11 PM (kitchen 10:30)':'Open Now • Closes 11:00 PM');
$('#hoursToday').textContent=txt;$('#hoursToday2').textContent=txt;$('#openStatus').textContent=(h<7||h>=23)?'Closed':'Open Now';

/* Forms */
const form=$('#bookForm'),msg=$('#formMsg'),dateInput=$('#fDate');
dateInput.min=new Date().toISOString().split('T')[0];dateInput.value=dateInput.min;
form.addEventListener('submit',e=>{
  e.preventDefault();
  const name=$('#fName').value.trim(),phone=$('#fPhone').value.trim();
  if(name.length<2){err('Please enter your name.');return}
  if(phone.replace(/\D/g,'').length<7){err('Please enter a valid phone number.');return}
  if(!dateInput.value){err('Please pick a date.');return}
  ok(`Grazie, ${name}! 🎉 Table for ${$('#fGuests').value} (${$('#fType').value}) on ${dateInput.value} at ${$('#fTime').value}${cart.length?` + ${cart.length} item(s) $${totals().toFixed(2)}`:''} — SMS to ${phone} in 5 min.`);
  form.reset();dateInput.value=dateInput.min;cart=[];save();render();
});
function err(t){msg.textContent=t;msg.className='form-msg err'}
function ok(t){msg.textContent=t;msg.className='form-msg ok'}
$('#newsForm').addEventListener('submit',e=>{
  e.preventDefault();
  const em=$('#newsEmail').value;
  $('#newsMsg').textContent='🎉 Welcome! Code FRAGOLA10 sent to '+em;
  $('#newsEmail').value='';
});

/* Lightbox */
const lb=$('#lightbox'),lbImg=$('#lightboxImg');
$$('.gallery img').forEach(im=>im.addEventListener('click',()=>{lbImg.src=im.src;lb.classList.add('open');document.body.style.overflow='hidden'}));
lb.addEventListener('click',()=>{lb.classList.remove('open');document.body.style.overflow=''});

/* Reveal stagger */
const rio=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');rio.unobserve(e.target)}}),{threshold:.1});
$$('.card,.menu-item,.about-text,.hero-visual,.offer-card,.acc,.news-box').forEach((el,i)=>{el.classList.add('reveal','d'+(i%4));rio.observe(el)});

/* Tilt (desktop + fine pointer only, rAF-throttled, disabled if reduced motion) */
if(matchMedia('(pointer:fine)').matches&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
  $$('.tilt').forEach(el=>{
    let raf=null;
    el.addEventListener('mousemove',e=>{
      if(raf)return;
      raf=requestAnimationFrame(()=>{
        const r=el.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
        el.style.transform=`perspective(800px) rotateY(${(x*8).toFixed(2)}deg) rotateX(${(-y*8).toFixed(2)}deg)`;
        raf=null;
      });
    });
    el.addEventListener('mouseleave',()=>{if(raf)cancelAnimationFrame(raf);raf=null;el.style.transform=''});
  });
}
})();
