/*
 * api/chat.js — função da Vercel que conecta o mascote à API do Gemini (Google).
 * A Vercel transforma este arquivo no endereço /api/chat automaticamente.
 *
 * A chave NÃO fica aqui: ela é configurada no painel da Vercel
 * (Settings → Environment Variables → GEMINI_API_KEY).
 *
 * Se o Gemini falhar ou o limite gratuito acabar, o mascote usa uma
 * "resposta reserva" baseada nas descrições (data-mascote) da própria página.
 */

// Modelos do plano gratuito, em ordem de preferência. Se um falhar, tenta o próximo.
// Dá pra trocar pela variável GEMINI_MODELO na Vercel.
const MODELOS = (process.env.GEMINI_MODELO || 'gemini-3.5-flash-lite,gemini-3.6-flash')
  .split(',').map((m) => m.trim()).filter(Boolean);

/* ---------- Personalidade do mascote: edite à vontade ---------- */
function promptDoSistema(pagina) {
  const alvos = pagina.alvos.map((a) => `- id "${a.id}": ${a.descricao}`).join('\n') || '(nenhum)';
  const paginas = pagina.paginas.map((p) => `- destino "${p.destino}": link "${p.texto}"`).join('\n') || '(nenhuma)';
  return `Você é o mascote assistente do EcoRota, um site acessível sobre descarte correto de lixo eletrônico,
coleta em casa, doação de aparelhos e comunidade. Página atual: "${pagina.titulo}" (${pagina.caminho}).
Seu nome é Equinho. Você é o mascote do EcoRota: simpático, animado e paciente. Sempre se chame de Equinho (nunca de "folhinha" ou outro nome). Fale em português do Brasil, de forma simples e curta:
no máximo 2 ou 3 frases (até umas 40 palavras), porque sua fala aparece num balãozinho.
Lembre que muitos visitantes podem ter deficiência visual, motora ou pouca familiaridade com tecnologia.

Seu trabalho é ajudar o visitante a usar o site e a descartar eletrônicos do jeito certo.
Estes são os elementos DESTA página que você conhece e pode apontar (campo "alvo"):
${alvos}

Estas são as páginas do site para onde você pode LEVAR o visitante (campo "pagina"):
${paginas}

Regras:
- Sobre o site, use só as informações acima. Se não souber algo, diga que não sabe e sugira a página Contato.
  Nunca invente endereços, horários, telefones ou números.
- Pode dar dicas gerais e seguras sobre descarte de eletrônicos (ex.: não jogar pilhas no lixo comum, apagar os dados antes de doar).
- Quando for útil mostrar algo desta página, coloque o id do elemento em "alvo" (você vai até ele e aponta).
- Se o visitante pedir pra ir a outra página, ou se o que ele procura estiver em outra página, coloque o destino
  em "pagina" e diga na fala pra onde vai levar (ex.: "Vou te levar pra página de Contato!"). Use só destinos da lista.
- Se a mensagem disser que o visitante acabou de chegar com a sua ajuda, NÃO use "pagina": mostre o que ele procura nesta página.
- Muitas pessoas vão ouvir sua fala em voz alta: não use emojis, asteriscos, listas nem formatação.
- Responda SOMENTE com um JSON neste formato:
{"fala": "o que você diz", "alvo": "id-do-elemento ou null", "pagina": "destino ou null"}`;
}

/* ---------- Resposta reserva (sem IA): procura a descrição mais parecida com a pergunta ---------- */
const PALAVRAS_VAZIAS = new Set('a o as os de da do das dos e é em um uma para pra pro por com como que se no na nos nas eu me meu minha onde qual quais posso faço fazer quero tem ter isso esse essa aqui leva levar leve ir vai vamos abrir abre abra pagina página entrar mostra'.split(' '));
function palavras(texto) {
  return String(texto).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .split(/[^a-z0-9]+/).filter((p) => p.length > 2 && !PALAVRAS_VAZIAS.has(p));
}
function respostaReserva(pergunta, alvos, paginas = [], titulo = '') {
  // acabou de chegar levado pelo Equinho? não navega de novo
  const chegou = /acabou de chegar/.test(pergunta);
  if (chegou) { pergunta = pergunta.replace(/^\(.*?\)\s*/, ''); paginas = []; alvos = alvos.filter((a) => a.id !== 'menu-principal'); }
  // ao chegar, o nome da própria página não conta ("me leva pra Projetos" não é sobre "projetos sociais")
  const doTitulo = chegou ? new Set(palavras(titulo)) : new Set();
  const busca = palavras(pergunta).filter((p) => !doTitulo.has(p));
  const parecido = (texto) => {
    const desc = palavras(texto);
    return busca.filter((b) => desc.some((d) => d.startsWith(b.slice(0, 5)) || b.startsWith(d.slice(0, 5)))).length;
  };
  let melhor = null, pontos = 0;
  for (const a of alvos) {
    const p = parecido(a.descricao);
    if (p > pontos) { pontos = p; melhor = a; }
  }
  // uma página só ganha se combinar mais que um elemento desta página (ex.: "quero ir pro contato")
  let melhorPagina = null, pontosPagina = 0;
  for (const pg of paginas) {
    const p = parecido(pg.texto);
    if (p > pontosPagina) { pontosPagina = p; melhorPagina = pg; }
  }
  // pedido de ir a algum lugar ("me leva pra...", "abre a página...") prefere a página
  const querIr = /\b(leva|levar|leve|ir|vai|vamos|abr[aei]r?|abre|pagina|entrar|mostra a pagina)\b/.test(
    String(pergunta).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''));
  if (melhorPagina && (pontosPagina > pontos || (querIr && pontosPagina > 0))) {
    return { fala: `Vou te levar até ${melhorPagina.texto}!`, alvo: null, pagina: melhorPagina.destino };
  }
  if (melhor) return { fala: `Olha aqui! ${melhor.descricao}.`, alvo: melhor.id };
  if (chegou) return { fala: `Chegamos! Aqui é a página ${titulo.split('|')[0].trim() || 'que você pediu'}. Em que posso ajudar?`, alvo: null };
  return {
    fala: 'Hmm, não sei responder isso agora. Dá uma olhada no menu ou fala com a equipe na página Contato!',
    alvo: alvos.find((a) => a.id === 'menu-principal') ? 'menu-principal' : null,
  };
}

/* ---------- Utilidades ---------- */
const usos = new Map(); // limite por IP (best effort: cada instância da Vercel tem sua memória)
function passouDoLimite(ip) {
  const agora = Date.now();
  const lista = (usos.get(ip) || []).filter((t) => agora - t < 60_000);
  lista.push(agora);
  usos.set(ip, lista);
  return lista.length > 15;
}

function extrairJson(texto) {
  const ini = texto.indexOf('{'), fim = texto.lastIndexOf('}');
  if (ini !== -1 && fim > ini) {
    try { return JSON.parse(texto.slice(ini, fim + 1)); } catch {}
  }
  return { fala: texto.trim(), alvo: null };
}

async function perguntarAoGemini(chave, modelo, sistema, mensagens) {
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(modelo)}:generateContent`, {
    method: 'POST',
    headers: { 'x-goog-api-key': chave, 'content-type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: sistema }] },
      // no Gemini, a fala do assistente se chama "model"
      contents: mensagens.map((m) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] })),
      generationConfig: { maxOutputTokens: 1024, temperature: 0.7, responseMimeType: 'application/json' },
    }),
  });
  const dados = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`Gemini ${modelo} respondeu ${r.status}: ${dados.error?.message || ''}`);
  const partes = dados.candidates?.[0]?.content?.parts || [];
  const texto = partes.filter((p) => !p.thought && typeof p.text === 'string').map((p) => p.text).join('');
  if (!texto.trim()) throw new Error(`Gemini ${modelo} devolveu resposta vazia`);
  return texto;
}

/* ---------- A função em si ---------- */
const VERSAO = 'equinho-5'; // mude isso a cada alteração pra conferir se o deploy pegou

module.exports = async function handler(req, res) {
  // Abrir /api/chat no navegador mostra qual versão está no ar e se a chave foi encontrada
  if (req.method === 'GET') {
    return res.status(200).json({ ok: true, versao: VERSAO, chaveConfigurada: Boolean(process.env.GEMINI_API_KEY), modelos: MODELOS });
  }
  if (req.method !== 'POST') return res.status(405).json({ erro: 'Use POST' });

  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0] || 'desconhecido';
  if (passouDoLimite(ip)) return res.status(429).json({ erro: 'Calma! Muitas perguntas seguidas.' });

  let corpo = req.body;
  if (typeof corpo === 'string') { try { corpo = JSON.parse(corpo); } catch { corpo = null; } }
  if (!corpo || typeof corpo !== 'object') return res.status(400).json({ erro: 'Pedido inválido' });

  const p = corpo.pagina && typeof corpo.pagina === 'object' ? corpo.pagina : {};
  const pagina = {
    titulo: String(p.titulo || '').slice(0, 120),
    caminho: String(p.caminho || '/').slice(0, 120),
    alvos: (Array.isArray(p.alvos) ? p.alvos : []).slice(0, 40)
      .filter((a) => a && typeof a.id === 'string' && typeof a.descricao === 'string')
      .map((a) => ({ id: a.id.slice(0, 60), descricao: a.descricao.slice(0, 300) })),
    paginas: (Array.isArray(p.paginas) ? p.paginas : []).slice(0, 40)
      .filter((x) => x && typeof x.destino === 'string' && typeof x.texto === 'string'
        && /^[\w\-./]*(#[\w\-]+)?$/.test(x.destino) && !x.destino.includes('..'))
      .map((x) => ({ destino: x.destino.slice(0, 120), texto: x.texto.slice(0, 80) })),
  };

  const mensagens = (Array.isArray(corpo.mensagens) ? corpo.mensagens : [])
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
    .slice(-10)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 1000) }));
  while (mensagens.length && mensagens[0].role !== 'user') mensagens.shift();
  if (!mensagens.length) return res.status(400).json({ erro: 'Sem pergunta' });

  const ultimaPergunta = mensagens[mensagens.length - 1].content;
  const chave = process.env.GEMINI_API_KEY;
  if (!chave) {
    console.warn('GEMINI_API_KEY não configurada: usando resposta reserva');
    return res.status(200).json({ ...respostaReserva(ultimaPergunta, pagina.alvos, pagina.paginas, pagina.titulo), fonte: 'reserva' });
  }

  const sistema = promptDoSistema(pagina);
  for (const modelo of MODELOS) {
    try {
      const texto = await perguntarAoGemini(chave, modelo, sistema, mensagens);
      const { fala, alvo, pagina: destino } = extrairJson(texto);
      const idsValidos = new Set(pagina.alvos.map((a) => a.id));
      const destinosValidos = new Set(pagina.paginas.map((x) => x.destino));
      return res.status(200).json({
        fala: String(fala || '').replace(/[*_#`]/g, '').slice(0, 800) || 'Hmm, me perdi. Pode perguntar de novo?',
        alvo: idsValidos.has(alvo) ? alvo : null,
        pagina: destinosValidos.has(destino) ? destino : null,
        fonte: modelo,
      });
    } catch (e) {
      console.error(e.message); // aparece em Vercel → projeto → Logs
    }
  }

  // nenhum modelo respondeu (limite gratuito, internet, chave errada...): usa a reserva
  return res.status(200).json({ ...respostaReserva(ultimaPergunta, pagina.alvos, pagina.paginas, pagina.titulo), fonte: 'reserva' });
};
