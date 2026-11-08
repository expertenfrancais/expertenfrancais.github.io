/* ===== course.js : rend vivante la page statique d’un cours (dossier cours/) =====
   Le contenu (titre, description, sommaire, aperçu) est déjà dans le HTML de la page.
   Ce script ajoute seulement ce qui dépend de la personne : accès, favoris, panier. */
(function(){
var LOCK="M18 8h-1V6A5 5 0 0 0 7 6v2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2zM9 6a3 3 0 0 1 6 0v2H9z",
    CHEV="M8.6 16.6L13.2 12 8.6 7.4 10 6l6 6-6 6z";
function svg(p){return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="'+p+'"/></svg>'}
function nav(){drawNav(1)}
$("nav").onclick=navClick;
var d=ALLDOCS.filter(function(x){return x.id===DOC_ID})[0];
var logged=!!userName();
/* Un visiteur non connecté voit la page (aperçu public). Une personne connectée ne voit que les documents de son profil. */
var typeOK=!!d&&(!logged||ALLOWED_TYPES.indexOf(d.k)>-1);
var cycOK=!!d&&cycleOK(d);
var allowed=typeOK&&cycOK;
var P=$("page");
if(!allowed){
 var other=!!d&&typeOK&&!cycOK;
 P.innerHTML='<div class="center"><h3>'+(other?"Cours d’un autre cycle":"Document indisponible")+'</h3><p>'+(other?
  "Ce cours fait partie du cycle « "+esc(d.c)+" ». Votre compte donne accès au cycle « "+esc(homeCycle())+" ». Avec un abonnement, vous pouvez passer d’un cycle à l’autre.":
  "Ce document n’est pas disponible pour votre profil.")+'</p></div><div class="dock"><button class="go" id="goCat" type="button"><span>'+(other?"Voir les formules d’abonnement":"Voir le catalogue")+'</span><i>'+svg(CHEV)+'</i></button></div>';
 $("goCat").onclick=function(){location.href=BASE+(other?"abonnement.html":"catalogue.html")};nav();return}

var acc=canAccess(d.id),inc=isSubscribed(),inCart=cart.indexOf(d.id)>-1,I=docInfo(d);
var go=$("go"),bk=$("bk");

/* Retour : toujours vers l’endroit d’où l’on est venu (accueil, catalogue…), jamais vers une partie du cours */
try{
 var ref=document.referrer?new URL(document.referrer):null;
 if(ref&&ref.origin===location.origin&&!/lecon\.html$/.test(ref.pathname)&&!/\/(cours|fiches)\//.test(ref.pathname))
  sessionStorage.setItem("coursFrom",ref.href);
}catch(x){}
$("back").onclick=function(e){
 var to=null;try{to=sessionStorage.getItem("coursFrom")}catch(x){}
 if(to){e.preventDefault();location.replace(to)}};

/* Favoris */
bk.setAttribute("aria-pressed",favs.indexOf(d.id)>-1);
bk.onclick=function(){var i=favs.indexOf(d.id);i>-1?favs.splice(i,1):favs.push(d.id);sv("favs",favs);this.setAttribute("aria-pressed",i<0);toast(i<0?"Ajouté aux favoris":"Retiré des favoris")};

/* Sommaire : injecté ici ; chaque partie ouvre sa propre page de lecture */
function paintLessons(){
 var done=partsDone(d.id);
 $("lessons").innerHTML=I.sections.map(function(s,i){
  var n='<span class="n">'+(i+1)+'</span>',open=partFree(i)||acc;
  if(!open)return '<a class="ls lock" href="'+BASE+'abonnement.html"><div class="sm">'+n+'<span class="tx"><b>'+esc(s.t)+'</b><small>Réservé aux abonnés · S’abonner ›</small></span><span class="end">'+svg(LOCK)+'</span></div></a>';
  var ok=done.indexOf(i)>-1,sm=scoreSum(scoreGet(d.id,i));
  return '<a class="ls'+(ok?" done":"")+'" href="'+partUrl(d,i)+'"><div class="sm">'+n+'<span class="tx"><b>'+esc(s.t)+'</b><small'+(partFree(i)&&!acc?' class="free"':"")+'>'+(ok?"Étudié ✓":partFree(i)&&!acc?"Gratuit":"Lire la partie")+(sm.qa?" · Quiz "+sm.qo+"/"+sm.nq:"")+'</small></span><span class="end">'+svg(CHEV)+'</span></div></a>'}).join("")}
paintLessons();
if(acc){
 /* Accès : prix remplacé par l’état, sections lisibles, bouton de téléchargement */
 var stl=ls("studied",[]);if(stl.indexOf(d.id)<0){stl.push(d.id);sv("studied",stl)}
 var pr=$("price");pr.className="pill r own";pr.innerHTML=svg(IC.check)+(GRATUIT?"Gratuit":inc?"Inclus":"Acheté");
 var sl=$("subLink");if(sl)sl.remove();
 if(logged){$("lessons").insertAdjacentHTML("afterend",rateBox(d.id));bindRate(P,d.id)}
 go.innerHTML='<span>Télécharger</span><i>'+svg(IC.dl)+'</i>';
 go.onclick=function(){location.href=BASE+"pdf.html?id="+d.id};
}else{
 var label=!ACHAT?(logged?"S’abonner":"Se connecter pour s’abonner"):!logged?"Se connecter pour acheter":inCart?"Aller au panier":"Acheter · "+price(d.pr);
 go.innerHTML='<span>'+esc(label)+'</span><i>'+svg(logged?IC.cart:CHEV)+'</i>';
 go.onclick=function(){
  if(!logged){location.href=BASE+"login-app.html?next="+encodeURIComponent(docFile(d));return}
  if(!ACHAT){location.href=BASE+"abonnement.html";return}
  if(cart.indexOf(d.id)<0){cart.push(d.id);sv("cart",cart)}
  location.href=BASE+"panier.html"};
}
nav();
})();
