/*
 * api/chat.js — função da Vercel que conecta o mascote à API do Claude.
 * A Vercel transforma este arquivo no endereço /api/chat automaticamente.
 *
 * A chave da API NÃO fica aqui: ela é configurada no painel da Vercel
 * (Settings → Environment Variables → ANTHROPIC_API_KEY).
 */
const MODELO = process.env.MODELO || 'claude-haiku-5-5'; // rápido e barato, ótimo pra mascote

/* ---------- Personalidade do mascote: edite à vontade ---------- */
function promptDoSistema(pagina) {
  const alvos = (pagina.alvos || [])
    .map((a) => `- id "${a.id}": ${a.descricao}`)
    .join('\n') || '(nenhum)';
  return `Você é o mascote assistente do EcoRota, um site acessível sobre descarte correto de lixo eletrônico,
coleta em casa, doação de aparelhos e comunidade. Página atual: "${pagina.titulo || ''}" (${pagina.caminho || '/'}).
Você é uma folhinha simpática, animada e paciente. Fale em português do Brasil, de forma simples e curta:
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
- Responda SOMENTE com um JSON válido, sem texto antes ou depois, neste formato:
{"fala": "o que você diz", "alvo": "id-do-elemento ou null"}`;
}

/* Limite simples por IP (best effort: cada instância da Vercel tem sua memória) */
const usos = new Map();
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

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ erro: 'Use POST' });

  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0] || 'desconhecido';
  if (passouDoLimite(ip)) return res.status(429).json({ erro: 'Calma! Muitas perguntas seguidas.' });

  let corpo = req.body;
  if (typeof corpo === 'string') { try { corpo = JSON.parse(corpo); } catch { corpo = null; } }
  if (!corpo || typeof corpo !== 'object') return res.status(400).json({ erro: 'Pedido inválido' });

  const pagina = corpo.pagina && typeof corpo.pagina === 'object' ? corpo.pagina : {};
  pagina.alvos = (Array.isArray(pagina.alvos) ? pagina.alvos : []).slice(0, 40)
    .filter((a) => a && typeof a.id === 'string' && typeof a.descricao === 'string')
    .map((a) => ({ id: a.id.slice(0, 60), descricao: a.descricao.slice(0, 300) }));
  pagina.titulo = String(pagina.titulo || '').slice(0, 120);
  pagina.caminho = String(pagina.caminho || '').slice(0, 120);

  const mensagens = (Array.isArray(corpo.mensagens) ? corpo.mensagens : [])
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
    .slice(-10)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 1000) }));
  while (mensagens.length && mensagens[0].role !== 'user') mensagens.shift();
  if (!mensagens.length) return res.status(400).json({ erro: 'Sem pergunta' });

  const chave = process.env.ANTHROPIC_API_KEY;
  if (!chave) {
    return res.status(200).json({
      fala: 'Estou no modo demonstração! Falta configurar a ANTHROPIC_API_KEY na Vercel pra eu responder de verdade.',
      alvo: pagina.alvos[0]?.id || null,
    });
  }

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': chave,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: MODELO,
        max_tokens: 300,
        system: promptDoSistema(pagina),
        messages: mensagens,
      }),
    });
    const dados = await r.json();
    if (!r.ok) {
      console.error('Erro da API:', r.status, dados);
      return res.status(502).json({ erro: 'A IA não respondeu' });
    }
    const texto = (dados.content || []).filter((b) => b.type === 'text').map((b) => b.text).join('');
    const { fala, alvo } = extrairJson(texto);
    const idsValidos = new Set(pagina.alvos.map((a) => a.id));
    return res.status(200).json({
      fala: String(fala || '').slice(0, 800),
      alvo: idsValidos.has(alvo) ? alvo : null,
    });
  } catch (e) {
    console.error('Falha ao chamar a API:', e);
    return res.status(502).json({ erro: 'Falha ao falar com a IA' });
  }
};
