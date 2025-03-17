"use strict";(()=>{var y="v1.0.3";var E=document,x=()=>{I(),addEventListener("load",()=>{let t=p("#version");t.innerText=y,t.style.width=t.scrollWidth+"px"})},p=t=>E.querySelector(t),f=(t,o)=>t.querySelector(o),b=t=>E.getElementById(t),d=(t,o,l={},s)=>{let r=E.createElement(t);return Object.entries(l).forEach(h=>r.setAttribute(...h)),s!=null&&(r.innerText=s),o!=null?o.appendChild(r):r},v=(t,o,l)=>{let s=(t.className??"").split(" ");l(s,s.indexOf(o)),t.className=s.join(" ")},L=(t,o)=>v(t,o,(l,s)=>s==-1?l.push(o):null),k=(t,o)=>v(t,o,(l,s)=>s!=-1?l.splice(s,1):null),N=(t,o,l)=>v(t,o,(s,r)=>r!=-1?s.splice(r,1):s.push(o)&&l()),m="dark",T="light",M="auto",I=()=>{let t=matchMedia("(prefers-color-scheme: dark)"),o=()=>{let l=localStorage.getItem(m)??M;p("#dark")?.setAttribute("class",l),p("html").className=l==m||l==M&&t.matches?m:T};t.addEventListener("change",o),window.addEventListener("storage",l=>{l.storageArea==localStorage&&l.key==m&&o()}),addEventListener("load",()=>{p("#dark").addEventListener("click",()=>{let l=localStorage.getItem(m);localStorage.setItem(m,l==m?T:l==T?M:m),o()}),o()}),o()};x();addEventListener("load",()=>{let t=p("body > main > nav"),o=p("body > main > article");if(t==null||o==null)return;let l=()=>{let n=f(o,":scope iframe"),e=n?.parentElement;if(n==null||e==null)return;let i=e.insertBefore(d("form",null,{action:"https://codepen.io/pen/define",method:"post",target:"_blank"}),n);e.insertBefore(d("a",null,{id:"penEdit"},"Open this demo in CodePen"),n).onclick=()=>{i.childNodes.length==0?fetch("pen.json").then(g=>g.text()).then(g=>{d("input",i,{type:"hidden",name:"data",value:g}),i.submit()}):i.submit()}};l(),E.body.addEventListener("click",n=>{if(n.button!=0)return;let e=n.target;if(e.tagName=="SPAN"&&e.innerHTML==""&&e.parentElement?.tagName=="LI")return s(e.parentElement);for(;e.tagName!="A"&&e.parentElement!=null;)e=e.parentElement;let i=e.href;!n.metaKey&&!n.shiftKey&&i!=null&&i!=location.origin+"/"&&i.startsWith(location.origin+"/")&&!i.includes("#")&&(r(i),n.preventDefault(),history.pushState(null,"",i))}),window.onpopstate=function(n){location.href.includes("#")||(r(location.href),n.preventDefault())};let s=n=>N(n,"open",()=>{let e=f(n,"a");e.href!=location.origin&&e.click()}),r=n=>{["?","#"].forEach(e=>{n.includes(e)&&(n=n.substring(0,n.indexOf(e)))}),fetch(`${n}nav.json`).then(e=>e.json()).then(e=>{k(f(t,"li.current"),"current"),h(e,f(t,"ul"))}),fetch(`${n}article.html`).then(e=>e.text()).then(e=>C(e))},h=({i:n,n:e,u:i,r:g,c:A,p:B,o:S,_:H},q)=>{let a=b(n);if(a==null){a=d("li",q,{id:n}),d("span",a);let c=d("a",a,{href:i});g?d("code",c,{},e):c.innerText=e,B&&L(a,"parent")}if(S&&L(a,"open"),H!=null){let c=f(a,"ul")??d("ul",a);H.forEach(u=>{h(u,c)})}if(A){L(a,"current"),E.title=`${e} | TinyTick`;let c=a.getBoundingClientRect(),u=t.getBoundingClientRect();c.top<u.top?t.scrollBy(0,c.top-u.top):c.bottom>u.bottom&&t.scrollBy(0,Math.min(c.bottom-u.bottom,c.top-u.top))}},C=n=>{o.innerHTML=n,o.scrollTo(0,0),l()}});})();
