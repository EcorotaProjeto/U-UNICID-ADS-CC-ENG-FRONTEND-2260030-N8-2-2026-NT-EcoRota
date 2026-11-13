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
  return `Você é o mascote assistente do EcoRota, um site acessível sobre descarte correto de lixo eletrônico,
coleta em casa, doação de aparelhos e comunidade. Página atual: "${pagina.titulo}" (${pagina.caminho}).
Seu nome é Equinho. Você é o mascote do EcoRota: simpático, animado e paciente. Sempre se chame de Equinho (nunca de "folhinha" ou outro nome). Fale em português do Brasil, de forma simples e curta:
no máximo 2 ou 3 frases (até umas 40 palavras), porque sua fala aparece num balãozinho.
Lembre que muitos visitantes podem ter deficiência visual, motora ou pouca familiaridade com tecnologia.

Seu trabalho é ajudar o visitante a usar o site e a descartar eletrônicos do jeito certo.
Estes são os elementos desta página que você conhece e pode apontar:
${alvos}

Regras:
- Sobre o site, use só as informações acima. Se não souber algo, diga que não sabe e sugira a página Contato.
  Nunca invente endereços, horários, telefones ou números.
- Pode dar dicas gerais e seguras sobre descarte de eletrônicos (ex.: não jogar pilhas no lixo comum, apagar os dados antes de doar).
- Quando for útil mostrar onde algo está, coloque o id do elemento em "alvo" (você vai até ele e aponta).
- Responda SOMENTE com um JSON neste formato:
{"fala": "o que você diz", "alvo": "id-do-elemento ou null"}`;
}

/* ---------- Resposta reserva (sem IA): procura a descrição mais parecida com a pergunta ---------- */
const PALAVRAS_VAZIAS = new Set('a o as os de da do das dos e é em um uma para pra por com como que se no na nos nas eu meu minha onde qual quais posso faço fazer quero tem ter isso esse essa aqui'.split(' '));
function palavras(texto) {
  return String(texto).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .split(/[^a-z0-9]+/).filter((p) => p.length > 2 && !PALAVRAS_VAZIAS.has(p));
}
function respostaReserva(pergunta, alvos) {
  const busca = palavras(pergunta);
  let melhor = null, pontos = 0;
  for (const a of alvos) {
    const desc = palavras(a.descricao);
    const p = busca.filter((b) => desc.some((d) => d.startsWith(b.slice(0, 5)) || b.startsWith(d.slice(0, 5)))).length;
    if (p > pontos) { pontos = p; melhor = a; }
  }
  if (melhor) return { fala: `Olha aqui! ${melhor.descricao}.`, alvo: melhor.id };
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
const VERSAO = 'equinho-3'; // mude isso a cada alteração pra conferir se o deploy pegou

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
    return res.status(200).json({ ...respostaReserva(ultimaPergunta, pagina.alvos), fonte: 'reserva' });
  }

  const sistema = promptDoSistema(pagina);
  for (const modelo of MODELOS) {
    try {
      const texto = await perguntarAoGemini(chave, modelo, sistema, mensagens);
      const { fala, alvo } = extrairJson(texto);
      const idsValidos = new Set(pagina.alvos.map((a) => a.id));
      return res.status(200).json({
        fala: String(fala || '').slice(0, 800) || 'Hmm, me perdi. Pode perguntar de novo?',
        alvo: idsValidos.has(alvo) ? alvo : null,
        fonte: modelo,
      });
    } catch (e) {
      console.error(e.message); // aparece em Vercel → projeto → Logs
    }
  }

  // nenhum modelo respondeu (limite gratuito, internet, chave errada...): usa a reserva
  return res.status(200).json({ ...respostaReserva(ultimaPergunta, pagina.alvos), fonte: 'reserva' });
};
