/* ===== fiche.js : affichage d'une fiche pédagogique (format : contenu/SPEC-FICHES.md) =====
   FICHE.init() : écran fiche.html (3 onglets).  FICHE.prof / .apprenant / .corrige : HTML réutilisé par pdf.html.
   Tout le texte est échappé ; seuls **gras** et *italique* sont acceptés. Aucune donnée n'est enregistrée (pas de localStorage). */
var FICHE=(function(){
function e(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
function f(s){return e(s).replace(/\*\*([^*]+)\*\*/g,"<b>$1</b>").replace(/\*([^*]+)\*/g,"<em>$1</em>")}
function lines(s){return String(s==null?"":s).split(/\n+/).filter(Boolean)}
function para(s){return lines(s).map(function(t){return"<p>"+f(t)+"</p>"}).join("")}
function board(s){return lines(s).map(function(l){return l.split(/\s+(?=\d+\.\s)/)}).reduce(function(a,b){return a.concat(b)},[]).map(function(t){return"<p>"+f(t)+"</p>"}).join("")}
function arr(a){return Array.isArray(a)?a:[]}
function roman(t){t=String(t||"");var i=t.indexOf("-");return i>0&&i<5?{n:t.slice(0,i),t:t.slice(i+1)}:{n:"",t:t}}
function total(s){if(s.sousEtapes){var k=0;s.sousEtapes.forEach(function(x){k+=+x.temps||0});return k}return +s.temps||0}
function ph(x,label){return x&&String(x).trim()?f(x):'<span class="f-ph">['+e(label)+']</span>'}
function fmtDate(v){var m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(v||"");return m?m[3]+"/"+m[2]+"/"+m[1]:(v||"")}
function dots(v,n){return v&&String(v).trim()?e(v):(n||"......")}
function steps(j){return arr(j.etapes)}
function nbEtapes(j){return steps(j).length}
/* Étapes réservées aux abonnés : à partir de l’étape numéro lockFrom (0 = la première). 1e9 = rien n’est verrouillé. lockHref = page où l’on envoie le non-abonné. */
var lockFrom=1e9,lockHref="";
function lockIco(n){return typeof ico==="function"&&window.IC&&IC.lock?ico("lock",n):""}

/* ----- en-tête ----- */
function head(j,v,edit){
 var h=j.entete||{},v2=v||{},lec=/lecture/i.test(h.sousDiscipline||"");
 function it(l,x){return'<div><small>'+e(l)+'</small><b>'+x+'</b></div>'}
 var c1=it("Niveau d’études",f(h.niveau))+it("Discipline",f(h.discipline))+it("Sous-discipline",f(h.sousDiscipline))+
  it("Objectif général",ph(h.objectifGeneral,"Objectif général"))+it("Objectif spécifique",ph(h.objectifSpecifique,"Objectif spécifique"))+
  (lec?it("Thème",ph(h.theme,"Thème")):"")+it("Titre",f(h.titre))+it("Objet d’apprentissage",f(h.objet));
 var eff=edit?'G : <span id="vG">'+dots(v2.g)+'</span> · F : <span id="vF">'+dots(v2.f)+'</span> · T : <span id="vT">'+dots(v2.t)+'</span>':
  'G : '+dots(v2.g)+' · F : '+dots(v2.f)+' · T : '+dots(v2.t);
 var c2=it("Fiche n°",e(h.numero))+it("Effectif",eff);
 var c3=it("Date",edit?'<span id="vD">'+dots(fmtDate(v2.date),"...............")+'</span>':dots(fmtDate(v2.date),"..............."))+it("Durée",e(h.duree)+" min")+
  it("Support",ph(h.support,"Support"))+it("Documentation",ph(h.documentation,"Documentation"));
 return'<section class="f-card"><h2>En-tête de la fiche</h2><div class="f-hd f-wide"><div class="f-hcol">'+c1+'</div><div class="f-hcol">'+c2+'</div><div class="f-hcol">'+c3+'</div></div></section>'}
function fill(v){v=v||{};
 return'<section class="f-fill"><h3>À compléter avant la séance</h3><p>Ces champs ne sont pas enregistrés : ils servent à l’impression.</p>'+
 '<div class="row"><div><label for="iG">Garçons</label><input id="iG" inputmode="numeric" maxlength="3" value="'+e(v.g||"")+'"></div><div><label for="iF">Filles</label><input id="iF" inputmode="numeric" maxlength="3" value="'+e(v.f||"")+'"></div><div><label for="iT">Total</label><input id="iT" inputmode="numeric" maxlength="3" value="'+e(v.t||"")+'"></div></div>'+
 '<label for="iD">Date de la séance</label><input id="iD" type="date" value="'+e(v.date||"")+'"></section>'}
function oo(j){return'<section class="f-oo"><span class="f-lab">O.O · Objectif opérationnel</span><p>'+f(j.oo)+'</p></section>'}

/* ----- évaluation ----- */
function evalHTML(ev){
 if(!ev)return"";
 return'<p><b>Mode : '+e(ev.mode)+'</b></p><p><b>Contexte :</b> '+f(ev.contexte)+'</p><p><b>Tâche :</b> '+f(ev.tache)+'</p><p><b>Consigne :</b> '+f(ev.consigne)+'</p>'+
  '<p><b>Items :</b></p><ol>'+arr(ev.items).map(function(x){return"<li>"+f(x)+"</li>"}).join("")+'</ol>'+
  '<div class="f-cle"><p><b>Clé :</b> '+arr(ev.cle).map(function(x,i){return(i+1)+". "+f(x)}).join(" ; ")+'.</p><p><b>Barème :</b> '+f(ev.bareme)+' · <b>Seuil :</b> '+f(ev.seuil)+'</p></div>'}

/* ----- carte d'une étape (téléphone) ----- */
function qrList(s,mode){
 var R={};arr(s.reponses).forEach(function(r){R[r.n]=r.r});
 return arr(s.questions).map(function(q){
  return'<div class="f-q"><i>Q'+q.n+'</i><span>'+f(q.q)+'</span></div>'+(R[q.n]!=null?'<div class="f-r"><i>R'+q.n+'</i><span>'+f(R[q.n])+'</span></div>':"")}).join("")}
function cardBody(s,label){
 var h='<div class="f-chips"><span class="f-chip"><b>Technique :</b> '+f(s.technique)+'</span><span class="f-chip">'+f(s.modalite)+'</span></div>';
 h+='<b class="f-k">Consigne</b><p>'+f(s.consigne)+'</p>';
 if(s.texte&&String(s.texte).trim())h+='<div class="f-board"><b class="f-k">'+label+'</b>'+board(s.texte)+'</div>';
 if(arr(s.questions).length)h+='<b class="f-k">Questions et réponses attendues</b>'+qrList(s);
 if(s.activite)h+='<b class="f-k">Activité d’apprentissage</b><p>'+f(s.activite)+'</p>';
 if(s.evaluation)h+='<b class="f-k">Mode d’évaluation</b><div class="f-evb">'+evalHTML(s.evaluation)+'</div>';
 return h}
function cardStep(s,i){
 var r=roman(s.titre),t=total(s),sub="",body="";
 if(i>=lockFrom)return'<a class="f-step f-locked" href="'+lockHref+'"><span class="f-num">'+e(r.n)+'</span><span class="f-st"><b>'+f(r.t)+'</b><small>Réservé aux abonnés · S’abonner</small></span><span class="f-time">'+t+' min</span><span class="f-lkic">'+lockIco(18)+'</span></a>';
 if(s.sousEtapes){
  sub=s.sousEtapes.map(function(x){return roman(x.titre).t}).join(" · ");
  body=s.sousEtapes.map(function(x,k){var a=roman(x.titre);
   return'<div class="f-sub"'+(k===0?' style="border-top:0;margin-top:0;padding-top:0"':"")+'><h4><span class="f-num">'+e(a.n)+'</span><span>'+f(a.t)+'</span><span class="f-time">'+(+x.temps||0)+' min</span></h4>'+cardBody(x,"Corpus")+'</div>'}).join("")}
 else{sub=f(s.technique)+" · "+f(s.modalite);body=cardBody(s,/^I-/.test(s.titre)?"Au tableau":"Texte")}
 return'<details class="f-step"'+(i===0?" open":"")+'><summary><span class="f-num">'+e(r.n)+'</span><span class="f-st"><b>'+f(r.t)+'</b><small>'+sub+'</small></span><span class="f-time">'+t+' min</span></summary><div class="f-sbody">'+body+'</div></details>'}

/* ----- tableau à 6 colonnes ----- */
function stratCell(s,title,label){
 var h='<p><b>'+f(title)+'</b></p><p><b>Technique :</b> '+f(s.technique)+'<br><b>Modalité de travail :</b> '+f(s.modalite)+'<br><b>Consigne :</b> '+f(s.consigne)+'</p>';
 if(s.texte&&String(s.texte).trim())h+='<div class="f-bd"><b>'+label+' :</b>'+board(s.texte)+'</div>';
 h+=arr(s.questions).map(function(q){return'<p class="f-qq">Q'+q.n+'- '+f(q.q)+'</p>'}).join("");
 return h}
function actCell(s){
 return(s.activite?"<p>"+f(s.activite)+"</p>":"")+arr(s.reponses).map(function(r){return'<p class="f-qq">R'+r.n+'- '+f(r.r)+'</p>'}).join("")}
function tableHTML(j){
 var rows=[];
 steps(j).forEach(function(s,si){
  if(si>=lockFrom){rows.push({lock:s});return}
  if(s.sousEtapes){rows.push({iv:s});s.sousEtapes.forEach(function(x){rows.push({s:x,sub:true})})}
  else rows.push({s:s})});
 var h='<div class="f-tabscroll"><table class="f-tab"><thead><tr><th class="c-oo">O.O</th><th class="c-st">Stratégies d’enseignement</th><th class="c-ac">Activités d’apprentissage</th><th class="c-ev">Mode d’évaluation</th><th class="c-tp">Temps</th><th class="c-ob">Observ.</th></tr></thead><tbody>';
 rows.forEach(function(r,i){
  /* Pas de rowspan : un tableau à cellule fusionnée ne se coupe pas entre deux pages à l’impression. La colonne O.O est donc faite de cellules sans bordure intérieure. */
  var first='<td class="c-oo'+(i===0?" oo-f":"")+(i===rows.length-1?" oo-l":"")+'">'+(i===0?f(j.oo):"")+'</td>';
  if(r.lock){var rl=roman(r.lock.titre);h+='<tr class="f-lockrow">'+first+'<td colspan="5"><a href="'+lockHref+'"><span class="f-lkic">'+lockIco(16)+'</span><b>'+e(rl.n)+' · '+f(rl.t)+'</b> · '+total(r.lock)+' min — réservé aux abonnés. <u>S’abonner</u></a></td></tr>';return}
  if(r.iv){h+='<tr class="f-ivh">'+first+'<td colspan="5">'+f(r.iv.titre)+' · '+total(r.iv)+' min</td></tr>';return}
  var s=r.s,rm=roman(s.titre);
  h+='<tr>'+first+'<td>'+stratCell(s,r.sub?s.titre:s.titre,r.sub?"Corpus":(/^I-/.test(s.titre)?"Au tableau":"Texte"))+'</td><td>'+actCell(s)+'</td><td>'+(s.evaluation?evalHTML(s.evaluation):"")+'</td><td class="c-tp">'+(+s.temps||0)+' min</td><td class="c-ob">'+(s.observ?f(s.observ):"")+'</td></tr>'});
 return h+'</tbody></table></div>'}

/* ----- les trois parties ----- */
function prof(j,v,mode){
 var edit=mode==="edit",h=head(j,v,edit);
 if(edit)h+=fill(v);
 h+=oo(j);
 if(edit)h+='<div class="f-cards"><h3 class="f-h3">Déroulement · '+nbEtapes(j)+' étapes</h3>'+steps(j).map(cardStep).join("")+'<div class="f-obs"><span>Observations après la séance : colonne « Observ. », vide pour l’enseignant.</span></div></div>';
 h+='<div class="f-tablewrap">'+tableHTML(j)+'</div>';
 return h}
function apprenant(j,v){
 var a=j.apprenant||{},h=j.entete||{};
 var left='<section class="f-card"><div class="f-adate"><span>Date : '+dots(fmtDate((v||{}).date),"........")+'</span><span>'+f(h.discipline)+' – '+f(h.sousDiscipline)+'</span></div><h1>'+f(a.titre||h.titre)+'</h1>'+(a.intro?'<p class="f-intro">'+f(a.intro)+'</p>':"")+'</section>';
 left+='<section class="f-card"><h2>Je lis les phrases</h2><ol class="f-corpus">'+arr(a.corpus).map(function(x){return"<li>"+f(x)+"</li>"}).join("")+'</ol></section>';
 var rl=lines(a.retenir),ex="",ul="";
 rl.forEach(function(l){if(/^Exemple\s*:/i.test(l))ex='<div class="f-ex1">'+f(l)+'</div>';else ul+="<li>"+f(l)+"</li>"});
 left+='<section class="f-ret"><span class="f-lab" style="background:var(--fgreent)">Je retiens</span><ul>'+ul+'</ul>'+ex+'</section>';
 var tabl="";
 if(a.tableau&&arr(a.tableau.head).length)tabl='<section class="f-card"><h2>Je classe les mots</h2><div class="f-tabscroll"><table class="f-syn"><thead><tr>'+a.tableau.head.map(function(x){return"<th>"+f(x)+"</th>"}).join("")+'</tr></thead><tbody>'+arr(a.tableau.rows).map(function(r){return"<tr>"+r.map(function(x){return"<td>"+f(x)+"</td>"}).join("")+"</tr>"}).join("")+'</tbody></table></div></section>';
 var right=tabl+arr(a.exercices).map(function(x){
  var m=/^(Exercice\s*\d+)\s*:\s*(.*)$/i.exec(x.enonce||""),lab=m?m[1]:"Exercice",txt=m?m[2]:x.enonce;
  return'<section class="f-card f-exo"><div class="f-exh"><span class="f-lab" style="background:var(--fp);color:#fff;border-radius:14px;padding:3px 11px;font-size:12px;font-weight:700">'+f(lab)+'</span><span>'+arr(x.items).length+' items</span></div><p>'+f(txt)+'</p><ol>'+arr(x.items).map(function(i){return"<li>"+f(i)+"</li>"}).join("")+'</ol>'+(x.rappel?'<div class="f-seuil">'+f(x.rappel)+'</div>':"")+'</section>'}).join("");
 return'<div class="f-app"><div>'+left+'</div><div>'+right+'</div></div>'}
function corrige(j){
 var ev=null;steps(j).forEach(function(s){(s.sousEtapes||[s]).forEach(function(x){if(x.evaluation)ev=x.evaluation})});
 var h='<section class="f-card f-corr"><h2>Corrigé enseignant</h2><ul style="margin:0;padding:0 0 0 18px">'+arr(j.corrige).map(function(x){return"<li>"+f(x)+"</li>"}).join("")+'</ul></section>';
 if(ev)h+='<section class="f-card"><h2>Évaluation de l’étape V</h2><div class="f-evb">'+evalHTML(ev)+'</div></section>';
 return h}

/* ----- écran fiche.html ----- */
function msg(root,t,p,label,href){root.innerHTML='<div class="f-msg"><h1>'+t+'</h1><p>'+p+'</p><a class="f-btn" href="'+href+'">'+label+'</a></div>'}
function init(){
 var root=document.getElementById("fx"),q=new URLSearchParams(location.search),nf=+q.get("n"),
  d=ALLDOCS.filter(function(x){return x.k==="Fiches"&&x.fn===nf})[0],vals={g:"",f:"",t:"",date:""};
 document.documentElement.className="f-page";
 if(!d||d.k!=="Fiches")return msg(root,"Fiche introuvable","Cette fiche pédagogique n’existe pas ou n’est plus disponible.","Voir le catalogue","catalogue.html");
 if(ALLOWED_TYPES.indexOf("Fiches")<0)return msg(root,"Réservé aux enseignants","Les fiches pédagogiques sont réservées au profil enseignant.","Voir le catalogue","catalogue.html");
 var paid=ficheAcces(d.id); /* Gratuit : l’en-tête et les FICHES_LIBRES premières étapes. Abonnés : les autres étapes, la page de l’apprenant, le corrigé et le PDF (voir data.js) */
 lockFrom=paid?1e9:(typeof FICHES_LIBRES==="number"?FICHES_LIBRES:2);
 lockHref=BASE+(userName()?"abonnement.html":"login-app.html?next="+encodeURIComponent("abonnement.html"));
  function lk(){return paid?"":'<span class="f-lk">'+lockIco(13)+'</span>'}
 document.title=d.t+" | Fiche pédagogique | Expert en français";
 if(!window.fetch)return msg(root,"Navigateur trop ancien","Ouvrez l’application dans un navigateur à jour pour afficher la fiche.","Retour",docUrl(d));
 fetch(BASE+contentFile(d)).then(function(r){return r.ok?r.json():null}).catch(function(){return null}).then(function(j){
  if(!j||j.type!=="fiche")return msg(root,"Fiche indisponible","Le contenu de cette fiche n’a pas pu être chargé.","Retour à la fiche",docUrl(d));
  var BACK="M15.4 7.4L14 6l-6 6 6 6 1.4-1.4L10.8 12z",h=j.entete||{};
  function tab(){var t=(location.hash||"").replace("#","");return t==="apprenant"||t==="corrige"?t:"prof"}
  function pdfHref(t){var p=t==="prof"?"prof":"apprenant";return"pdf.html?n="+d.fn+"&p="+p+"&g="+encodeURIComponent(vals.g)+"&f="+encodeURIComponent(vals.f)+"&t="+encodeURIComponent(vals.t)+"&d="+encodeURIComponent(vals.date)}
  function draw(){
   var t=tab();
    if(!paid&&t!=="prof"){location.replace(BASE+(userName()?"abonnement.html":"login-app.html?next="+encodeURIComponent("abonnement.html")));return}
    var body=t==="prof"?prof(j,vals,"edit"):t==="apprenant"?apprenant(j,vals):corrige(j);
   root.innerHTML='<div class="fx"><div class="f-bar"><a class="f-back" id="fBack" href="'+docUrl(d)+'" aria-label="Retour à la fiche"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="'+BACK+'"/></svg></a><div class="f-ttl"><small>Fiche n° '+e(h.numero)+' · '+e(h.niveau)+' · '+e(h.sousDiscipline)+'</small><b>'+f(h.titre)+'</b></div>'+
    '<a class="f-pdf" id="fPdf" href="'+pdfHref(t)+'"><span class="f-l">Enregistrer en&nbsp;</span>PDF'+lk()+'</a>'+
    '<nav class="f-tabs" aria-label="Parties de la fiche"><a href="#prof" class="'+(t==="prof"?"on":"")+'">Fiche du professeur</a><a href="#apprenant" class="'+(t==="apprenant"?"on":"")+'">Page de l’apprenant'+lk()+'</a><a href="#corrige" class="'+(t==="corrige"?"on":"")+'">Corrigé'+lk()+'</a></nav></div>'+body+'</div>';
   if(t==="prof")bindFill();
   /* Retour : revient réellement en arrière si l’on vient du site, sinon ouvre la page de présentation en remplaçant cet écran (pas de boucle) */
   var bk=document.getElementById("fBack");
   if(bk)bk.onclick=function(ev){ev.preventDefault();var ok=false;try{ok=history.length>1&&document.referrer&&new URL(document.referrer).origin===location.origin}catch(x){}
    if(ok)history.back();else location.replace(docUrl(d))};
   /* Changer d’onglet ne crée pas d’entrée d’historique : un seul « retour » suffit */
   var tb=root.querySelectorAll(".f-tabs a");
   for(var z=0;z<tb.length;z++)tb[z].onclick=function(ev){ev.preventDefault();location.replace(this.getAttribute("href"))};
   window.scrollTo(0,0)}
  function bindFill(){
   [["iG","g","vG"],["iF","f","vF"],["iT","t","vT"],["iD","date","vD"]].forEach(function(a){
    var el=document.getElementById(a[0]);if(!el)return;
    el.oninput=function(){vals[a[1]]=el.value;var o=document.getElementById(a[2]);if(o)o.textContent=el.value?(a[1]==="date"?fmtDate(el.value):el.value):(a[1]==="date"?"...............":"......");
     var p=document.getElementById("fPdf");if(p)p.href=pdfHref("prof")}})}
  window.onhashchange=draw;draw()})}
return{init:init,prof:prof,apprenant:apprenant,corrige:corrige,e:e,f:f,fmtDate:fmtDate}
})();
