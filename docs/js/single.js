"use strict";(()=>{var v="v1.1.1";var T=document,M=()=>{f(),addEventListener("load",()=>{let t=a("#version");t.innerText=v,t.style.width=t.scrollWidth+"px"})},a=t=>T.querySelector(t);var L=t=>T.getElementById(t);var h=(t,s,e)=>{let n=(t.className??"").split(" ");e(n,n.indexOf(s)),t.className=n.join(" ")},H=(t,s)=>h(t,s,(e,n)=>n==-1?e.push(s):null),p=(t,s)=>h(t,s,(e,n)=>n!=-1?e.splice(n,1):null);var o="dark",g="light",u="auto",f=()=>{let t=matchMedia("(prefers-color-scheme: dark)"),s=()=>{let e=localStorage.getItem(o)??u;a("#dark")?.setAttribute("class",e),a("html").className=e==o||e==u&&t.matches?o:g};t.addEventListener("change",s),window.addEventListener("storage",e=>{e.storageArea==localStorage&&e.key==o&&s()}),addEventListener("load",()=>{a("#dark").addEventListener("click",()=>{let e=localStorage.getItem(o);localStorage.setItem(o,e==o?g:e==g?u:o),s()}),s()}),s()};M();addEventListener("load",()=>{let t=a("body > main > nav"),s=a("body > main > article");if(t==null||s==null)return;let e=new Map,n=new IntersectionObserver(m=>{m.forEach(l=>{let r=l.target,d=l.target.className,c=/s\d+/.test(d)?parseInt(d.substr(1)):0,i=e.get(c);i==null&&(i=new Set,e.set(c,i)),l.isIntersecting?i.add(r):(i.delete(r),p(L(r.dataset.id),"current"))});let E=0;e.forEach((l,r)=>{l.size>0&&r>E&&(E=r)}),e.forEach((l,r)=>l.forEach(d=>{let c=L(d.dataset.id);r==E?H(c,"current"):p(c,"current")}))});s.querySelectorAll("section[data-id]").forEach(m=>n.observe(m))});})();
