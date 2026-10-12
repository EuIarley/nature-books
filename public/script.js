(function(){
"use strict";
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const brl=n=>n.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const store={get(k,d){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};

const CATS={
  literatura:{n:"Literatura em português",c:["#7A5A3E","#5E4630","#8C6A48"],f:"#F2E6CF"},
  internacional:{n:"Literatura internacional",c:["#3F5A4A","#56705C","#2F4A3C"],f:"#EFE7D2"},
  romance:{n:"Romance",c:["#B98B7E","#A0776B","#B5917F"],f:"#FBF1E8"},
  misterio:{n:"Mistério e suspense",c:["#2F3440","#3C3A33","#454B3E"],f:"#E2D6B8"},
  fantasia:{n:"Fantasia",c:["#4D5B3A","#6A6A3E","#3E4F3B"],f:"#EADFB9"},
  scifi:{n:"Ficção científica",c:["#3B4B57","#4A5866","#2E3B45"],f:"#DDE3DA"},
  dev:{n:"Desenvolvimento pessoal",c:["#C7B48D","#B7A67E","#D4C3A0"],f:"#3A3324"},
  natureza:{n:"Natureza e meio ambiente",c:["#6E7F4D","#5B6B3F","#81915D"],f:"#F4EEDC"},
  historia:{n:"Biografia e história",c:["#8E7A5C","#7B6A50","#9C8A6B"],f:"#F5EEDD"},
  arte:{n:"Arte e criatividade",c:["#D9CDB3","#CBBB9B","#E2D7C0"],f:"#3A2F24"}
};
const GROUPS={ficcao:["literatura","internacional","fantasia"]};

const RAW={
literatura:`Dom Casmurro|Machado de Assis|39.9|1899|Bentinho revisita a memória e o ciúme em torno de Capitu e de seus olhos de ressaca.
Memórias Póstumas de Brás Cubas|Machado de Assis|42.9|1881|Um defunto autor narra a própria vida com ironia, melancolia e humor ácido.
O Alienista|Machado de Assis|29.9|1882|Em Itaguaí, um médico decide estudar a loucura e acaba internando a cidade inteira.
Grande Sertão: Veredas|João Guimarães Rosa|59.9|1956|Riobaldo conta sua travessia pelo sertão, entre jagunços, pactos e o amor por Diadorim.
Capitães da Areia|Jorge Amado|44.9|1937|Meninos de rua de Salvador vivem aventuras, perdas e amizade nas areias do cais.
Vidas Secas|Graciliano Ramos|34.9|1938|Fabiano e sua família atravessam a seca nordestina em busca de um lugar para viver.
O Cortiço|Aluísio Azevedo|37.9|1890|A vida intensa de um cortiço carioca, onde ambição e desejo moldam cada morador.
Iracema|José de Alencar|29.9|1865|A lenda poética do Ceará, contada pelo amor entre a virgem dos lábios de mel e Martim.
A Moreninha|Joaquim Manuel de Macedo|27.9|1844|Uma aposta entre estudantes, uma ilha encantadora e um romance que marcou época.
Triste Fim de Policarpo Quaresma|Lima Barreto|32.9|1915|Um patriota sonhador tenta salvar o Brasil e esbarra na realidade da República.`,
internacional:`O Pequeno Príncipe|Antoine de Saint-Exupéry|34.9|1943|Um pequeno viajante de outro planeta ensina sobre amizade, cuidado e o que é essencial.
1984|George Orwell|39.9|1949|Sob o olhar constante do Grande Irmão, Winston ousa pensar por conta própria.
A Revolução dos Bichos|George Orwell|32.9|1945|Os animais tomam a fazenda, mas alguns logo se tornam mais iguais que os outros.
Admirável Mundo Novo|Aldous Huxley|44.9|1932|Uma sociedade perfeita e controlada, onde a felicidade tem um preço alto demais.
Fahrenheit 451|Ray Bradbury|39.9|1953|Um bombeiro que queima livros começa a se perguntar o que existe dentro deles.
O Sol é Para Todos|Harper Lee|49.9|1960|Pelos olhos de Scout, uma pequena cidade do Alabama encara o preconceito e a justiça.
O Grande Gatsby|F. Scott Fitzgerald|34.9|1925|Festas deslumbrantes e um amor perdido no brilho e no vazio da Era do Jazz.
Orgulho e Preconceito|Jane Austen|39.9|1813|Elizabeth Bennet e o senhor Darcy aprendem que as primeiras impressões enganam.
Jane Eyre|Charlotte Brontë|49.9|1847|Uma governanta independente enfrenta segredos sombrios na mansão de Thornfield.
O Morro dos Ventos Uivantes|Emily Brontë|44.9|1847|Uma paixão selvagem e destrutiva entre Heathcliff e Catherine nas charnecas inglesas.`,
romance:`Como Eu Era Antes de Você|Jojo Moyes|42.9|2012|Lou e Will mudam a vida um do outro de formas que nenhum dos dois esperava.
Um Dia|David Nicholls|44.9|2009|Emma e Dexter, reencontrados no mesmo dia de cada ano, ao longo de duas décadas.
A Culpa é das Estrelas|John Green|39.9|2012|Hazel e Gus vivem um amor intenso, engraçado e cheio de coragem.
Quem é Você, Alasca?|John Green|37.9|2005|Em um internato, Miles parte em busca de um grande talvez e encontra Alasca.
Diário de uma Paixão|Nicholas Sparks|39.9|1996|Noah e Allie e um amor de verão que resiste ao tempo e à memória.
Querido John|Nicholas Sparks|42.9|2006|Cartas, distância e escolhas difíceis entre um soldado e a mulher que ele ama.
Um Amor para Recordar|Nicholas Sparks|37.9|1999|Landon descobre em Jamie um amor que transforma tudo ao seu redor.
P.S. Eu Te Amo|Cecelia Ahern|39.9|2004|Depois de perder o marido, Holly recebe cartas que a ajudam a recomeçar.
Vermelho, Branco e Sangue Azul|Casey McQuiston|49.9|2019|O filho da presidente dos EUA e um príncipe britânico: de rivais a algo muito maior.
Teto Para Dois|Beth O'Leary|44.9|2019|Tiffy e Leon dividem um apartamento e uma cama, mas nunca se encontram.`,
misterio:`E Não Sobrou Nenhum|Agatha Christie|42.9|1939|Dez desconhecidos isolados em uma ilha começam a desaparecer, um a um.
Assassinato no Expresso do Oriente|Agatha Christie|39.9|1934|Um trem parado na neve, um crime e Hercule Poirot diante de doze suspeitos.
Morte no Nilo|Agatha Christie|39.9|1937|Uma lua de mel no Egito termina em assassinato a bordo de um cruzeiro.
O Assassinato de Roger Ackroyd|Agatha Christie|42.9|1926|Um vilarejo inglês, um crime chocante e um dos finais mais ousados do gênero.
O Cão dos Baskervilles|Arthur Conan Doyle|37.9|1902|Sherlock Holmes investiga a lenda de um cão infernal nas charnecas de Devon.
O Silêncio dos Inocentes|Thomas Harris|49.9|1988|Clarice Starling busca a ajuda do brilhante e perigoso Hannibal Lecter.
Garota Exemplar|Gillian Flynn|49.9|2012|No quinto aniversário de casamento, Amy desaparece e Nick vira o principal suspeito.
A Paciente Silenciosa|Alex Michaelides|44.9|2019|Alicia mata o marido e nunca mais fala. Um terapeuta decide descobrir por quê.
Verity|Colleen Hoover|49.9|2018|Uma escritora encontra uma autobiografia perturbadora na casa de outra autora.
Antes de Dormir|S. J. Watson|39.9|2011|Christine acorda todos os dias sem memória e descobre que não pode confiar em ninguém.`,
fantasia:`O Hobbit|J. R. R. Tolkien|49.9|1937|Bilbo Bolseiro deixa o conforto do Condado para uma jornada com anões e um dragão.
O Senhor dos Anéis: A Sociedade do Anel|J. R. R. Tolkien|59.9|1954|Frodo recebe um anel perigoso e parte com companheiros rumo ao desconhecido.
O Senhor dos Anéis: As Duas Torres|J. R. R. Tolkien|59.9|1954|A Sociedade se divide e cada caminho leva a novas batalhas na Terra-média.
O Senhor dos Anéis: O Retorno do Rei|J. R. R. Tolkien|59.9|1955|A guerra pelo destino da Terra-média chega ao fim aos pés da Montanha da Perdição.
Harry Potter e a Pedra Filosofal|J. K. Rowling|49.9|1997|Aos onze anos, Harry descobre que é bruxo e chega a Hogwarts.
Harry Potter e a Câmara Secreta|J. K. Rowling|49.9|1998|Vozes nas paredes e alunos petrificados marcam um novo ano em Hogwarts.
Harry Potter e o Prisioneiro de Azkaban|J. K. Rowling|49.9|1999|Um prisioneiro perigoso escapa, e o passado de Harry vem à tona.
Harry Potter e o Cálice de Fogo|J. K. Rowling|54.9|2000|O Torneio Tribruxo coloca Harry diante de provas que podem custar sua vida.
As Crônicas de Nárnia|C. S. Lewis|59.9|1950|Atrás do guarda-roupa, um mundo de faunos, feiticeiras e um leão chamado Aslam.
Alice no País das Maravilhas|Lewis Carroll|34.9|1865|Uma toca de coelho leva Alice a um mundo de lógica absurda e encantadora.`,
scifi:`Duna|Frank Herbert|59.9|1965|No planeta desértico Arrakis, Paul Atreides cumpre um destino maior que ele mesmo.
Fundação|Isaac Asimov|49.9|1951|Hari Seldon prevê a queda do Império e planeja preservar o conhecimento humano.
Eu, Robô|Isaac Asimov|39.9|1950|Contos que exploram as Três Leis da Robótica e os dilemas que elas criam.
2001: Uma Odisseia no Espaço|Arthur C. Clarke|44.9|1968|Um monólito misterioso guia a humanidade da pré-história até as estrelas.
O Guia do Mochileiro das Galáxias|Douglas Adams|39.9|1979|A Terra é demolida e Arthur Dent pega carona pela galáxia, levando sua toalha.
Neuromancer|William Gibson|44.9|1984|Um hacker decadente é recrutado para o golpe definitivo no ciberespaço.
Solaris|Stanislaw Lem|42.9|1961|Um oceano vivo confronta os cientistas com suas memórias mais profundas.
O Homem Invisível|H. G. Wells|34.9|1897|Um cientista descobre a invisibilidade e perde o controle de si mesmo.
A Guerra dos Mundos|H. G. Wells|34.9|1898|Marcianos invadem a Inglaterra vitoriana em um marco da ficção científica.
Frankenstein|Mary Shelley|39.9|1818|Victor Frankenstein dá vida a uma criatura e passa a fugir da própria criação.`,
dev:`Hábitos Atômicos|James Clear|54.9|2018|Pequenas mudanças diárias que, somadas, geram resultados extraordinários.
O Poder do Hábito|Charles Duhigg|49.9|2012|Como os hábitos funcionam e como transformá-los na vida e no trabalho.
Mindset|Carol S. Dweck|49.9|2006|A diferença entre a mentalidade fixa e a de crescimento, e como ela muda tudo.
Essencialismo|Greg McKeown|49.9|2014|Fazer menos, porém melhor: a disciplina de escolher o que realmente importa.
O Poder do Agora|Eckhart Tolle|44.9|1997|Um convite para viver o presente e se libertar do ruído constante da mente.
A Coragem de Ser Imperfeito|Brené Brown|44.9|2012|A vulnerabilidade como força para viver, amar e liderar com coragem.
Mais Esperto que o Diabo|Napoleon Hill|39.9|2011|Um diálogo provocador sobre medo, persistência e liberdade de pensamento.
Quem Pensa Enriquece|Napoleon Hill|39.9|1937|Princípios clássicos sobre propósito, persistência e realização pessoal.
Como Fazer Amigos e Influenciar Pessoas|Dale Carnegie|42.9|1936|Lições atemporais sobre comunicação, empatia e boas relações.
A Sutil Arte de Ligar o F*da-se|Mark Manson|44.9|2016|Um guia sem rodeios para escolher com cuidado o que merece sua energia.`,
natureza:`A Vida Secreta das Árvores|Peter Wohlleben|54.9|2015|Árvores se comunicam, cuidam umas das outras e formam verdadeiras comunidades.
A Sabedoria das Florestas|Peter Wohlleben|49.9|2017|As conexões invisíveis entre plantas, animais e pessoas na floresta.
Primavera Silenciosa|Rachel Carson|49.9|1962|O livro que alertou o mundo sobre os pesticidas e inspirou o movimento ambiental.
A Sexta Extinção|Elizabeth Kolbert|54.9|2014|Uma investigação sobre a extinção em massa que nós mesmos estamos provocando.
Uma História Natural da Humanidade|Joseph Henrich|59.9|2015|Como a cultura e a cooperação moldaram a evolução da nossa espécie.
O Encanto das Árvores|Francis Hallé|49.9|2005|Um botânico apaixonado revela a beleza e a inteligência das árvores.
A Botânica de Shakespeare|Margaret Willes|44.9|2015|Flores, ervas e árvores que florescem nas peças e nos poemas de Shakespeare.
A Invenção da Natureza|Andrea Wulf|59.9|2015|A vida de Alexander von Humboldt, o explorador que mudou nossa visão da natureza.
Walden|Henry David Thoreau|42.9|1854|Dois anos à beira de um lago, em busca de uma vida simples e consciente.
O Livro das Árvores|Diversos autores|54.9|2020|Um guia ilustrado das árvores, suas histórias, folhas e paisagens.`,
historia:`O Diário de Anne Frank|Anne Frank|39.9|1947|O diário de uma jovem escondida durante a ocupação nazista em Amsterdã.
Steve Jobs|Walter Isaacson|59.9|2011|A biografia do cofundador da Apple, construída a partir de centenas de entrevistas.
Einstein: Sua Vida, Seu Universo|Walter Isaacson|59.9|2007|A vida, a mente curiosa e as descobertas do físico que mudou a ciência.
Leonardo da Vinci|Walter Isaacson|59.9|2017|Os cadernos e a curiosidade sem limites do grande gênio do Renascimento.
A Autobiografia de Malcolm X|Malcolm X e Alex Haley|49.9|1965|A trajetória de transformação de um dos maiores líderes dos direitos civis.
Longa Caminhada até a Liberdade|Nelson Mandela|54.9|1994|A autobiografia de Mandela, da infância à presidência da África do Sul.
Minha História|Michelle Obama|59.9|2018|Michelle Obama compartilha sua jornada de Chicago até a Casa Branca.
O Homem que Confundiu Sua Mulher com um Chapéu|Oliver Sacks|44.9|1985|Casos neurológicos fascinantes, contados com humanidade e curiosidade.
Sapiens|Yuval Noah Harari|59.9|2011|Uma breve história da humanidade, da savana africana à era digital.
Homo Deus|Yuval Noah Harari|59.9|2015|O que pode acontecer com a humanidade quando os velhos problemas forem vencidos.`,
arte:`Roube como um Artista|Austin Kleon|39.9|2012|Dez dicas para destravar a criatividade e encontrar a sua própria voz.
Mostre Seu Trabalho!|Austin Kleon|39.9|2014|Como compartilhar seu processo criativo e ser descoberto.
Isto é Arte?|Will Gompertz|49.9|2012|150 anos de arte moderna explicados com clareza e bom humor.
O Design do Dia a Dia|Don Norman|54.9|1988|Por que alguns objetos são fáceis de usar e outros só nos confundem.
A História da Arte|E. H. Gombrich|89.9|1950|O clássico que percorre a arte da pré-história ao século XX.
Criatividade S.A.|Ed Catmull|49.9|2014|Os bastidores da Pixar e como construir uma cultura verdadeiramente criativa.
O Caminho do Artista|Julia Cameron|54.9|1992|Um programa de doze semanas para recuperar a criatividade.
Steal Like an Artist|Austin Kleon|39.9|2012|Edição original em inglês do guia ilustrado de Austin Kleon.
A Arte da Guerra|Sun Tzu|32.9|-500|Estratégia milenar sobre conflito, preparo e sabedoria.
Meditações|Marco Aurélio|34.9|180|Reflexões do imperador estoico sobre virtude, serenidade e o tempo.`
};

const yearTxt=y=>y<0?"séc. V a.C.":y<1000?"c. "+y+" d.C.":String(y);
const rnd=n=>{const x=Math.sin(n*12.9898+78.233)*43758.5453;return x-Math.floor(x)};
const BEST=[11,45,89,61,12,1,41,51,23,37,71,42];
const NEW=[39,38,29,30,61,87,72,84,90,80,74,78];
const BOOKS=[];let id=0;
for(const cat in RAW){RAW[cat].trim().split("\n").forEach((ln,i)=>{
  const [t,a,p,y,d]=ln.split("|");id++;
  const best=BEST.includes(id);
  let rating=Math.round((4.1+rnd(id)*0.75+(best?.12:0))*10)/10; if(rating>4.9)rating=4.9;
  const reviews=Math.floor((90+rnd(id+3)*1900)*(best?2.2:1));
  BOOKS.push({id,t,a,p:+p,y:+y,d,cat,rating,reviews,avail:id%13!==0,best,isNew:NEW.includes(id),shade:i%3,motif:(id*7)%6});
});}

const DESC={
  literatura:["Um livro de {a} para conhecer a literatura em língua portuguesa de perto.","{a} em uma obra publicada em {y}, com a força da prosa em português.","Para ler com calma, sublinhar e voltar a reler: um título de {a}."],
  internacional:["Um romance de {a} que atravessa gerações de leitores desde {y}.","{a} em uma das obras que ajudam a contar a história da ficção mundial.","Uma narrativa de {a} para quem gosta de personagens marcantes."],
  romance:["Uma história de amor assinada por {a}, para ler numa tarde tranquila.","Encontros, desencontros e escolhas difíceis no romance de {a}.","{a} escreve sobre afeto, saudade e recomeços."],
  misterio:["Suspense de {a} para ler com as luzes acesas.","Pistas, segredos e reviravoltas na trama de {a}.","{a} constrói a tensão página a página, até o último capítulo."],
  fantasia:["Um mundo inteiro criado por {a}, cheio de magia e aventura.","{a} abre a porta para uma jornada fantástica, publicada em {y}.","Criaturas, reinos e coragem na fantasia de {a}."],
  scifi:["Ficção científica de {a} sobre futuro, tecnologia e humanidade.","{a} imagina outros mundos e outras perguntas sobre quem somos.","Uma viagem especulativa de {a}, publicada em {y}."],
  dev:["Ideias práticas de {a} para cultivar novos hábitos e escolhas.","{a} propõe reflexões para viver com mais clareza e intenção.","Um livro de {a} para ler aos poucos e aplicar no dia a dia."],
  natureza:["{a} convida a olhar com atenção para o mundo natural.","Ciência e curiosidade sobre a vida na Terra, por {a}.","Um ensaio de {a} sobre natureza, evolução e o nosso lugar no planeta."],
  historia:["Uma vida, ou uma época, contada por {a}.","{a} revisita pessoas e acontecimentos que mudaram o mundo.","Memória e história em um relato de {a}, publicado em {y}."],
  arte:["{a} reflete sobre arte, ideias e a forma como vemos o mundo.","Um livro de {a} para alimentar a curiosidade e a criatividade.","Pensamento e criação na obra de {a}, publicada em {y}."]
};
(window.NB_CATALOGO||[]).forEach(([t,a,p,y,cat,rating,reviews,cover,pages],i)=>{
  if(!CATS[cat])return;id++;
  const d=DESC[cat][id%3].replace(/\{a\}/g,a).replace(/\{y\}/g,yearTxt(y));
  BOOKS.push({id,t,a,p,y,d,cat,rating,reviews,avail:id%11!==0,best:false,isNew:false,shade:i%3,motif:(id*7)%6,cover,pages});
});
const byId=Object.fromEntries(BOOKS.map(b=>[b.id,b]));
const TOP_REV=[...BOOKS].sort((a,b)=>b.reviews-a.reviews).slice(0,10).map(b=>b.id);

const MOTIFS=[
 '<path d="M50 12C78 30 80 68 50 90 20 68 22 30 50 12z"/><path d="M50 18v72M50 40l-14-10M50 52l16-12M50 64l-16-10M50 76l14-10"/>',
 '<circle cx="50" cy="50" r="16"/><circle cx="50" cy="50" r="27" stroke-dasharray="2 5"/><circle cx="50" cy="50" r="38" opacity=".5"/>',
 '<path d="M8 80l26-34 16 18 14-24 28 40z"/><circle cx="72" cy="26" r="8"/>',
 '<path d="M62 14a36 36 0 1 0 22 58A30 30 0 0 1 62 14z"/><circle cx="26" cy="22" r="1.5" fill="currentColor"/><circle cx="80" cy="40" r="1.2" fill="currentColor"/>',
 '<path d="M50 94V10"/><path d="M50 22c-10-2-18 2-22 8M50 22c10-2 18 2 22 8M50 40c-12-2-22 2-26 10M50 40c12-2 22 2 26 10M50 58c-14-2-24 2-28 12M50 58c14-2 24 2 28 12M50 76c-10 0-18 4-20 10M50 76c10 0 18 4 20 10"/>',
 '<path d="M6 40c14-10 30-10 44 0s30 10 44 0M6 56c14-10 30-10 44 0s30 10 44 0M6 72c14-10 30-10 44 0s30 10 44 0"/>'
];
const NO_PHOTO=[72,76,77];
const coverSrc=(b,lg)=>b.cover?`https://covers.openlibrary.org/b/id/${b.cover}-${lg?"L":"M"}.jpg`:NO_PHOTO.includes(b.id)?"":`capas/${String(b.id).padStart(3,"0")}.jpg`;
const photo=(b,lg)=>{const src=coverSrc(b,lg);return src?`<img class="ph" src="${src}" alt="" loading="lazy" decoding="async" onerror="this.remove()">`:"";};
function cover(b,cls=""){
  const lg=cls.includes("lg");
  const c=CATS[b.cat];
  return `<div class="cover ${cls}" style="--c:${c.c[b.shade]};--f:${c.f}" role="img" aria-label="Capa de ${esc(b.t)}">
    <span class="fr"></span><span class="nb">Nature Books</span>
    <svg class="mo" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">${MOTIFS[b.motif]}</svg>
    <span class="tx"><span class="tt">${esc(b.t)}</span><span class="au">${esc(b.a)}</span></span>${photo(b,lg)}</div>`;
}
function badgeFor(b,ctx){
  if(ctx==="rec")return '<span class="badge">Recomendado</span>';
  if(b.best)return '<span class="badge b-best">Mais vendido</span>';
  if(b.isNew)return '<span class="badge">Novidade</span>';
  if(TOP_REV.includes(b.id))return '<span class="badge">Mais avaliado</span>';
  return "";
}
const fmtN=n=>n.toLocaleString("pt-BR");
const rateHTML=b=>`<span class="rate"><svg><use href="#i-star"/></svg>${b.rating.toFixed(1).replace(".",",")} <span>(${fmtN(b.reviews)})</span></span>`;
function card(b,ctx){
  const label=ctx&&ctx!=="cat"?"Ver livro":"Ver detalhes";
  return `<article class="card">
    <div class="shelf" data-open="${b.id}">${badgeFor(b,ctx)}${cover(b)}</div>
    <div>
      <div class="cat">${CATS[b.cat].n}</div>
      <h3><a href="#" data-open="${b.id}">${esc(b.t)}</a></h3>
      <div class="by">${esc(b.a)}</div>
    </div>
    <p class="desc">${esc(b.d)}</p>
    <div class="row"><span class="price">${brl(b.p)}</span>${rateHTML(b)}</div>
    <div class="acts">
      <button class="btn btn-ghost btn-sm" data-open="${b.id}">${label}</button>
      <button class="btn btn-primary add" data-add="${b.id}" aria-label="Adicionar ${esc(b.t)} ao carrinho" title="Adicionar ao carrinho"><svg><use href="#i-plus"/></svg></button>
    </div>
  </article>`;
}

let viewed=store.get("nb-viewed",[]);
function recList(){
  const cats=[...new Set(viewed.map(i=>byId[i]&&byId[i].cat).filter(Boolean))];
  if(!cats.length)return [71,79,11,78].map(i=>byId[i]);
  return BOOKS.filter(b=>cats.includes(b.cat)&&!viewed.includes(b.id)).sort((a,b)=>b.rating-a.rating||b.reviews-a.reviews).slice(0,4);
}
const TABS={
  best:()=>[11,45,89,61].map(i=>byId[i]),
  rated:()=>[...BOOKS].sort((a,b)=>b.reviews-a.reviews).slice(0,4),
  new:()=>[39,38,29,61].map(i=>byId[i]),
  rec:recList
};
let curTab="best";
function renderFeat(){ $("#featGrid").innerHTML=TABS[curTab]().map(b=>card(b,curTab)).join(""); }
$$(".tab").forEach(t=>t.addEventListener("click",()=>{
  curTab=t.dataset.tab;$$(".tab").forEach(x=>x.setAttribute("aria-selected",x===t));renderFeat();
}));

(function(){const b=byId[71];$("#heroTag").innerHTML=`<div class="mini">${cover(b)}</div><div><small>Leitura da estação</small><strong>${b.t}</strong></div>`;
  $("#heroTag").style.cursor="pointer";$("#heroTag").addEventListener("click",()=>openBook(71));})();

const CAT_ILL={
 natureza:'<path d="M50 92V40"/><path d="M50 60C30 60 18 46 18 26c20 0 32 14 32 34z"/><path d="M50 50c0-20 12-34 32-34 0 20-12 34-32 34z"/><path d="M50 60L30 40M50 50l20-20"/>',
 ficcao:'<path d="M50 30c-12-8-28-8-40-4v56c12-4 28-4 40 4 12-8 28-8 40-4V26c-12-4-28-4-40 4z"/><path d="M50 30v56M20 40c8-2 16-2 22 1M20 52c8-2 16-2 22 1M58 41c6-3 14-3 22-1M58 53c6-3 14-3 22-1"/>',
 misterio:'<circle cx="42" cy="42" r="22"/><path d="M58 58l26 26"/><path d="M32 36c3-6 8-8 14-8" opacity=".6"/>',
 romance:'<path d="M50 84C24 66 14 52 14 38a16 16 0 0 1 36-8 16 16 0 0 1 36 8c0 14-10 28-36 46z"/><path d="M50 30c4 14 2 30-6 42" opacity=".6"/>',
 dev:'<path d="M50 90V52"/><path d="M50 62c-18 0-28-12-28-28 18 0 28 10 28 28z"/><path d="M50 52c0-20 10-32 30-32 0 20-10 32-30 32z"/><path d="M30 90h40"/>',
 historia:'<path d="M14 34L50 14l36 20z"/><path d="M18 34h64M22 40v34M38 40v34M62 40v34M78 40v34M14 80h72M10 88h80"/>',
 scifi:'<circle cx="50" cy="50" r="20"/><ellipse cx="50" cy="50" rx="40" ry="12" transform="rotate(-18 50 50)"/><circle cx="82" cy="20" r="2" fill="currentColor"/><circle cx="18" cy="82" r="1.5" fill="currentColor"/>',
 arte:'<path d="M50 14C28 14 12 30 12 50s16 36 34 36c6 0 8-4 6-9-2-6 2-11 8-11h10c10 0 18-8 18-18C88 30 72 14 50 14z"/><circle cx="32" cy="44" r="4"/><circle cx="46" cy="30" r="4"/><circle cx="64" cy="32" r="4"/><circle cx="72" cy="48" r="4"/>'
};
const HOME_CATS=[["natureza","Natureza","natureza"],["ficcao","Ficção","ficcao"],["misterio","Mistério","misterio"],["romance","Romance","romance"],["dev","Desenvolvimento pessoal","dev"],["historia","História","historia"],["scifi","Ficção científica","scifi"],["arte","Arte","arte"]];
const catCount=k=>BOOKS.filter(b=>(GROUPS[k]||[k]).includes(b.cat)).length;
$("#cats").innerHTML=HOME_CATS.map(([ill,name,key])=>`<button class="catc rv" data-cat="${key}">
  <span class="ill"><svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${CAT_ILL[ill]}</svg></span>
  <span class="nm"><h3>${name}</h3><small>${catCount(key)} livros</small></span></button>`).join("");
$("#cats").addEventListener("click",e=>{const c=e.target.closest("[data-cat]");if(!c)return;setGenre(c.dataset.cat);$("#encontre").scrollIntoView({behavior:"smooth"});});
$("#footCats").innerHTML=["natureza","literatura","fantasia","misterio","arte"].map(k=>`<li><a href="#encontre" data-fcat="${k}">${CATS[k].n}</a></li>`).join("");
$("#footCats").addEventListener("click",e=>{const a=e.target.closest("[data-fcat]");if(a)setGenre(a.dataset.fcat);});

const F={q:"",genre:"",author:"",year:"",rating:0,avail:"",max:90,sort:"rel",shown:12};
const PAGE=12;
$("#fGenre").innerHTML='<option value="">Todos os gêneros</option><option value="ficcao">Ficção (clássicos, internacional e fantasia)</option>'+Object.entries(CATS).map(([k,v])=>`<option value="${k}">${v.n}</option>`).join("");
const authors=[...new Set(BOOKS.map(b=>b.a))].sort((a,b)=>a.localeCompare(b,"pt"));
$("#authorList").innerHTML=authors.map(a=>`<option value="${esc(a)}"></option>`).join("");
$("#chips").innerHTML='<button class="chip" data-chip="" aria-pressed="true">Todos</button>'+Object.entries(CATS).map(([k,v])=>`<button class="chip" data-chip="${k}" aria-pressed="false">${v.n}</button>`).join("");
$("#chips").addEventListener("click",e=>{const c=e.target.closest("[data-chip]");if(c)setGenre(c.dataset.chip);});
function setGenre(g){F.genre=g;$("#fGenre").value=g;F.shown=PAGE;renderCatalog();}

const norm=s=>s.normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase();
function filtered(){
  const q=norm(F.q.trim());
  const cats=F.genre?(GROUPS[F.genre]||[F.genre]):null;
  let list=BOOKS.filter(b=>{
    if(q&&!norm(b.t+" "+b.a).includes(q))return false;
    if(cats&&!cats.includes(b.cat))return false;
    if(F.author&&!norm(b.a).includes(norm(F.author)))return false;
    if(F.year){const y=b.y;if(F.year==="a"&&!(y<1900))return false;if(F.year==="b"&&!(y>=1900&&y<1950))return false;if(F.year==="c"&&!(y>=1950&&y<2000))return false;if(F.year==="d"&&!(y>=2000))return false;}
    if(b.rating<F.rating)return false;
    if(F.avail!==""&&String(+b.avail)!==F.avail)return false;
    if(b.p>F.max)return false;
    return true;
  });
  const s={pa:(a,b)=>a.p-b.p,pd:(a,b)=>b.p-a.p,ra:(a,b)=>b.rating-a.rating||b.reviews-a.reviews,rv:(a,b)=>b.reviews-a.reviews,az:(a,b)=>a.t.localeCompare(b.t,"pt")}[F.sort];
  if(s)list=[...list].sort(s);
  return list;
}
function renderCatalog(){
  const list=filtered(), shown=list.slice(0,F.shown);
  $$("#chips .chip").forEach(c=>c.setAttribute("aria-pressed",c.dataset.chip===F.genre));
  const active=F.q||F.genre||F.author||F.year||F.rating||F.avail!==""||F.max<90;
  $("#clearF").hidden=!active;
  $("#resCount").textContent=list.length?`Exibindo ${shown.length} de ${list.length.toLocaleString("pt-BR")} ${list.length===1?"livro":"livros"}`:"Nenhum livro encontrado";
  $("#catalog").innerHTML=shown.map(b=>card(b,"cat")).join("");
  if(!list.length){$("#catalog").innerHTML="";$("#more").innerHTML=`<div class="empty"><h3>Nenhuma página por aqui ainda</h3><p>Tente outro termo ou remova alguns filtros.</p><p style="margin-top:16px"><button class="btn btn-ghost" data-clear>Limpar filtros</button></p></div>`;return;}
  const pct=Math.round(shown.length/list.length*100);
  $("#more").innerHTML=shown.length<list.length?`<div class="bar"><i style="width:${pct}%"></i></div><button class="btn btn-ghost" id="loadMore">Mostrar mais livros</button>`:(list.length>PAGE?`<div class="bar"><i style="width:100%"></i></div><p class="rate">Você chegou ao fim da estante.</p>`:"");
}
function clearFilters(){Object.assign(F,{q:"",genre:"",author:"",year:"",rating:0,avail:"",max:90,shown:PAGE});
  $("#q").value="";$("#fGenre").value="";$("#fAuthor").value="";$("#fYear").value="";$("#fRating").value="0";$("#fAvail").value="";$("#fPrice").value=90;$("#priceOut").textContent="até R$ 90";renderCatalog();}
$("#more").addEventListener("click",e=>{if(e.target.closest("#loadMore")){F.shown+=PAGE;renderCatalog();}if(e.target.closest("[data-clear]"))clearFilters();});
$("#clearF").addEventListener("click",clearFilters);
let qT;$("#q").addEventListener("input",e=>{clearTimeout(qT);qT=setTimeout(()=>{F.q=e.target.value;F.shown=PAGE;renderCatalog();},160);});
$("#fGenre").addEventListener("change",e=>setGenre(e.target.value));
let aT;$("#fAuthor").addEventListener("input",e=>{clearTimeout(aT);aT=setTimeout(()=>{F.author=e.target.value.trim();F.shown=PAGE;renderCatalog();},200);});
$("#fYear").addEventListener("change",e=>{F.year=e.target.value;F.shown=PAGE;renderCatalog();});
$("#fRating").addEventListener("change",e=>{F.rating=+e.target.value;F.shown=PAGE;renderCatalog();});
$("#fAvail").addEventListener("change",e=>{F.avail=e.target.value;F.shown=PAGE;renderCatalog();});
$("#fPrice").addEventListener("input",e=>{F.max=+e.target.value;$("#priceOut").textContent="até R$ "+F.max;F.shown=PAGE;renderCatalog();});
$("#fSort").addEventListener("change",e=>{F.sort=e.target.value;renderCatalog();});

let cart=store.get("nb-cart",{});
const SHIP=14.9, FREE=150;
const cartItems=()=>Object.entries(cart).filter(([i])=>byId[i]).map(([i,q])=>({b:byId[i],q}));
function saveCart(){store.set("nb-cart",cart);renderCart();}
function addToCart(i,q=1){cart[i]=(cart[i]||0)+q;saveCart();toast(`“${byId[i].t}” foi para a sacola`);}
function renderCart(){
  const items=cartItems(), n=items.reduce((s,x)=>s+x.q,0);
  $("#cartCount").hidden=!n;$("#cartCount").textContent=n;
  if(!items.length){
    $("#cartBody").innerHTML=`<div class="cart-empty"><svg viewBox="0 0 32 32"><use href="#i-leaf"/></svg><h3>Sua sacola está vazia</h3><p>Que tal escolher a próxima leitura?</p><button class="btn btn-primary" data-go="encontre">Explorar livros</button></div>`;
    $("#cartFoot").hidden=true;return;
  }
  $("#cartFoot").hidden=false;
  $("#cartBody").innerHTML=items.map(({b,q})=>`<div class="ci">
    <div>${cover(b)}</div>
    <div><h4>${esc(b.t)}</h4><small>${esc(b.a)} · ${brl(b.p)}</small>
      <div class="ctl"><span class="stepper"><button data-dec="${b.id}" aria-label="Diminuir quantidade">−</button><span>${q}</span><button data-inc="${b.id}" aria-label="Aumentar quantidade">+</button></span>
      <button class="linkbtn" data-rm="${b.id}">Remover</button></div></div>
    <div class="lt">${brl(b.p*q)}</div></div>`).join("");
  const sub=items.reduce((s,x)=>s+x.b.p*x.q,0), ship=sub>=FREE?0:SHIP, left=FREE-sub;
  $("#cartFoot").innerHTML=`<div class="ship">${left>0?`Faltam <b>${brl(left)}</b> para o frete grátis.`:"Seu pedido ganhou frete grátis."}<div class="bar"><i style="width:${Math.min(100,sub/FREE*100)}%"></i></div></div>
    <div class="ln"><span>Subtotal (${n} ${n===1?"item":"itens"})</span><span>${brl(sub)}</span></div>
    <div class="ln"><span>Frete</span><span>${ship?brl(ship):"Grátis"}</span></div>
    <div class="ln tot"><span>Total</span><span>${brl(sub+ship)}</span></div>
    <button class="btn btn-primary" id="checkout">Finalizar compra <svg><use href="#i-arrow"/></svg></button>`;
}
$("#cartBody").addEventListener("click",e=>{
  const t=e.target.closest("button");if(!t)return;
  if(t.dataset.inc){cart[t.dataset.inc]++;saveCart();}
  else if(t.dataset.dec){const i=t.dataset.dec;cart[i]--;if(cart[i]<=0)delete cart[i];saveCart();}
  else if(t.dataset.rm){delete cart[t.dataset.rm];saveCart();}
  else if(t.dataset.go){closeCart();goTo(t.dataset.go);}
  else if(t.dataset.done!==undefined){closeCart();}
});
$("#cartFoot").addEventListener("click",e=>{
  if(!e.target.closest("#checkout"))return;
  closeCart();
  if(window.NBAuth&&!NBAuth.user){NBAuth.open("login",()=>NBCheckout.open());toast("Entre na sua conta para finalizar a compra.");return;}
  NBCheckout.open();
});
const openCart=()=>{$("#cart").classList.add("on");$("#scrim").classList.add("on");$("#cart").setAttribute("aria-hidden","false");setTimeout(()=>$("#cartClose").focus(),50);};
const closeCart=()=>{$("#cart").classList.remove("on");$("#scrim").classList.remove("on");$("#cart").setAttribute("aria-hidden","true");};
$("#cartBtn").addEventListener("click",()=>{renderCart();openCart();});
$("#cartClose").addEventListener("click",closeCart);
$("#scrim").addEventListener("click",closeCart);
document.addEventListener("keydown",e=>{if(e.key==="Escape"){closeCart();toggleSearch(false);}});

let tT;function toast(msg){const t=$("#toast");t.querySelector("span").textContent=msg;t.classList.add("on");clearTimeout(tT);tT=setTimeout(()=>t.classList.remove("on"),2400);}

function stars(r){return `<span class="stars" aria-label="Nota ${r} de 5">★★★★★<i style="width:${r/5*100}%">★★★★★</i></span>`;}
let pageQty=1;
function openBook(i){
  const b=byId[i];if(!b)return;
  viewed=[i,...viewed.filter(x=>x!==i)].slice(0,8);store.set("nb-viewed",viewed);
  pageQty=1;
  const rel=BOOKS.filter(x=>x.cat===b.cat&&x.id!==b.id).sort((x,y)=>y.rating-x.rating).slice(0,4);
  const extra={literatura:"Uma obra essencial da literatura brasileira, em edição cuidadosa para ler com calma.",internacional:"Um clássico da literatura mundial que continua conversando com cada nova geração.",romance:"Para ler numa tarde tranquila e se deixar levar pelos encontros e desencontros.",misterio:"Pistas, reviravoltas e aquela vontade de ler só mais um capítulo.",fantasia:"Uma porta aberta para mundos inteiros, perfeita para leituras longas e encantadas.",scifi:"Ideias ousadas sobre o futuro, a ciência e o que nos torna humanos.",dev:"Leitura prática e reflexiva para cultivar mudanças com constância.",natureza:"Um convite para olhar o mundo natural com mais atenção e encantamento.",historia:"Uma vida, ou uma época, contada com profundidade e boas histórias.",arte:"Para quem cria, observa e quer alimentar a própria curiosidade."}[b.cat];
  $("#bookPage").innerHTML=`
    <nav class="crumbs" aria-label="Você está em"><button data-home="inicio">Início</button><span>/</span><button data-home="encontre" data-g="${b.cat}">${CATS[b.cat].n}</button><span>/</span><span>${esc(b.t)}</span></nav>
    <div class="bp-main">
      <div class="bp-cover">${badgeFor(b)}${cover(b,"lg")}</div>
      <div>
        <span class="eyebrow"><svg><use href="#i-leaf"/></svg>${CATS[b.cat].n}</span>
        <h1>${esc(b.t)}</h1>
        <p class="au">${esc(b.a)}</p>
        <div class="rt">${stars(b.rating)}<span>${b.rating.toFixed(1).replace(".",",")} · ${fmtN(b.reviews)} avaliações</span></div>
        <div class="buy">
          <span class="price">${brl(b.p)}</span>
          <span class="avail ${b.avail?"":"no"}">${b.avail?"Pronta entrega · envio em até 2 dias úteis":"Sob encomenda · envio em até 15 dias úteis"}</span>
        </div>
        <div class="actions">
          <span class="stepper"><button id="pqDec" aria-label="Diminuir quantidade">−</button><span id="pq">1</span><button id="pqInc" aria-label="Aumentar quantidade">+</button></span>
          <button class="btn btn-primary" id="pAdd"><svg><use href="#i-bag"/></svg>Adicionar ao carrinho</button>
          <button class="btn btn-ghost" data-home="encontre">Voltar ao catálogo</button>
        </div>
        <p class="about-book">${esc(b.d)} ${extra}</p>
        <dl>
          <div><dt>Autor</dt><dd>${esc(b.a)}</dd></div>
          <div><dt>Publicação original</dt><dd>${yearTxt(b.y)}</dd></div>
          <div><dt>Formato</dt><dd>Brochura${b.pages?` · ${b.pages} páginas`:""}</dd></div>
          <div><dt>Frete</dt><dd>Grátis acima de R$ 150</dd></div>
        </dl>
      </div>
    </div>
    <section class="related"><h2>Da mesma estante</h2><div class="grid feat-grid">${rel.map(x=>card(x,"cat")).join("")}</div></section>`;
  showPage("bookPage");
  window.scrollTo({top:0,behavior:"instant"});
  toggleSearch(false);$("#nav").classList.remove("open");
  $("#pqDec").onclick=()=>{pageQty=Math.max(1,pageQty-1);$("#pq").textContent=pageQty;};
  $("#pqInc").onclick=()=>{pageQty=Math.min(20,pageQty+1);$("#pq").textContent=pageQty;};
  $("#pAdd").onclick=()=>addToCart(b.id,pageQty);
  if(curTab==="rec")renderFeat();
}
const PAGES=["home","bookPage","checkoutPage"];
function showPage(id){
  if(id!=="checkoutPage"&&!$("#checkoutPage").hidden&&window.NBCheckout)NBCheckout.leave();
  PAGES.forEach(p=>$("#"+p).hidden=p!==id);
  toggleSearch(false);$("#nav").classList.remove("open");
}
function goTo(anchor){
  if($("#home").hidden){showPage("home");if(curTab==="rec")renderFeat();}
  const el=document.getElementById(anchor);
  if(el)requestAnimationFrame(()=>el.scrollIntoView({behavior:"smooth"}));
}
$("#bookPage").addEventListener("click",e=>{const h=e.target.closest("[data-home]");if(!h)return;if(h.dataset.g)setGenre(h.dataset.g);goTo(h.dataset.home);});

document.addEventListener("click",e=>{
  const o=e.target.closest("[data-open]");if(o){e.preventDefault();openBook(+o.dataset.open);return;}
  const a=e.target.closest("[data-add]");if(a){addToCart(+a.dataset.add);return;}
  const l=e.target.closest('a[href^="#"]');
  if(l&&l.getAttribute("href").length>1){e.preventDefault();$("#nav").classList.remove("open");$("#burger").setAttribute("aria-expanded","false");goTo(l.getAttribute("href").slice(1));}
});

function toggleSearch(on){
  const p=$("#searchPanel");on=on===undefined?p.hidden:on;p.hidden=!on;$("#searchBtn").setAttribute("aria-expanded",on);
  if(on){$("#globalSearch").focus();}else{$("#globalSearch").value="";$("#suggest").innerHTML="";}
}
$("#searchBtn").addEventListener("click",()=>toggleSearch());
$("#searchClose").addEventListener("click",()=>toggleSearch(false));
$("#globalSearch").addEventListener("input",e=>{
  const q=norm(e.target.value.trim());
  if(!q){$("#suggest").innerHTML="";return;}
  const r=BOOKS.filter(b=>norm(b.t+" "+b.a).includes(q)).slice(0,5);
  $("#suggest").innerHTML=r.length?r.map(b=>`<button data-open="${b.id}"><span class="mini">${cover(b)}</span><span><b>${esc(b.t)}</b><small>${esc(b.a)}</small></span><span class="pr">${brl(b.p)}</span></button>`).join("")
    :`<p class="rate" style="padding:8px 10px">Nenhum título ou autor com “${esc(e.target.value)}”.</p>`;
});
$("#globalSearch").addEventListener("keydown",e=>{if(e.key==="Enter"){F.q=e.target.value;$("#q").value=F.q;F.shown=PAGE;renderCatalog();toggleSearch(false);goTo("encontre");}});

$("#burger").addEventListener("click",()=>{const n=$("#nav"),o=!n.classList.contains("open");n.classList.toggle("open",o);$("#burger").setAttribute("aria-expanded",o);});
addEventListener("scroll",()=>$("#top").classList.toggle("scrolled",scrollY>8),{passive:true});

(function(){
  const cols=["#6E7F4D","#B48A62","#3F5A4A","#C7B48D","#8E7A5C","#B98B7E","#5B6B3F","#D9CDB3","#7A5A3E","#4D5B3A"];
  let s="",k=0;
  [[110,196],[200,286],[290,376]].forEach(([top,base])=>{
    [[86,270],[290,474]].forEach(([x0,x1])=>{
      let x=x0;while(x<x1-10){const w=8+Math.floor(rnd(++k)*9),h=48+Math.floor(rnd(k+50)*30);if(x+w>x1)break;
        if(rnd(k+9)>.9){x+=14;continue;}
        s+=`<rect x="${x}" y="${base-h}" width="${w}" height="${h}" rx="1.5" fill="${cols[k%cols.length]}"/>`;x+=w+1;}
    });
  });
  $("#spines").innerHTML=s;
  let f="";for(let i=0;i<9;i++){const y=140-i*15,l=22-i*1.6;f+=`<ellipse cx="${50+(y<0?0:(140-y)*.07)-l/2}" cy="${y+8}" rx="${l/2}" ry="4" transform="rotate(-25 50 ${y})"/><ellipse cx="${52+(140-y)*.07+l/2}" cy="${y+4}" rx="${l/2}" ry="4" transform="rotate(25 50 ${y})"/>`;}
  $("#fernLeaves").innerHTML=f;
})();

function avatar(bg,skin,hair,shirt,long){
  return `<svg viewBox="0 0 60 60" aria-hidden="true"><rect width="60" height="60" fill="${bg}"/>
  ${long?`<path d="M14 34c0-16 6-24 16-24s16 8 16 24v14H14z" fill="${hair}"/>`:""}
  <path d="M10 62c2-12 10-18 20-18s18 6 20 18z" fill="${shirt}"/><rect x="26" y="36" width="8" height="10" fill="${skin}"/>
  <ellipse cx="30" cy="28" rx="11" ry="12.5" fill="${skin}"/>
  <path d="M19 26c0-9 5-14 11-14s11 5 11 14c-4-5-10-7-16-5-2 1-4 3-6 5z" fill="${hair}"/></svg>`;
}
const QUOTES=[
  ["A Nature Books me fez voltar a enxergar a leitura como um momento de descanso.","Helena Duarte","Lê antes de dormir, todas as noites",avatar("#DDE5CF","#E3B996","#5A3B28","#6E7F4D",1)],
  ["Encontrei A Vida Secreta das Árvores pelos filtros e virou meu livro de cabeceira. A curadoria é muito cuidadosa.","Rafael Moreira","Professor de biologia",avatar("#EAE2D0","#B98563","#2B2420","#3F5A4A",0)],
  ["Tudo aqui convida a desacelerar. Montei minha lista do ano em uma tarde, com um café do lado.","Lúcia Andrade","Clube do livro de domingo",avatar("#E4E7D3","#8C5E42","#1F1A17","#B98B7E",1)]
];
$("#quotes").innerHTML=QUOTES.map(([q,n,r,av])=>`<figure class="quote rv"><svg class="qm" viewBox="0 0 32 24" fill="currentColor"><path d="M0 24V14C0 6 4 1 12 0v5c-4 1-6 4-6 8h6v11zm18 0V14c0-8 4-13 12-14v5c-4 1-6 4-6 8h6v11z"/></svg><blockquote>“${q}”</blockquote><figcaption>${av}<span><b>${n}</b><span>${r}</span></span></figcaption></figure>`).join("");

$("#newsForm").addEventListener("submit",e=>{
  e.preventDefault();const v=$("#newsEmail").value.trim(),m=$("#newsMsg");
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)){m.textContent="Confira o e-mail: ele precisa ter o formato nome@exemplo.com.";$("#newsEmail").focus();return;}
  m.textContent="Pronto! Seu e-mail entrou na lista de recomendações da Nature Books.";$("#newsEmail").value="";
});

function setupReveal(){
  if(!("IntersectionObserver" in window)||matchMedia("(prefers-reduced-motion: reduce)").matches)return;
  const io=new IntersectionObserver(es=>es.forEach(en=>{if(en.isIntersecting){en.target.classList.remove("wait");io.unobserve(en.target);}}),{rootMargin:"0px 0px -8% 0px"});
  $$(".rv").forEach((el,i)=>{const r=el.getBoundingClientRect();if(r.top>innerHeight){el.classList.add("wait");el.style.transitionDelay=(el.classList.contains("catc")||el.classList.contains("quote")?(i%4)*80:0)+"ms";io.observe(el);}});
}

document.querySelectorAll("[data-total]").forEach(el=>{el.textContent=BOOKS.length.toLocaleString("pt-BR");});
window.NBStore={items:cartItems,clear(){cart={};saveCart();},brl,esc,cover,toast,goTo,showPage,FREE,SHIP};
renderFeat();renderCatalog();renderCart();setupReveal();
})();
