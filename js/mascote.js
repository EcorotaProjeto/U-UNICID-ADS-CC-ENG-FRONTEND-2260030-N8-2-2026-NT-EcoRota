/*
 * mascote.js — mascote virtual 2D para sites
 *
 * Instalação em qualquer página:
 *   <script src="/mascote.js" data-api="/api/chat" defer></script>
 *
 * Opções (atributos no <script> ou numa tag <mascote-ia> que você mesmo colocar):
 *   data-api     → endereço do seu backend (padrão: /api/chat)
 *   data-sprite  → JSON exportado do Aseprite (padrão: sprites/mascote.json ao lado deste arquivo)
 *   data-escala  → tamanho do pixel (padrão: 3)
 *   data-saudacao→ primeira fala
 *
 * Animações (tags do Aseprite) que ele entende:
 *   idle, talk, think, point_left (point_right é opcional: se não existir, espelha o point_left)
 *
 * Para o mascote poder apontar para algo, marque o elemento com id + data-mascote:
 *   <button id="comprar" data-mascote="Botão que finaliza a compra">Comprar</button>
 */
(() => {
  const script = document.currentScript;
  const PASTA = script ? new URL('.', script.src).href : location.href;
  const opcoesScript = script ? script.dataset : {};
  const reduzMovimento = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

  const guardar = {
    ler(k) { try { return localStorage.getItem('mascote:' + k); } catch { return null; } },
    salvar(k, v) { try { localStorage.setItem('mascote:' + k, v); } catch {} },
  };

  const CSS = `
    :host { position: fixed; z-index: 2147483000; left: 0; top: 0; font: 14px/1.4 system-ui, sans-serif; color: #1d1d1d; }
    :host(.movendo) { transition: left .7s ease-in-out, top .7s ease-in-out; }
    .corpo { position: relative; touch-action: none; cursor: grab; }
    .corpo:active { cursor: grabbing; }
    canvas { display: block; image-rendering: pixelated; }
    .bolha {
      position: absolute; bottom: calc(100% + 10px); right: 0; width: 260px; box-sizing: border-box;
      background: #fff; border: 3px solid #1d1d1d; border-radius: 12px; padding: 10px 12px;
      box-shadow: 4px 4px 0 rgba(0,0,0,.18); display: none;
    }
    .bolha.visivel { display: block; }
    :host(.lado-esq) .bolha { right: auto; left: 0; }
    .bolha::after {
      content: ''; position: absolute; bottom: -12px; right: 24px; width: 16px; height: 16px; background: #fff;
      border-right: 3px solid #1d1d1d; border-bottom: 3px solid #1d1d1d; transform: rotate(45deg) translate(-4px,-4px);
    }
    :host(.lado-esq) .bolha::after { right: auto; left: 24px; }
    :host(.bolha-baixo) .bolha { bottom: auto; top: calc(100% + 10px); }
    :host(.bolha-baixo) .bolha::after { bottom: auto; top: -12px; transform: rotate(225deg) translate(-4px,-4px); }
    .texto { margin: 0; white-space: pre-wrap; word-wrap: break-word; max-height: 220px; overflow-y: auto; }
    .pontinhos span { display: inline-block; animation: pula 1s infinite; font-weight: bold; }
    .pontinhos span:nth-child(2) { animation-delay: .15s; } .pontinhos span:nth-child(3) { animation-delay: .3s; }
    @keyframes pula { 0%,60%,100% { transform: none; } 30% { transform: translateY(-4px); } }
    form { display: none; gap: 6px; margin-top: 8px; }
    form.visivel { display: flex; }
    input { flex: 1; min-width: 0; border: 2px solid #1d1d1d; border-radius: 8px; padding: 6px 8px; font: inherit; }
    button { font: inherit; cursor: pointer; border: 2px solid #1d1d1d; border-radius: 8px; background: #9be550; padding: 4px 10px; }
    button:disabled { opacity: .5; cursor: default; }
    .btn-mic { background: #fff; padding: 4px 8px; }
    .btn-mic.ouvindo { background: #e53935; color: #fff; animation: pulsar 1s infinite; }
    @keyframes pulsar { 0%,100% { box-shadow: 0 0 0 0 rgba(229,57,53,.6); } 50% { box-shadow: 0 0 0 6px rgba(229,57,53,0); } }
    @media (prefers-reduced-motion: reduce) { .btn-mic.ouvindo { animation: none; } }
    .controles { position: absolute; top: -6px; right: -6px; display: flex; gap: 4px; opacity: 0; transition: opacity .2s; }
    :host(:hover) .controles, .controles:focus-within { opacity: 1; }
    .controles button { width: 26px; height: 26px; padding: 0; border-radius: 50%; background: #fff; font-size: 12px; line-height: 1; }
    .reabrir {
      position: fixed; right: 16px; bottom: 16px; width: 48px; height: 48px; border-radius: 50%;
      background: #9be550; font-size: 22px; display: none; box-shadow: 3px 3px 0 rgba(0,0,0,.2);
    }
    :host(.minimizado) .corpo { display: none; }
    :host(.minimizado) .reabrir { display: block; }
  `;

  class MascoteIA extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this.anims = {};
      this.historico = [];
      this.anim = { nome: 'idle', quadro: 0, acumulado: 0, loop: true, parado: false, espelhar: false };
      this.falaId = 0;
      this.voz = guardar.ler('voz') !== 'off';
    }

    opcao(nome, padrao) {
      return this.getAttribute('data-' + nome) ?? opcoesScript[nome] ?? padrao;
    }

    async connectedCallback() {
      if (this.iniciado) return;
      this.iniciado = true;
      this.api = this.opcao('api', '/api/chat');
      this.escala = Number(this.opcao('escala', 3)) || 3;

      this.shadowRoot.innerHTML = `
        <style>${CSS}</style>
        <div class="corpo" part="corpo">
          <div class="bolha" role="status" aria-live="polite">
            <p class="texto"></p>
            <form>
              <input type="text" placeholder="Pergunte algo…" maxlength="500" aria-label="Pergunta para o assistente">
              <button type="button" class="btn-mic" title="Falar a pergunta" aria-label="Falar a pergunta" aria-pressed="false" hidden>🎤</button>
              <button type="submit">Enviar</button>
            </form>
          </div>
          <canvas aria-label="Mascote assistente. Clique para conversar." role="button" tabindex="0"></canvas>
          <div class="controles">
            <button class="btn-voz" title="Ligar/desligar voz"></button>
            <button class="btn-fechar" title="Minimizar">✕</button>
          </div>
        </div>
        <button class="reabrir" title="Abrir assistente">💬</button>
      `;
      const $ = (s) => this.shadowRoot.querySelector(s);
      this.el = {
        bolha: $('.bolha'), texto: $('.texto'), form: $('form'), input: $('input'),
        enviar: $('form button[type="submit"]'), mic: $('.btn-mic'), canvas: $('canvas'), voz: $('.btn-voz'),
      };
      this.ctx = this.el.canvas.getContext('2d');
      this.atualizarBotaoVoz();

      try {
        await this.carregarSprite(this.opcao('sprite', PASTA + 'sprites/mascote.json'));
      } catch (e) {
        console.error('[mascote] não consegui carregar o sprite:', e);
        return;
      }

      this.ligarEventos();
      this.configurarMicrofone();
      this.irParaCanto(false);
      if (guardar.ler('minimizado') === '1') this.classList.add('minimizado');

      let ultimo = performance.now();
      const loop = (agora) => {
        this.passo(Math.min(agora - ultimo, 250));
        ultimo = agora;
        requestAnimationFrame(loop);
      };
      requestAnimationFrame(loop);

      if (!this.classList.contains('minimizado')) {
        await esperar(600);
        this.falar(this.opcao('saudacao', 'Oi! Sou o assistente deste site. Clique em mim se precisar de ajuda!'), { semVoz: true });
      }
    }

    /* ---------- Sprite (formato JSON do Aseprite, Array ou Hash) ---------- */
    async carregarSprite(urlJson) {
      const url = new URL(urlJson, location.href);
      const dados = await (await fetch(url)).json();
      const quadros = Array.isArray(dados.frames) ? dados.frames : Object.values(dados.frames);
      this.img = new Image();
      this.img.src = new URL(dados.meta.image, url).href;
      await this.img.decode();

      const tags = dados.meta.frameTags || [];
      for (const t of tags) {
        let lista = quadros.slice(t.from, t.to + 1);
        if (t.direction === 'reverse') lista = lista.reverse();
        if (t.direction === 'pingpong') lista = lista.concat(lista.slice(1, -1).reverse());
        this.anims[t.name] = lista;
      }
      if (!this.anims.idle) this.anims.idle = tags.length ? quadros.slice(tags[0].from, tags[0].to + 1) : quadros;

      this.largura = quadros[0].sourceSize.w;
      this.altura = quadros[0].sourceSize.h;
      const c = this.el.canvas;
      c.width = this.largura; c.height = this.altura;
      c.style.width = this.largura * this.escala + 'px';
      c.style.height = this.altura * this.escala + 'px';
    }

    tocar(nome, { loop = true } = {}) {
      let espelhar = false;
      if (!this.anims[nome]) {
        if (nome === 'point_right' && this.anims.point_left) { nome = 'point_left'; espelhar = true; }
        else if (nome === 'point_left' && this.anims.point_right) { nome = 'point_right'; espelhar = true; }
        else nome = 'idle';
      }
      const a = this.anim;
      if (a.nome === nome && a.espelhar === espelhar && loop && a.loop) return;
      Object.assign(a, { nome, quadro: 0, acumulado: 0, loop, parado: false, espelhar });
    }

    passo(dt) {
      const a = this.anim;
      const lista = this.anims[a.nome];
      if (!lista) return;
      if (!a.parado) {
        a.acumulado += dt;
        while (a.acumulado >= (lista[a.quadro].duration || 100)) {
          a.acumulado -= lista[a.quadro].duration || 100;
          if (a.quadro < lista.length - 1) a.quadro++;
          else if (a.loop) a.quadro = 0;
          else { a.parado = true; break; }
        }
      }
      const q = lista[a.quadro];
      const ctx = this.ctx;
      ctx.clearRect(0, 0, this.largura, this.altura);
      ctx.save();
      if (a.espelhar) { ctx.translate(this.largura, 0); ctx.scale(-1, 1); }
      const s = q.spriteSourceSize || { x: 0, y: 0 };
      ctx.drawImage(this.img, q.frame.x, q.frame.y, q.frame.w, q.frame.h, s.x, s.y, q.frame.w, q.frame.h);
      ctx.restore();
    }

    /* ---------- Posição ---------- */
    get tamanho() { return { w: this.largura * this.escala, h: this.altura * this.escala }; }

    mover(x, y, animado = true) {
      const { w, h } = this.tamanho;
      x = Math.max(4, Math.min(x, innerWidth - w - 4));
      y = Math.max(4, Math.min(y, innerHeight - h - 4));
      this.classList.toggle('movendo', animado && !reduzMovimento);
      this.style.left = x + 'px';
      this.style.top = y + 'px';
      this.pos = { x, y };
      this.classList.toggle('lado-esq', x < 270);
      this.classList.toggle('bolha-baixo', y < 190);
      return esperar(animado && !reduzMovimento ? 720 : 0);
    }

    irParaCanto(animado = true) {
      const { w, h } = this.tamanho;
      return this.mover(innerWidth - w - 24, innerHeight - h - 16, animado);
    }

    /* Desliza até ficar ao lado do elemento e aponta para ele */
    async apontarPara(id) {
      const alvo = id && document.getElementById(id);
      if (!alvo) return null;
      alvo.scrollIntoView({ behavior: reduzMovimento ? 'auto' : 'smooth', block: 'center' });
      await esperar(reduzMovimento ? 50 : 550);
      const r = alvo.getBoundingClientRect();
      const { w, h } = this.tamanho;
      const y = r.top + r.height / 2 - h * 0.52; // altura do braço no desenho (~metade)
      const cabeDireita = r.right + 8 + w <= innerWidth;
      await this.mover(cabeDireita ? r.right + 8 : r.left - w - 8, y);
      const pose = cabeDireita ? 'point_left' : 'point_right';
      this.tocar(pose, { loop: false });
      this.destacar(alvo);
      return pose;
    }

    destacar(el) {
      const antes = { outline: el.style.outline, offset: el.style.outlineOffset, transition: el.style.transition };
      el.style.transition = 'outline-color .3s';
      el.style.outline = '3px dashed #9be550';
      el.style.outlineOffset = '4px';
      setTimeout(() => Object.assign(el.style, { outline: antes.outline, outlineOffset: antes.offset, transition: antes.transition }), 3500);
    }

    /* ---------- Fala ---------- */
    async falar(texto, { pose = null, semVoz = false } = {}) {
      const id = ++this.falaId;
      const usarVoz = this.voz && !semVoz;
      if (usarVoz) this.calarVoz(true); // só interrompe outra leitura quando o mascote vai falar em voz
      this.el.bolha.classList.add('visivel');
      this.el.texto.textContent = '';
      if (!pose) this.tocar('talk'); // com pose, quem chamou já tocou a animação

      const digitar = (async () => {
        if (reduzMovimento) { this.el.texto.textContent = texto; return; }
        for (let i = 1; i <= texto.length; i++) {
          if (id !== this.falaId) return;
          this.el.texto.textContent = texto.slice(0, i);
          await esperar(22);
        }
      })();
      const vozFeita = usarVoz ? this.dizerEmVoz(texto) : Promise.resolve();
      await Promise.all([digitar, vozFeita]);
      if (id !== this.falaId) return;

      if (!pose) this.tocar('idle');
      else setTimeout(() => { if (id === this.falaId) this.tocar('idle'); }, 3000);
    }

    dizerEmVoz(texto) {
      if (!('speechSynthesis' in window)) return Promise.resolve();
      return new Promise((resolve) => {
        const u = new SpeechSynthesisUtterance(texto);
        const vozPt = speechSynthesis.getVoices().find((v) => v.lang?.toLowerCase().startsWith('pt'));
        if (vozPt) u.voice = vozPt;
        u.lang = vozPt?.lang || 'pt-BR';
        u.pitch = 1.5;   // mais agudo = mais "mascote"
        u.rate = 1.05;
        const fim = () => { clearTimeout(seguranca); this.falandoEmVoz = false; resolve(); };
        u.onend = fim; u.onerror = fim;
        // alguns navegadores esquecem de disparar onend
        const seguranca = setTimeout(resolve, 2500 + texto.length * 90);
        this.falandoEmVoz = true;
        speechSynthesis.speak(u);
      });
    }

    /* Para só a voz do mascote, sem cortar outras leituras do site (ex.: "Ouvir esta página") */
    calarVoz(forcar = false) {
      if (!('speechSynthesis' in window)) return;
      if (forcar || this.falandoEmVoz) speechSynthesis.cancel();
      this.falandoEmVoz = false;
    }

    pensar() {
      this.falaId++;
      this.tocar('think');
      this.el.bolha.classList.add('visivel');
      this.el.texto.innerHTML = '<span class="pontinhos"><span>•</span><span>•</span><span>•</span></span>';
    }

    /* ---------- Conversa com a IA ---------- */
    contextoDaPagina() {
      const alvos = [...document.querySelectorAll('[data-mascote][id]')]
        .slice(0, 40)
        .map((el) => ({ id: el.id, descricao: el.dataset.mascote.slice(0, 300) }));
      return { titulo: document.title, caminho: location.pathname, alvos };
    }

    async perguntar(pergunta) {
      this.el.input.disabled = this.el.enviar.disabled = this.el.mic.disabled = true;
      this.pensar();
      this.historico.push({ role: 'user', content: pergunta });
      this.historico = this.historico.slice(-10);

      let resposta;
      try {
        const r = await fetch(this.api, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mensagens: this.historico, pagina: this.contextoDaPagina() }),
        });
        resposta = await r.json();
        if (!r.ok) throw new Error(resposta.erro || r.status);
      } catch (e) {
        console.warn('[mascote] erro na API:', e);
        resposta = { fala: 'Ops, não consegui pensar agora… tenta de novo daqui a pouco?', pose: null, alvo: null };
      }

      const fala = String(resposta.fala || '').slice(0, 800) || 'Hmm, não sei o que dizer.';
      this.historico.push({ role: 'assistant', content: fala });

      const pose = resposta.alvo ? await this.apontarPara(resposta.alvo) : null;
      await this.falar(fala, { pose });

      this.el.input.disabled = this.el.enviar.disabled = this.el.mic.disabled = false;
      this.el.form.classList.add('visivel');
      this.el.input.focus();
    }

    /* ---------- Microfone: perguntar falando (Web Speech API) ---------- */
    configurarMicrofone() {
      const Reconhecimento = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!Reconhecimento) return; // navegador sem suporte (ex.: Firefox): o botão fica escondido
      this.Reconhecimento = Reconhecimento;
      this.el.mic.hidden = false;
      this.el.mic.addEventListener('click', () => (this.ouvindo ? this.pararDeOuvir() : this.ouvir()));
      // Esc cancela sem enviar
      this.shadowRoot.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.ouvindo) { this.cancelado = true; this.rec?.abort(); }
      });
    }

    ouvir() {
      if (this.ouvindo || this.el.input.disabled) return;
      this.calarVoz();      // para o Equinho não ouvir a própria voz
      this.falaId++;
      this.tocar('idle');

      const rec = new this.Reconhecimento();
      rec.lang = 'pt-BR';
      rec.interimResults = true;   // mostra o texto enquanto a pessoa fala
      rec.continuous = false;      // para sozinho quando a pessoa fica em silêncio
      rec.maxAlternatives = 1;

      let final = '';
      let erro = null;
      this.rec = rec;
      this.ouvindo = true;
      this.cancelado = false;
      this.marcarMic(true);
      this.el.texto.textContent = 'Estou ouvindo… pode falar! (clique no 🎤 de novo quando terminar)';
      this.el.input.value = '';
      this.el.input.placeholder = 'Ouvindo…';

      rec.onresult = (e) => {
        let parcial = '';
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const trecho = e.results[i][0].transcript;
          if (e.results[i].isFinal) final += trecho; else parcial += trecho;
        }
        this.el.input.value = (final + parcial).trim();
      };
      rec.onerror = (e) => { erro = e.error; };
      rec.onend = () => {
        this.ouvindo = false;
        this.rec = null;
        this.marcarMic(false);
        this.el.input.placeholder = 'Pergunte algo…';
        const texto = (final || this.el.input.value).trim();

        if (this.cancelado || erro === 'aborted') {
          this.el.input.value = '';
          this.el.texto.textContent = 'Tudo bem, cancelei. Em que posso ajudar?';
          return;
        }
        if (texto) { this.el.input.value = ''; this.perguntar(texto); return; }
        this.falar(this.mensagemErroMicrofone(erro || 'no-speech'), { semVoz: true });
        this.el.form.classList.add('visivel');
      };

      try { rec.start(); }
      catch (e) { erro = 'start'; rec.onend(); }
    }

    pararDeOuvir() {
      this.rec?.stop(); // stop() termina e envia o que já foi ouvido
    }

    marcarMic(ligado) {
      const m = this.el.mic;
      m.classList.toggle('ouvindo', ligado);
      m.setAttribute('aria-pressed', String(ligado));
      const rotulo = ligado ? 'Parar de ouvir e enviar' : 'Falar a pergunta';
      m.title = rotulo;
      m.setAttribute('aria-label', rotulo);
    }

    mensagemErroMicrofone(erro) {
      switch (erro) {
        case 'not-allowed':
          return 'Preciso de permissão pra usar o microfone. Clique no cadeado ao lado do endereço do site e libere o microfone.';
        case 'service-not-allowed':
        case 'network':
          return 'O reconhecimento de voz não funciona neste navegador. Tente no Chrome, Edge ou Safari, ou digite sua pergunta.';
        case 'audio-capture':
          return 'Não encontrei nenhum microfone ligado. Confere se ele está conectado?';
        case 'no-speech':
          return 'Não ouvi nada… tenta de novo, falando pertinho do microfone?';
        default:
          return 'Algo deu errado com o microfone. Pode digitar a pergunta?';
      }
    }

    /* ---------- Interação ---------- */
    ligarEventos() {
      const c = this.el.canvas;
      let arrasto = null;

      c.addEventListener('pointerdown', (e) => {
        arrasto = { x: e.clientX, y: e.clientY, ox: this.pos.x, oy: this.pos.y, moveu: false };
        c.setPointerCapture(e.pointerId);
      });
      c.addEventListener('pointermove', (e) => {
        if (!arrasto) return;
        const dx = e.clientX - arrasto.x, dy = e.clientY - arrasto.y;
        if (Math.abs(dx) + Math.abs(dy) > 5) arrasto.moveu = true;
        if (arrasto.moveu) this.mover(arrasto.ox + dx, arrasto.oy + dy, false);
      });
      c.addEventListener('pointerup', () => {
        if (arrasto && !arrasto.moveu) this.alternarConversa();
        arrasto = null;
      });
      c.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this.alternarConversa(); }
      });

      this.el.form.addEventListener('submit', (e) => {
        e.preventDefault();
        const p = this.el.input.value.trim();
        if (!p) return;
        this.el.input.value = '';
        this.perguntar(p);
      });

      this.el.voz.addEventListener('click', () => {
        this.voz = !this.voz;
        guardar.salvar('voz', this.voz ? 'on' : 'off');
        if (!this.voz) this.calarVoz();
        this.atualizarBotaoVoz();
      });
      this.shadowRoot.querySelector('.btn-fechar').addEventListener('click', () => {
        this.calarVoz();
        this.classList.add('minimizado');
        guardar.salvar('minimizado', '1');
      });
      this.shadowRoot.querySelector('.reabrir').addEventListener('click', () => {
        this.classList.remove('minimizado');
        guardar.salvar('minimizado', '0');
        this.irParaCanto(false);
        this.alternarConversa(true);
      });

      addEventListener('resize', () => this.mover(this.pos.x, this.pos.y, false));
    }

    alternarConversa(forcarAbrir = false) {
      const aberto = this.el.form.classList.contains('visivel');
      if (aberto && !forcarAbrir) {
        this.el.form.classList.remove('visivel');
        this.el.bolha.classList.remove('visivel');
        this.calarVoz();
        if (this.ouvindo) { this.cancelado = true; this.rec?.abort(); }
        this.falaId++;
        this.tocar('idle');
        return;
      }
      this.el.form.classList.add('visivel');
      if (!this.el.texto.textContent) this.el.texto.textContent = 'Em que posso ajudar?';
      this.el.bolha.classList.add('visivel');
      this.el.input.focus();
    }

    atualizarBotaoVoz() {
      this.el.voz.textContent = this.voz ? '🔊' : '🔇';
    }
  }

  if (!customElements.get('mascote-ia')) customElements.define('mascote-ia', MascoteIA);
  const colocar = () => { if (!document.querySelector('mascote-ia')) document.body.appendChild(document.createElement('mascote-ia')); };
  if (document.body) colocar(); else addEventListener('DOMContentLoaded', colocar);
})();
