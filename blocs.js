/* ===== blocs.js : rendu des blocs riches d'une partie de cours =====
   Une partie = une liste de blocs (voir contenu/SPEC.md). BLOCS.render(liste) renvoie le HTML ;
   BLOCS.bind(élément) active les quiz et les corrigés (à appeler une fois après l'insertion du HTML).
   Tout le texte est échappé : seuls **gras** et *italique* sont acceptés dans les textes. */
var BLOCS=(function(){
function e(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
function f(s){return e(s).replace(/\*\*([^*]+)\*\*/g,"<b>$1</b>").replace(/\*([^*]+)\*/g,"<em>$1</em>")}
function para(s){return String(s==null?"":s).split(/\n+/).filter(Boolean).map(function(t){return"<p>"+f(t)+"</p>"}).join("")}
function arr(a){return Array.isArray(a)?a:[]}
function box(cls,ic,label,inner){return'<div class="bl bl-box '+cls+'"><span class="bl-ic" aria-hidden="true">'+ic+'</span><div class="bl-tx"><small>'+f(label)+'</small>'+inner+'</div></div>'}
var T={
 p:function(b){return para(b.text)},
 h:function(b){return'<h2 class="bl-h">'+f(b.text)+'</h2>'},
 list:function(b){var t=b.ordered?"ol":"ul";return'<'+t+' class="bl-list">'+arr(b.items).map(function(x){return"<li>"+f(x)+"</li>"}).join("")+'</'+t+'>'},
 ex:function(b){return'<div class="bl bl-ex"><small>'+f(b.label||"Exemple")+'</small>'+para(b.text)+'</div>'},
 def:function(b){return box("bl-def","Déf.",b.label||"Définition",para(b.text))},
 tip:function(b){return box("bl-tip","i",b.label||"Astuce",para(b.text))},
 warn:function(b){return box("bl-warn","!",b.label||"Attention",para(b.text))},
 retenir:function(b){return box("bl-ret","✓",b.label||"À retenir",'<ul class="bl-list">'+arr(b.items).map(function(x){return"<li>"+f(x)+"</li>"}).join("")+'</ul>')},
 schema:function(b){return'<div class="bl bl-sch">'+(b.title?'<p class="bl-cap">'+f(b.title)+'</p>':"")+'<div class="bl-cells">'+arr(b.cells).map(function(c){
   return'<div class="bl-cell'+(c.noyau?" core":"")+'"><b>'+f(c.mot)+'</b><small>'+f(c.role)+'</small></div>'}).join("")+'</div>'+(b.note?'<p class="bl-note">'+f(b.note)+'</p>':"")+'</div>'},
 test:function(b){return'<div class="bl bl-test">'+(b.title?'<p class="bl-cap">'+f(b.title)+'</p>':"")+arr(b.lines).map(function(l){return"<p>"+f(l)+"</p>"}).join("")+'</div>'},
 table:function(b){var h=arr(b.head);return'<div class="bl bl-tab">'+(b.title?'<p class="bl-cap">'+f(b.title)+'</p>':"")+'<div class="bl-scroll"><table><thead><tr>'+h.map(function(x){return"<th>"+f(x)+"</th>"}).join("")+'</tr></thead><tbody>'+
   arr(b.rows).map(function(r){return"<tr>"+arr(r).map(function(x){return"<td>"+f(x)+"</td>"}).join("")+"</tr>"}).join("")+'</tbody></table></div></div>'},
 quiz:function(b){var L="ABCDEFGH";return'<div class="bl bl-quiz" data-a="'+(+b.answer||0)+'"><span class="bl-tag">Quiz</span><p class="bl-q">'+f(b.question)+'</p>'+
   arr(b.options).map(function(o,i){return'<button type="button" class="bl-opt" data-i="'+i+'"><i>'+L.charAt(i)+'</i><span>'+f(o)+'</span></button>'}).join("")+
   '<div class="bl-expl" role="status" aria-live="polite" hidden>'+(b.explain?para(b.explain):"")+'</div></div>'},
 exercise:function(b){var corr=Array.isArray(b.corrige)?b.corrige.join("\n"):b.corrige;
   return'<div class="bl bl-exo"><span class="bl-tag">Exercice</span>'+para(b.enonce)+(b.items&&b.items.length?'<ol class="bl-list">'+b.items.map(function(x){return"<li>"+f(x)+"</li>"}).join("")+'</ol>':"")+
   (corr?'<button type="button" class="bl-show" aria-expanded="false">Voir le corrigé ›</button><div class="bl-corr" hidden>'+para(corr)+'</div>':"")+'</div>'}
};
function render(list){return arr(list).map(function(b){var fn=b&&T[b.type];return fn?fn(b):""}).join("")}
function bind(root){
 if(!root||root.__blocs)return;root.__blocs=1;
 root.addEventListener("click",function(ev){
  var t=ev.target,o=t.closest?t.closest(".bl-opt"):null,s=t.closest?t.closest(".bl-show"):null;
  if(o&&!o.disabled){var q=o.closest(".bl-quiz"),a=+q.getAttribute("data-a"),i=+o.getAttribute("data-i"),ex=q.querySelector(".bl-expl");
   if(i===a){o.classList.add("ok");[].forEach.call(q.querySelectorAll(".bl-opt"),function(x){x.disabled=true});if(ex.textContent.trim())ex.hidden=false}
   else{o.classList.add("no");o.disabled=true}}
  if(s){var c=s.nextElementSibling,open=c.hidden;c.hidden=!open;s.setAttribute("aria-expanded",open?"true":"false");s.textContent=open?"Masquer le corrigé ‹":"Voir le corrigé ›"}
 })}
return{render:render,bind:bind,types:Object.keys(T)}
})();
if(typeof module!=="undefined")module.exports=BLOCS;
