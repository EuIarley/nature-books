(function(){
"use strict";
const $=s=>document.querySelector(s);
const dlg=$("#authDialog");
let user=null, afterLogin=null;

async function api(path,body){
  let res;
  try{
    res=await fetch(path,body?{method:"POST",headers:{"Content-Type":"application/json"},credentials:"same-origin",body:JSON.stringify(body)}:{credentials:"same-origin"});
  }catch(e){throw {offline:true};}
  const type=res.headers.get("Content-Type")||"";
  if(!type.includes("application/json"))throw {offline:true};
  const data=await res.json();
  if(!res.ok)throw {status:res.status,error:data.error||"Algo deu errado. Tente de novo.",field:data.field};
  return data;
}
const offline=location.protocol==="file:";

const firstName=n=>n.trim().split(/\s+/)[0];
function renderHeader(){
  const btn=$("#accountBtn"), av=$("#avatar");
  if(user){
    av.textContent=firstName(user.name).charAt(0).toUpperCase();av.hidden=false;
    btn.setAttribute("aria-label",`Conta de ${user.name}`);
  }else{
    av.hidden=true;btn.setAttribute("aria-label","Entrar ou criar conta");closeMenu();
  }
}
function renderMenu(){
  const since=new Date(user.created_at*1000).toLocaleDateString("pt-BR",{month:"long",year:"numeric"});
  $("#acctMenu").innerHTML=`<div><b>Olá, ${esc(firstName(user.name))}</b><small>${esc(user.email)}</small><small>Leitor desde ${since}</small></div>
    <hr><button class="btn btn-ghost btn-sm" data-acct="cart">Minha sacola</button><button class="btn btn-primary btn-sm" data-acct="logout">Sair</button>`;
}
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
function openMenu(){renderMenu();$("#acctMenu").hidden=false;$("#accountBtn").setAttribute("aria-expanded","true");}
function closeMenu(){$("#acctMenu").hidden=true;$("#accountBtn").setAttribute("aria-expanded","false");}

$("#accountBtn").addEventListener("click",e=>{
  e.stopPropagation();
  if(!user)return open("login");
  $("#acctMenu").hidden?openMenu():closeMenu();
});
document.addEventListener("click",e=>{if(!e.target.closest(".acct"))closeMenu();});
$("#acctMenu").addEventListener("click",async e=>{
  const b=e.target.closest("[data-acct]");if(!b)return;
  closeMenu();
  if(b.dataset.acct==="cart")return $("#cartBtn").click();
  try{await api("/api/logout",{});}catch(err){}
  user=null;renderHeader();toast("Você saiu da sua conta. Até a próxima leitura!");
});

function setTab(tab){
  const login=tab==="login";
  $("#tabLogin").setAttribute("aria-selected",login);$("#tabRegister").setAttribute("aria-selected",!login);
  $("#loginForm").hidden=!login;$("#registerForm").hidden=login;
  $("#authTitle").innerHTML=login?"Bem-vindo de volta à <em>Nature Books</em>":"Crie sua conta na <em>Nature Books</em>";
  setTimeout(()=>(login?$("#loginEmail"):$("#regName")).focus(),30);
}
function open(tab="login",then=null){
  afterLogin=then;
  $("#authOffline").hidden=!offline;
  clearErrors();
  if(typeof dlg.showModal==="function")dlg.showModal();else dlg.setAttribute("open","");
  setTab(tab);
}
function close(){if(dlg.open)dlg.close();}
$("#authClose").addEventListener("click",close);
dlg.addEventListener("click",e=>{if(e.target===dlg)close();});
$("#tabLogin").addEventListener("click",()=>setTab("login"));
$("#tabRegister").addEventListener("click",()=>setTab("register"));
dlg.addEventListener("click",e=>{const t=e.target.closest("[data-auth-tab]");if(t)setTab(t.dataset.authTab);});
dlg.addEventListener("click",e=>{
  const b=e.target.closest("[data-eye]");if(!b)return;
  const inp=document.getElementById(b.dataset.eye), show=inp.type==="password";
  inp.type=show?"text":"password";b.setAttribute("aria-pressed",show);b.setAttribute("aria-label",show?"Ocultar senha":"Mostrar senha");
});

function clearErrors(){
  ["loginErr","regErr"].forEach(id=>$("#"+id).textContent="");
  dlg.querySelectorAll("[aria-invalid]").forEach(i=>i.removeAttribute("aria-invalid"));
}
function fail(errEl,msg,input){
  $(errEl).textContent=msg;
  if(input){input.setAttribute("aria-invalid","true");input.focus();}
}
const EMAIL=/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

$("#regPass").addEventListener("input",e=>{
  const v=e.target.value;let s=0;
  if(v.length>=8)s++;if(v.length>=12)s++;if(/[a-z]/i.test(v)&&/\d/.test(v))s++;if(/[^a-z0-9]/i.test(v))s++;
  const m=$("#pwMeter");m.style.width=(v?Math.max(12,s*25):0)+"%";m.style.background=s<=1?"var(--wood-2)":s===2?"var(--olive)":"var(--moss)";
});

async function submit(form,errEl,run){
  const btn=form.querySelector('[type="submit"]'),label=btn.textContent;
  btn.disabled=true;btn.textContent="Aguarde…";
  try{await run();}
  catch(err){
    if(err&&err.offline){$("#authOffline").hidden=false;fail(errEl,"Não foi possível falar com o servidor.");}
    else{const map={name:"#regName",email:form.id==="loginForm"?"#loginEmail":"#regEmail",password:"#regPass"};
      fail(errEl,err.error||"Algo deu errado. Tente de novo.",err.field&&$(map[err.field]));}
  }finally{btn.disabled=false;btn.textContent=label;}
}
function signedIn(u,msg){
  user=u;renderHeader();close();toast(msg);
  dlg.querySelectorAll("input[type=password],#regName").forEach(i=>i.value="");
  if(afterLogin){const f=afterLogin;afterLogin=null;f();}
}

$("#loginForm").addEventListener("submit",e=>{
  e.preventDefault();clearErrors();
  const email=$("#loginEmail").value.trim(), password=$("#loginPass").value;
  if(!EMAIL.test(email))return fail("#loginErr","Informe um e-mail válido, como nome@exemplo.com.",$("#loginEmail"));
  if(!password)return fail("#loginErr","Digite sua senha.",$("#loginPass"));
  submit(e.target,"#loginErr",async()=>{
    const d=await api("/api/login",{email,password,remember:$("#loginRemember").checked});
    signedIn(d.user,`Que bom ver você de novo, ${firstName(d.user.name)}!`);
  });
});

$("#registerForm").addEventListener("submit",e=>{
  e.preventDefault();clearErrors();
  const name=$("#regName").value.trim(), email=$("#regEmail").value.trim(), password=$("#regPass").value, confirm=$("#regPass2").value;
  if(name.length<2)return fail("#regErr","Informe seu nome.",$("#regName"));
  if(!EMAIL.test(email))return fail("#regErr","Informe um e-mail válido, como nome@exemplo.com.",$("#regEmail"));
  if(password.length<8||!/[a-z]/i.test(password)||!/\d/.test(password))return fail("#regErr","A senha precisa ter 8 caracteres ou mais, com letras e números.",$("#regPass"));
  if(password!==confirm)return fail("#regErr","As senhas não são iguais.",$("#regPass2"));
  submit(e.target,"#regErr",async()=>{
    const d=await api("/api/register",{name,email,password,remember:true});
    signedIn(d.user,`Conta criada! Boas-vindas, ${firstName(d.user.name)}.`);
  });
});

let tT;function toast(msg){const t=$("#toast");t.querySelector("span").textContent=msg;t.classList.add("on");clearTimeout(tT);tT=setTimeout(()=>t.classList.remove("on"),2600);}

window.NBAuth={get user(){return user},open};

if(!offline)api("/api/me").then(d=>{user=d.user;renderHeader();}).catch(()=>{});
})();
