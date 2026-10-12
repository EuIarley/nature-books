(function(){
"use strict";
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const page=$("#checkoutPage");
const UFS=["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];
const STEPS=["Identificação","Entrega","Pagamento","Revisão"];
const PIX_OFF=0.05, MIN_PARCELA=20, MAX_PARCELAS=6;
let S=null;

const digits=v=>String(v||"").replace(/\D/g,"");
function mask(v,p){const d=digits(v);let out="",i=0;for(const c of p){if(i>=d.length)break;out+=c==="#"?d[i++]:c;}return out;}
const maskCpf=v=>mask(v,"###.###.###-##");
const maskTel=v=>digits(v).length>10?mask(v,"(##) #####-####"):mask(v,"(##) ####-####");
const maskCep=v=>mask(v,"#####-###");
const maskExp=v=>mask(v,"##/##");
function cpfOk(v){
  const d=digits(v);
  if(d.length!==11||/^(\d)\1{10}$/.test(d))return false;
  for(let t=9;t<11;t++){let s=0;for(let i=0;i<t;i++)s+=d[i]*(t+1-i);if(((s*10)%11)%10!==+d[t])return false;}
  return true;
}
function luhn(n){let s=0,alt=false;for(let i=n.length-1;i>=0;i--){let x=+n[i];if(alt){x*=2;if(x>9)x-=9;}s+=x;alt=!alt;}return s%10===0;}
function brand(n){
  if(/^(4011|4312|4389|4514|4576|5041|5066|5067|509|6277|6362|6363|650|6516|6550)/.test(n))return "Elo";
  if(/^(606282|3841)/.test(n))return "Hipercard";
  if(/^3[47]/.test(n))return "Amex";
  if(/^(5[1-5]|2[2-7])/.test(n))return "Mastercard";
  if(/^4/.test(n))return "Visa";
  return "";
}
const maskCard=v=>{const d=digits(v).slice(0,19);return brand(d)==="Amex"?mask(d,"#### ###### #####"):d.replace(/(\d{4})(?=\d)/g,"$1 ");};
function expOk(v){
  const m=/^(\d{2})\/(\d{2})$/.exec(v);if(!m)return false;
  const mm=+m[1],yy=2000+ +m[2];if(mm<1||mm>12)return false;
  const now=new Date(),end=new Date(yy,mm,1);return end>now&&yy<=now.getFullYear()+15;
}

function fresh(){
  const u=window.NBAuth&&NBAuth.user;
  return {step:1,nome:u?u.name:"",email:u?u.email:"",cpf:"",tel:"",cep:"",rua:"",numero:"",semNumero:false,comp:"",bairro:"",cidade:"",uf:"",
    frete:"pac",pag:"pix",ccNum:"",ccNome:"",ccExp:"",ccCvv:"",parcelas:1};
}

function totals(){
  const items=NBStore.items(), sub=items.reduce((s,x)=>s+x.b.p*x.q,0);
  const fretes={
    pac:{nome:"PAC",prazo:"5 a 8 dias úteis",valor:sub>=NBStore.FREE?0:NBStore.SHIP},
    sedex:{nome:"SEDEX",prazo:"1 a 3 dias úteis",valor:24.9},
    retirada:{nome:"Retirar na livraria",prazo:"Pronto em 2 dias úteis, na Vila Madalena",valor:0}
  };
  const frete=fretes[S.frete], desconto=S.pag==="pix"?Math.round(sub*PIX_OFF*100)/100:0;
  const total=Math.max(0,sub+frete.valor-desconto);
  const maxP=Math.max(1,Math.min(MAX_PARCELAS,Math.floor(total/MIN_PARCELA)));
  if(S.parcelas>maxP)S.parcelas=maxP;
  return {items,sub,fretes,frete,desconto,total,maxP,n:items.reduce((s,x)=>s+x.q,0)};
}

const brl=v=>NBStore.brl(v), esc=s=>NBStore.esc(s);
function fld(id,label,attrs="",cls=""){
  return `<div class="cf ${cls}"><label for="${id}">${label}</label><input id="${id}" ${attrs}><small class="cf-err" id="${id}Err"></small></div>`;
}

function render(){
  const t=totals();
  page.innerHTML=`
  <nav class="crumbs" aria-label="Você está em"><button type="button" data-co-exit>Início</button><span>/</span><span>Finalizar compra</span></nav>
  <div class="co-demo" role="note"><svg viewBox="0 0 32 32" aria-hidden="true"><use href="#i-leaf"/></svg>
    <p><b>Projeto de estudo.</b> Nenhuma compra é feita e nada é cobrado. Os dados digitados ficam só no seu navegador. Não use um cartão real: para testar, use <button type="button" class="co-copy" data-test-card>4242 4242 4242 4242</button>.</p></div>
  <h1 class="co-title">Finalizar compra</h1>
  <ol class="co-steps" aria-label="Etapas">${STEPS.map((s,i)=>`<li data-s="${i+1}"><span>${i+1}</span>${s}</li>`).join("")}</ol>
  <div class="co-grid">
    <form id="coForm" novalidate autocomplete="on">
      <section class="co-step" data-step="1" aria-labelledby="coS1">
        <h2 id="coS1">Seus dados</h2>
        <div class="cf-grid">
          ${fld("coNome","Nome completo",`autocomplete="name" maxlength="80" value="${esc(S.nome)}"`,"full")}
          ${fld("coEmail","E-mail",`type="email" autocomplete="email" value="${esc(S.email)}"`,"full")}
          ${fld("coCpf","CPF",`inputmode="numeric" autocomplete="off" placeholder="000.000.000-00" value="${esc(S.cpf)}"`)}
          ${fld("coTel","Celular",`type="tel" inputmode="tel" autocomplete="tel-national" placeholder="(11) 91234-5678" value="${esc(S.tel)}"`)}
        </div>
        <div class="co-nav"><span></span><button type="button" class="btn btn-primary" data-next>Continuar para entrega</button></div>
      </section>

      <section class="co-step" data-step="2" aria-labelledby="coS2" hidden>
        <h2 id="coS2">Endereço de entrega</h2>
        <div class="cf-grid">
          ${fld("coCep","CEP",`inputmode="numeric" autocomplete="postal-code" placeholder="00000-000" value="${esc(S.cep)}"`)}
          <p class="cep-status" id="cepStatus" role="status"></p>
          ${fld("coRua","Rua",`autocomplete="address-line1" value="${esc(S.rua)}"`,"full")}
          <div class="cf"><label for="coNumero">Número</label><input id="coNumero" inputmode="numeric" autocomplete="off" value="${esc(S.numero)}" ${S.semNumero?"disabled":""}>
            <label class="chk sm"><input id="coSemNumero" type="checkbox" ${S.semNumero?"checked":""}> Sem número</label><small class="cf-err" id="coNumeroErr"></small></div>
          ${fld("coComp","Complemento <i>(opcional)</i>",`autocomplete="address-line2" placeholder="Apto, bloco, referência" value="${esc(S.comp)}"`)}
          ${fld("coBairro","Bairro",`value="${esc(S.bairro)}"`)}
          ${fld("coCidade","Cidade",`autocomplete="address-level2" value="${esc(S.cidade)}"`)}
          <div class="cf"><label for="coUf">Estado</label><select id="coUf" autocomplete="address-level1"><option value="">UF</option>${UFS.map(u=>`<option ${u===S.uf?"selected":""}>${u}</option>`).join("")}</select><small class="cf-err" id="coUfErr"></small></div>
        </div>
        <h3 class="co-sub">Forma de entrega</h3>
        <div class="opts" role="radiogroup" aria-label="Forma de entrega" id="freteOpts"></div>
        <div class="co-nav"><button type="button" class="btn btn-ghost" data-prev>Voltar</button><button type="button" class="btn btn-primary" data-next>Continuar para pagamento</button></div>
      </section>

      <section class="co-step" data-step="3" aria-labelledby="coS3" hidden>
        <h2 id="coS3">Forma de pagamento</h2>
        <div class="opts pay" role="radiogroup" aria-label="Forma de pagamento">
          ${payOpt("pix","Pix","5% de desconto · aprovação na hora")}
          ${payOpt("cartao","Cartão de crédito",`até ${MAX_PARCELAS}x sem juros`)}
          ${payOpt("boleto","Boleto bancário","vence em 3 dias úteis")}
        </div>
        <div class="pay-box" data-pay="pix"><p>Ao confirmar, um QR Code Pix seria gerado com validade de 30 minutos. O desconto de 5% já está no resumo.</p></div>
        <div class="pay-box" data-pay="boleto"><p>Ao confirmar, o boleto seria gerado para pagamento em qualquer banco ou lotérica. A compensação leva até 2 dias úteis.</p></div>
        <div class="pay-box" data-pay="cartao">
          <p class="co-warn">Não digite dados de um cartão real. Para testar, use 4242 4242 4242 4242, qualquer validade futura e qualquer CVV.</p>
          <div class="cf-grid">
            <div class="cf full"><label for="ccNum">Número do cartão</label><div class="cc-wrap"><input id="ccNum" inputmode="numeric" autocomplete="off" placeholder="0000 0000 0000 0000" value="${esc(S.ccNum)}"><span class="cc-brand" id="ccBrand"></span></div><small class="cf-err" id="ccNumErr"></small></div>
            ${fld("ccNome","Nome impresso no cartão",`autocomplete="off" value="${esc(S.ccNome)}" style="text-transform:uppercase"`,"full")}
            ${fld("ccExp","Validade",`inputmode="numeric" autocomplete="off" placeholder="MM/AA" value="${esc(S.ccExp)}"`)}
            ${fld("ccCvv","CVV",`inputmode="numeric" autocomplete="off" placeholder="123" maxlength="4" value="${esc(S.ccCvv)}"`)}
            <div class="cf full"><label for="ccParc">Parcelas</label><select id="ccParc"></select></div>
          </div>
        </div>
        <div class="co-nav"><button type="button" class="btn btn-ghost" data-prev>Voltar</button><button type="button" class="btn btn-primary" data-next>Revisar pedido</button></div>
      </section>

      <section class="co-step" data-step="4" aria-labelledby="coS4" hidden>
        <h2 id="coS4">Revise seu pedido</h2>
        <div class="review" id="review"></div>
        <div class="co-nav"><button type="button" class="btn btn-ghost" data-prev>Voltar</button><button type="button" class="btn btn-primary" data-confirm>Confirmar pedido</button></div>
      </section>
    </form>
    <aside class="co-sum" aria-label="Resumo do pedido" id="coSum"></aside>
  </div>`;
  renderFrete();renderParcelas();renderSummary();showStep(S.step,false);
  syncPay();updateBrand();
}
function payOpt(v,title,sub){
  return `<label class="opt"><input type="radio" name="pag" value="${v}" ${S.pag===v?"checked":""}><span class="opt-body"><b>${title}</b><small>${sub}</small></span></label>`;
}
function renderFrete(){
  const t=totals();
  $("#freteOpts").innerHTML=Object.entries(t.fretes).map(([k,f])=>`<label class="opt"><input type="radio" name="frete" value="${k}" ${S.frete===k?"checked":""}><span class="opt-body"><b>${f.nome}</b><small>${f.prazo}</small></span><span class="opt-price">${f.valor?brl(f.valor):"Grátis"}</span></label>`).join("");
}
function renderParcelas(){
  const t=totals(), sel=$("#ccParc");if(!sel)return;
  sel.innerHTML=Array.from({length:t.maxP},(_,i)=>i+1).map(n=>`<option value="${n}" ${n===S.parcelas?"selected":""}>${n}x de ${brl(t.total/n)} sem juros${n===1?" (à vista)":""}</option>`).join("");
}
function renderSummary(){
  const t=totals();
  $("#coSum").innerHTML=`<h2>Resumo</h2>
    <ul class="sum-items">${t.items.map(({b,q})=>`<li><span class="mini">${NBStore.cover(b)}</span><span><b>${esc(b.t)}</b><small>${q} × ${brl(b.p)}</small></span><span class="pr">${brl(b.p*q)}</span></li>`).join("")}</ul>
    <div class="ln"><span>Subtotal (${t.n} ${t.n===1?"item":"itens"})</span><span>${brl(t.sub)}</span></div>
    <div class="ln"><span>Entrega · ${t.frete.nome}</span><span>${t.frete.valor?brl(t.frete.valor):"Grátis"}</span></div>
    ${t.desconto?`<div class="ln off"><span>Desconto Pix (5%)</span><span>− ${brl(t.desconto)}</span></div>`:""}
    <div class="ln tot"><span>Total</span><span>${brl(t.total)}</span></div>
    ${S.pag==="cartao"&&S.parcelas>1?`<p class="sum-note">${S.parcelas}x de ${brl(t.total/S.parcelas)} sem juros</p>`:""}`;
}

function showStep(n,scroll=true){
  S.step=n;
  $$(".co-step").forEach(s=>s.hidden=+s.dataset.step!==n);
  $$(".co-steps li").forEach(li=>{const k=+li.dataset.s;li.classList.toggle("done",k<n);li.classList.toggle("on",k===n);if(k===n)li.setAttribute("aria-current","step");else li.removeAttribute("aria-current");});
  if(n===4)renderReview();
  if(scroll)page.scrollIntoView({behavior:"smooth",block:"start"});
  const first=$(`.co-step[data-step="${n}"] input:not([disabled]),.co-step[data-step="${n}"] button`);
  if(scroll&&first)setTimeout(()=>first.focus({preventScroll:true}),350);
}

function setErr(id,msg){
  const el=$("#"+id), e=$("#"+id+"Err");
  if(e)e.textContent=msg||"";
  if(el){if(msg)el.setAttribute("aria-invalid","true");else el.removeAttribute("aria-invalid");}
  return !msg;
}
function validate(step){
  const checks=[];
  if(step===1){
    checks.push(["coNome",S.nome.trim().split(/\s+/).length>=2?"":"Informe nome e sobrenome."]);
    checks.push(["coEmail",/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(S.email.trim())?"":"Informe um e-mail válido, como nome@exemplo.com."]);
    checks.push(["coCpf",cpfOk(S.cpf)?"":digits(S.cpf).length<11?"Digite os 11 números do CPF.":"Este CPF não é válido. Confira os números."]);
    checks.push(["coTel",[10,11].includes(digits(S.tel).length)?"":"Informe o celular com DDD."]);
  }
  if(step===2&&S.frete!=="retirada"){
    checks.push(["coCep",digits(S.cep).length===8?"":"Digite os 8 números do CEP."]);
    checks.push(["coRua",S.rua.trim()?"":"Informe a rua."]);
    checks.push(["coNumero",S.semNumero||S.numero.trim()?"":"Informe o número ou marque “Sem número”."]);
    checks.push(["coBairro",S.bairro.trim()?"":"Informe o bairro."]);
    checks.push(["coCidade",S.cidade.trim()?"":"Informe a cidade."]);
    checks.push(["coUf",S.uf?"":"Escolha o estado."]);
  }
  if(step===2&&S.frete==="retirada")["coCep","coRua","coNumero","coBairro","coCidade","coUf"].forEach(id=>setErr(id,""));
  if(step===3&&S.pag==="cartao"){
    const n=digits(S.ccNum);
    checks.push(["ccNum",n.length>=13&&luhn(n)?"":"Número de cartão inválido. Para testar, use 4242 4242 4242 4242."]);
    checks.push(["ccNome",S.ccNome.trim().length>=3?"":"Informe o nome como está no cartão."]);
    checks.push(["ccExp",expOk(S.ccExp)?"":"Use uma validade futura no formato MM/AA."]);
    checks.push(["ccCvv",new RegExp(`^\\d{${brand(n)==="Amex"?4:3}}$`).test(S.ccCvv)?"":`O CVV tem ${brand(n)==="Amex"?4:3} números.`]);
  }
  let firstBad=null;
  checks.forEach(([id,msg])=>{if(!setErr(id,msg)&&!firstBad)firstBad=id;});
  if(firstBad)$("#"+firstBad).focus();
  return !firstBad;
}

function renderReview(){
  const t=totals();
  const cpf=digits(S.cpf), cpfMasked=`***.${cpf.slice(3,6)}.${cpf.slice(6,9)}-**`;
  const end=S.frete==="retirada"?"Retirada na Nature Books · Rua das Acácias, 120, Vila Madalena, São Paulo":
    `${esc(S.rua)}, ${S.semNumero?"s/n":esc(S.numero)}${S.comp?` · ${esc(S.comp)}`:""}<br>${esc(S.bairro)} · ${esc(S.cidade)}/${S.uf} · CEP ${esc(maskCep(S.cep))}`;
  const pag=S.pag==="pix"?`Pix · ${brl(t.total)} com 5% de desconto`:S.pag==="boleto"?`Boleto bancário · ${brl(t.total)}`:
    `${brand(digits(S.ccNum))||"Cartão"} •••• ${digits(S.ccNum).slice(-4)} · ${S.parcelas}x de ${brl(t.total/S.parcelas)}`;
  $("#review").innerHTML=`
    <div class="rv-b"><div><h3>Dados</h3><p>${esc(S.nome)}<br>${esc(S.email)} · ${esc(maskTel(S.tel))}<br>CPF ${cpfMasked}</p></div><button type="button" class="linkbtn" data-goto="1">Alterar</button></div>
    <div class="rv-b"><div><h3>Entrega · ${t.frete.nome}</h3><p>${end}<br><small>${t.frete.prazo}</small></p></div><button type="button" class="linkbtn" data-goto="2">Alterar</button></div>
    <div class="rv-b"><div><h3>Pagamento</h3><p>${pag}</p></div><button type="button" class="linkbtn" data-goto="3">Alterar</button></div>`;
}

function syncPay(){
  $$(".pay-box").forEach(b=>b.hidden=b.dataset.pay!==S.pag);
}
function updateBrand(){const el=$("#ccBrand");if(el)el.textContent=brand(digits(S.ccNum));}

const FIELDS={coNome:"nome",coEmail:"email",coCpf:"cpf",coTel:"tel",coCep:"cep",coRua:"rua",coNumero:"numero",coComp:"comp",coBairro:"bairro",coCidade:"cidade",coUf:"uf",ccNum:"ccNum",ccNome:"ccNome",ccExp:"ccExp",ccCvv:"ccCvv"};
const MASKS={coCpf:maskCpf,coTel:maskTel,coCep:maskCep,ccNum:maskCard,ccExp:maskExp,ccCvv:v=>digits(v).slice(0,4),coNumero:v=>v.slice(0,10)};

let cepCtl=null;
async function lookupCep(){
  const cep=digits(S.cep), st=$("#cepStatus");
  if(cep.length!==8){st.textContent="";return;}
  if(cepCtl)cepCtl.abort();
  cepCtl=new AbortController();const ctl=cepCtl;
  const timer=setTimeout(()=>ctl.abort(),6000);
  st.textContent="Buscando endereço…";
  try{
    const r=await fetch(`https://viacep.com.br/ws/${cep}/json/`,{signal:ctl.signal});
    const d=await r.json();
    if(d.erro){st.textContent="CEP não encontrado. Preencha o endereço manualmente.";return;}
    Object.assign(S,{rua:d.logradouro||S.rua,bairro:d.bairro||S.bairro,cidade:d.localidade||S.cidade,uf:d.uf||S.uf});
    $("#coRua").value=S.rua;$("#coBairro").value=S.bairro;$("#coCidade").value=S.cidade;$("#coUf").value=S.uf;
    ["coRua","coBairro","coCidade","coUf"].forEach(id=>setErr(id,""));
    st.textContent=`Endereço encontrado: ${d.localidade}/${d.uf}.`;
    $(S.rua?"#coNumero":"#coRua").focus();
  }catch(e){
    if(ctl===cepCtl)st.textContent="Não foi possível consultar o CEP agora. Preencha o endereço manualmente.";
  }finally{clearTimeout(timer);}
}

page.addEventListener("input",e=>{
  const id=e.target.id;
  if(MASKS[id]){const v=MASKS[id](e.target.value);if(v!==e.target.value)e.target.value=v;}
  if(FIELDS[id]){S[FIELDS[id]]=e.target.value;if(e.target.getAttribute("aria-invalid"))setErr(id,"");}
  if(id==="coCep")lookupCep();
  if(id==="ccNum"){updateBrand();const c=$("#ccCvv");if(c&&brand(digits(S.ccNum))!=="Amex"&&S.ccCvv.length>3){S.ccCvv=S.ccCvv.slice(0,3);c.value=S.ccCvv;}}
});
page.addEventListener("change",e=>{
  const t=e.target;
  if(t.name==="frete"){S.frete=t.value;renderSummary();renderParcelas();}
  if(t.name==="pag"){S.pag=t.value;syncPay();renderParcelas();renderSummary();}
  if(t.id==="ccParc"){S.parcelas=+t.value;renderSummary();}
  if(t.id==="coUf"){S.uf=t.value;setErr("coUf","");}
  if(t.id==="coSemNumero"){S.semNumero=t.checked;const n=$("#coNumero");n.disabled=t.checked;if(t.checked){n.value="";S.numero="";setErr("coNumero","");}else n.focus();}
});
page.addEventListener("click",e=>{
  const b=e.target.closest("button");if(!b)return;
  if(b.hasAttribute("data-next")){if(validate(S.step))showStep(S.step+1);}
  else if(b.hasAttribute("data-prev"))showStep(S.step-1);
  else if(b.dataset.goto)showStep(+b.dataset.goto);
  else if(b.hasAttribute("data-confirm"))confirmOrder();
  else if(b.hasAttribute("data-co-exit"))exit();
  else if(b.hasAttribute("data-co-done"))finish();
  else if(b.hasAttribute("data-test-card")){
    if(S.step===3&&S.pag==="cartao"){S.ccNum="4242 4242 4242 4242";$("#ccNum").value=S.ccNum;updateBrand();setErr("ccNum","");}
    else NBStore.toast("Escolha “Cartão de crédito” na etapa de pagamento para usar o cartão de teste.");
  }
});
$("#checkoutPage").addEventListener("submit",e=>e.preventDefault());

function fakeQr(){
  let x=7,cells="";const N=25,rnd=()=>(x=(x*16807)%2147483647)/2147483647;
  const finder=(cx,cy)=>`<rect x="${cx}" y="${cy}" width="7" height="7" fill="none" stroke="currentColor"/><rect x="${cx+2}" y="${cy+2}" width="3" height="3"/>`;
  for(let i=0;i<N;i++)for(let j=0;j<N;j++){
    const inF=(i<8&&j<8)||(i<8&&j>N-9)||(i>N-9&&j<8);
    if(!inF&&rnd()>.52)cells+=`<rect x="${j}" y="${i}" width="1" height="1"/>`;
  }
  return `<svg viewBox="-1 -1 27 27" class="qr" aria-hidden="true" fill="currentColor" stroke-width="1" shape-rendering="crispEdges">${cells}${finder(0.5,0.5)}${finder(N-7.5,0.5)}${finder(0.5,N-7.5)}</svg>`;
}

function confirmOrder(){
  const t=totals();
  const preview=S.pag==="pix"?`<div class="pv pv-pix">${fakeQr()}<div><b>QR Code ilustrativo</b><p>Não é um Pix de verdade e não pode ser pago.</p></div></div>`:
    S.pag==="boleto"?`<div class="pv"><b>Linha digitável ilustrativa</b><p class="mono">00000.00000 00000.000000 00000.000000 0 00000000000000</p><p>Não é um boleto de verdade e não pode ser pago.</p></div>`:
    `<div class="pv"><b>${brand(digits(S.ccNum))||"Cartão"} •••• ${digits(S.ccNum).slice(-4)}</b><p>${S.parcelas}x de ${brl(t.total/S.parcelas)}. Nenhuma cobrança foi feita no cartão.</p></div>`;
  const resumo={total:t.total,frete:t.frete,pag:S.pag,cidade:S.frete==="retirada"?"Retirada na livraria":`${S.cidade}/${S.uf}`};
  NBStore.clear();
  S=fresh();
  page.innerHTML=`
  <div class="co-done">
    <svg class="leaf" viewBox="0 0 32 32" aria-hidden="true"><use href="#i-leaf"/></svg>
    <span class="eyebrow">Simulação concluída</span>
    <h1>Site apenas para fins de estudo</h1>
    <p class="lead">Seu pedido não foi realizado e nenhum valor foi cobrado. A Nature Books é um projeto de portfólio: o caminho de compra funciona de verdade na tela, mas termina aqui.</p>
    <div class="done-card">
      <div class="ln"><span>Total que seria pago</span><b>${brl(resumo.total)}</b></div>
      <div class="ln"><span>Entrega</span><span>${resumo.frete.nome} · ${esc(resumo.cidade)}</span></div>
      <div class="ln"><span>Pagamento</span><span>${{pix:"Pix",boleto:"Boleto",cartao:"Cartão de crédito"}[resumo.pag]}</span></div>
      ${preview}
    </div>
    <p class="note">Os dados digitados (nome, CPF, endereço e cartão) não foram enviados a nenhum servidor nem salvos, e já foram apagados desta página. A sacola foi esvaziada.</p>
    <button type="button" class="btn btn-primary" data-co-done>Voltar à loja</button>
  </div>`;
  page.scrollIntoView({behavior:"instant",block:"start"});
  window.scrollTo({top:0,behavior:"instant"});
}

function open(){
  if(!NBStore.items().length){NBStore.toast("Sua sacola está vazia.");return;}
  S=S||fresh();
  if(window.NBAuth&&NBAuth.user){S.nome=S.nome||NBAuth.user.name;S.email=S.email||NBAuth.user.email;}
  NBStore.showPage("checkoutPage");
  render();
  window.scrollTo({top:0,behavior:"instant"});
}
function exit(){NBStore.goTo("inicio");}
function finish(){S=null;NBStore.goTo("encontre");}

function leave(){if(S)Object.assign(S,{ccNum:"",ccNome:"",ccExp:"",ccCvv:"",parcelas:1,step:Math.min(S.step,3)});}

window.NBCheckout={open,leave,reset(){S=null;}};
})();
