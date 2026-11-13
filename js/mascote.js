/*
 * mascote.js — Equinho, o mascote assistente do EcoRota
 *
 * Instalação em qualquer página (antes do </body>):
 *   <script src="js/mascote.js" data-sprite="sprites/mascote.json" defer></script>
 *
 * Opções (atributos no <script>):
 *   data-api      → endereço do backend (padrão: /api/chat)
 *   data-sprite   → JSON exportado do Aseprite (padrão: sprites/mascote.json ao lado deste arquivo)
 *   data-escala   → tamanho do pixel (padrão: 3)
 *   data-saudacao → primeira fala
 *   data-nome     → nome usado como palavra de ativação por voz (padrão: Equinho)
 *
 * Animações (tags do Aseprite): idle, talk, think, point_left (point_right é opcional: espelha o point_left)
 *
 * Para o mascote apontar para algo, marque o elemento com id + data-mascote:
 *   <button id="comprar" data-mascote="Botão que finaliza a compra">Comprar</button>
 *
 * Acessibilidade:
 *   - Modo mãos livres (botão 👂): diga "Equinho" e a pergunta, sem tocar em nada.
 *     Comandos: "Equinho, parar" (cala qualquer leitura) e "Equinho, desligar".
 *   - Atalho Alt + M: falar com o Equinho de qualquer lugar da página.
 *   - Todos os botões têm nome acessível, então funcionam com controle por voz do sistema
 *     (Acesso por Voz do Windows, Controle por Voz do macOS/iOS, Voice Access do Android).
 */
(() => {
  const script = document.currentScript;
  const PASTA = script ? new URL('.', script.src).href : location.href;
  const opcoesScript = script ? script.dataset : {};
  const reduzMovimento = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

  const guardar = { // lembra entre visitas
    ler(k) { try { return localStorage.getItem('mascote:' + k); } catch { return null; } },
    salvar(k, v) { try { localStorage.setItem('mascote:' + k, v); } catch {} },
  };
  const sessao = { // lembra só enquanto a aba estiver aberta (conversa entre páginas)
    ler(k) { try { return JSON.parse(sessionStorage.getItem('mascote:' + k)); } catch { return null; } },
    salvar(k, v) { try { sessionStorage.setItem('mascote:' + k, JSON.stringify(v)); } catch {} },
    apagar(k) { try { sessionStorage.removeItem('mascote:' + k); } catch {} },
  };

  // tira acentos e pontuação: "É quinho!" → "e quinho"
  const normalizar = (t) => String(t).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();

  // "/" e "/index.html" são a mesma página
  const mesmaPagina = (a, b) => {
    const limpa = (p) => p.replace(/index\.html?$/i, '').replace(/\/+$/, '');
    return limpa(a) === limpa(b);
  };

  const CSS = `
    :host { position: fixed; z-index: 2147483000; left: 0; top: 0; font: 14px/1.4 system-ui, sans-serif; color: #1d1d1d; }
    :host(.movendo) { transition: left .7s ease-in-out, top .7s ease-in-out; }
    .corpo { position: relative; touch-action: none; cursor: grab; }
    .corpo:active { cursor: grabbing; }
    canvas { display: block; image-rendering: pixelated; }
    canvas:focus-visible { outline: 3px solid #1d1d1d; outline-offset: 4px; border-radius: 8px; }
    .bolha {
      position: absolute; bottom: calc(100% + 10px); right: 0; width: 270px; box-sizing: border-box;
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
    button:focus-visible { outline: 3px solid #1d1d1d; outline-offset: 2px; }
    .btn-mic { background: #fff; padding: 4px 8px; }
    .btn-mic.ouvindo { background: #e53935; color: #fff; animation: pulsar 1s infinite; }
    @keyframes pulsar { 0%,100% { box-shadow: 0 0 0 0 rgba(229,57,53,.6); } 50% { box-shadow: 0 0 0 6px rgba(229,57,53,0); } }
    .controles { position: absolute; top: -8px; right: -8px; display: flex; gap: 4px; opacity: .55; transition: opacity .2s; }
    :host(:hover) .controles, .controles:focus-within, :host(.maos-livres) .controles { opacity: 1; }
    .controles button { width: 30px; height: 30px; padding: 0; border-radius: 50%; background: #fff; font-size: 14px; line-height: 1; }
    .controles .btn-maos.ativo { background: #9be550; animation: pulsar-verde 2s infinite; }
    @keyframes pulsar-verde { 0%,100% { box-shadow: 0 0 0 0 rgba(155,229,80,.8); } 50% { box-shadow: 0 0 0 6px rgba(155,229,80,0); } }
    @media (prefers-reduced-motion: reduce) { .btn-mic.ouvindo, .controles .btn-maos.ativo { animation: none; } }
    .reabrir {
      position: fixed; right: 16px; bottom: 16px; width: 52px; height: 52px; border-radius: 50%;
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
      this.historico = sessao.ler('historico') || [];
      this.anim = { nome: 'idle', quadro: 0, acumulado: 0, loop: true, parado: false, espelhar: false };
      this.falaId = 0;
      this.voz = guardar.ler('voz') !== 'off';
      this.ignorarAte = 0;
    }

    opcao(nome, padrao) {
      return this.getAttribute('data-' + nome) ?? opcoesScript[nome] ?? padrao;
    }

    async connectedCallback() {
      if (this.iniciado) return;
      this.iniciado = true;
      this.api = this.opcao('api', '/api/chat');
      this.escala = Number(this.opcao('escala', 3)) || 3;
      this.nome = this.opcao('nome', 'Equinho');

      this.shadowRoot.innerHTML = `
        <style>${CSS}</style>
        <div class="corpo" part="corpo">
          <div class="bolha" role="status" aria-live="polite">
            <p class="texto"></p>
            <form>
              <input type="text" placeholder="Pergunte algo…" maxlength="500" aria-label="Pergunta para o ${this.nome}">
              <button type="button" class="btn-mic" title="Falar a pergunta (Alt + M)" aria-label="Falar a pergunta" aria-pressed="false" hidden>🎤</button>
              <button type="submit">Enviar</button>
            </form>
          </div>
          <canvas aria-label="${this.nome}, o assistente do site. Clique ou aperte Enter para conversar." role="button" tabindex="0"></canvas>
          <div class="controles">
            <button class="btn-maos" title="Modo mãos livres: diga ${this.nome} e sua pergunta" aria-label="Modo mãos livres" aria-pressed="false" hidden>👂</button>
            <button class="btn-voz"></button>
            <button class="btn-fechar" title="Minimizar o ${this.nome}" aria-label="Minimizar o ${this.nome}">✕</button>
          </div>
        </div>
        <button class="reabrir" title="Abrir o ${this.nome}" aria-label="Abrir o ${this.nome}">💬</button>
      `;
      const $ = (s) => this.shadowRoot.querySelector(s);
      this.el = {
        bolha: $('.bolha'), texto: $('.texto'), form: $('form'), input: $('input'),
        enviar: $('form button[type="submit"]'), mic: $('.btn-mic'), canvas: $('canvas'),
        voz: $('.btn-voz'), maos: $('.btn-maos'),
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
      this.irParaCanto(false);
      if (guardar.ler('minimizado') === '1') this.classList.add('minimizado');

      let ultimo = performance.now();
      const loop = (agora) => {
        this.passo(Math.min(agora - ultimo, 250));
        ultimo = agora;
        requestAnimationFrame(loop);
      };
      requestAnimationFrame(loop);

      this.configurarVoz(); // microfone, mãos livres e atalho

      // Chegou de outra página levado pelo Equinho? Continua a conversa aqui.
      const continuar = sessao.ler('continuar');
      sessao.apagar('continuar');
      if (continuar && Date.now() - continuar.quando < 60_000) {
        this.classList.remove('minimizado');
        this.abrirConversa();
        await esperar(500);
        this.perguntar(`(O visitante acabou de chegar nesta página com a sua ajuda.) ${continuar.pergunta}`, { semNavegar: true });
        return;
      }

      // cumprimenta só na primeira página da visita, não a cada troca de página
      if (!this.classList.contains('minimizado') && !sessao.ler('cumprimentou')) {
        sessao.salvar('cumprimentou', true);
        await esperar(600);
        let saudacao = this.opcao('saudacao', `Oi! Eu sou o ${this.nome}. Clique em mim se precisar de ajuda!`);
        if (this.maosLivres) saudacao += ` É só dizer "${this.nome}" e sua pergunta.`;
        this.falar(saudacao, { semVoz: true });
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
      this.classList.toggle('lado-esq', x < 280);
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
      const { w, h } = this.tamanho;
      let r = alvo.getBoundingClientRect();
      // elemento largo demais (ocupa a tela toda)? mira no texto do título dele
      if (r.width > innerWidth - w - 40) {
        const ancora = alvo.querySelector('h1, h2, h3, h4, legend, label, button, a') || alvo;
        const faixa = document.createRange();
        faixa.selectNodeContents(ancora);
        const rt = faixa.getBoundingClientRect();
        if (rt.width) r = rt;
      }
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
        const fim = () => {
          if (this.terminarVoz === fim) this.terminarVoz = null;
          clearTimeout(seguranca);
          this.falandoEmVoz = false;
          this.ignorarAte = Date.now() + 900; // não confundir o eco da própria voz com um comando
          resolve();
        };
        u.onend = fim; u.onerror = fim;
        // alguns navegadores esquecem de disparar onend
        const seguranca = setTimeout(fim, 2500 + texto.length * 90);
        this.terminarVoz = fim; // permite encerrar a espera se a fala for interrompida
        this.falandoEmVoz = true;
        speechSynthesis.speak(u);
      });
    }

    /* Para só a voz do mascote, sem cortar outras leituras do site (ex.: "Ouvir esta página") */
    calarVoz(forcar = false) {
      if (!('speechSynthesis' in window)) return;
      if (forcar || this.falandoEmVoz) speechSynthesis.cancel();
      this.falandoEmVoz = false;
      this.terminarVoz?.();
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

      // links internos da página = lugares para onde o Equinho pode levar o visitante
      const paginas = [];
      const vistos = new Set();
      for (const a of document.querySelectorAll('a[href]')) {
        let u;
        try { u = new URL(a.getAttribute('href'), location.href); } catch { continue; }
        if (u.origin !== location.origin || !/(\.html?|\/)$/i.test(u.pathname)) continue;
        const destino = u.pathname.replace(/^\//, '') + u.hash;
        const texto = (a.getAttribute('aria-label') || a.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 80);
        if (!texto || vistos.has(destino)) continue;
        vistos.add(destino);
        paginas.push({ destino, texto });
        if (paginas.length >= 40) break;
      }
      return { titulo: document.title, caminho: location.pathname, alvos, paginas };
    }

    async perguntar(pergunta, { semNavegar = false } = {}) {
      this.travar(true);
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
        resposta = { fala: 'Ops, não consegui pensar agora… tenta de novo daqui a pouco?', alvo: null };
      }

      const fala = String(resposta.fala || '').slice(0, 800) || 'Hmm, não sei o que dizer.';
      this.historico.push({ role: 'assistant', content: fala });
      sessao.salvar('historico', this.historico);

      // Ir para outra página?
      let destino = null;
      if (resposta.pagina && !semNavegar) {
        try {
          const u = new URL('/' + String(resposta.pagina).replace(/^\/+/, ''), location.origin);
          if (!mesmaPagina(u.pathname, location.pathname)) destino = u;
          else if (u.hash) document.getElementById(decodeURIComponent(u.hash.slice(1)))?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } catch {}
      }

      const pose = !destino && resposta.alvo ? await this.apontarPara(resposta.alvo) : null;
      await this.falar(fala, { pose });

      if (destino) {
        sessao.salvar('continuar', { pergunta: pergunta.replace(/^\(.*?\)\s*/, ''), quando: Date.now() });
        await esperar(300);
        location.href = destino.href;
        return;
      }

      this.travar(false);
      this.el.form.classList.add('visivel');
      if (!this.maosLivres) this.el.input.focus();
    }

    travar(sim) {
      this.el.input.disabled = this.el.enviar.disabled = this.el.mic.disabled = sim;
      this.ocupado = sim;
    }

    /* ---------- Voz: microfone, mãos livres e atalho ---------- */
    configurarVoz() {
      const Reconhecimento = window.SpeechRecognition || window.webkitSpeechRecognition;

      // Alt + M: falar com o Equinho de qualquer lugar (funciona até minimizado)
      addEventListener('keydown', (e) => {
        if (e.altKey && !e.ctrlKey && !e.metaKey && e.code === 'KeyM') {
          e.preventDefault();
          this.classList.remove('minimizado');
          this.abrirConversa();
          if (Reconhecimento) this.ouvir(); else this.el.input.focus();
        }
      });

      if (!Reconhecimento) return; // navegador sem reconhecimento de voz (ex.: Firefox): só texto
      this.Reconhecimento = Reconhecimento;

      this.el.mic.hidden = false;
      this.el.mic.addEventListener('click', () => (this.ouvindo ? this.pararDeOuvir() : this.ouvir()));
      this.shadowRoot.addEventListener('keydown', (e) => { // Esc cancela sem enviar
        if (e.key === 'Escape' && this.ouvindo) { this.cancelado = true; this.rec?.abort(); }
      });

      this.el.maos.hidden = false;
      this.el.maos.addEventListener('click', () => this.definirMaosLivres(!this.maosLivres, { avisar: true }));
      if (guardar.ler('maoslivres') === '1') this.definirMaosLivres(true, { avisar: false });
    }

    /* Pergunta única: escuta até a pessoa parar de falar e envia */
    async ouvir() {
      if (this.ouvindo || this.ocupado || !this.Reconhecimento) return;
      this.pararEscuta();   // só um reconhecimento por vez
      this.calarVoz();      // para o Equinho não ouvir a própria voz
      this.falaId++;
      this.tocar('idle');
      this.ouvindo = true;
      await esperar(250);

      const rec = new this.Reconhecimento();
      rec.lang = 'pt-BR';
      rec.interimResults = true;   // mostra o texto enquanto a pessoa fala
      rec.continuous = false;      // para sozinho quando a pessoa fica em silêncio
      rec.maxAlternatives = 1;

      let final = '';
      let erro = null;
      this.rec = rec;
      this.cancelado = false;
      this.marcarMic(true);
      this.abrirConversa();
      this.el.texto.textContent = 'Estou ouvindo… pode falar!';
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
      rec.onend = async () => {
        this.ouvindo = false;
        this.rec = null;
        this.marcarMic(false);
        this.el.input.placeholder = 'Pergunte algo…';
        const texto = (final || this.el.input.value).trim();

        if (this.cancelado || erro === 'aborted') {
          this.el.input.value = '';
          this.el.texto.textContent = 'Tudo bem, cancelei. Em que posso ajudar?';
        } else if (texto) {
          this.el.input.value = '';
          await this.perguntar(texto);
        } else {
          await this.falar(this.mensagemErroMicrofone(erro || 'no-speech'), { semVoz: !this.maosLivres });
        }
        this.retomarEscuta();
      };

      try { rec.start(); }
      catch { erro = 'start'; rec.onend(); }
    }

    pararDeOuvir() {
      this.rec?.stop(); // stop() termina e envia o que já foi ouvido
    }

    marcarMic(ligado) {
      const m = this.el.mic;
      m.classList.toggle('ouvindo', ligado);
      m.setAttribute('aria-pressed', String(ligado));
      const rotulo = ligado ? 'Parar de ouvir e enviar' : 'Falar a pergunta';
      m.title = rotulo + ' (Alt + M)';
      m.setAttribute('aria-label', rotulo);
    }

    /* Modo mãos livres: fica escutando a palavra "Equinho" */
    definirMaosLivres(ligar, { avisar = false, lembrar = true } = {}) {
      this.maosLivres = ligar;
      this.ligadoAutomatico = ligar && !avisar; // religado sozinho ao abrir a página
      if (lembrar) guardar.salvar('maoslivres', ligar ? '1' : '0');
      this.el.maos.classList.toggle('ativo', ligar);
      this.el.maos.setAttribute('aria-pressed', String(ligar));
      this.el.maos.title = ligar
        ? `Mãos livres ligado: diga "${this.nome}" e sua pergunta. Clique para desligar.`
        : `Modo mãos livres: diga ${this.nome} e sua pergunta`;
      this.classList.toggle('maos-livres', ligar);

      if (ligar) {
        this.iniciarEscuta();
        if (avisar) {
          this.abrirConversa();
          this.falar(`Mãos livres ligado! Agora é só dizer "${this.nome}" e sua pergunta. Pra calar qualquer leitura, diga "${this.nome}, parar".`);
        }
      } else {
        this.pararEscuta();
        if (avisar) this.falar('Mãos livres desligado.');
      }
    }

    iniciarEscuta() {
      if (!this.maosLivres || this.recEscuta || this.ouvindo || this.classList.contains('minimizado')) return;
      const rec = new this.Reconhecimento();
      rec.lang = 'pt-BR';
      rec.continuous = true;
      rec.interimResults = true;
      this.recEscuta = rec;
      let erro = null;

      rec.onresult = (e) => {
        for (let i = e.resultIndex; i < e.results.length; i++) {
          this.tratarEscuta(e.results[i][0].transcript, e.results[i].isFinal);
        }
      };
      rec.onerror = (e) => { erro = e.error; };
      rec.onend = () => {
        if (this.recEscuta !== rec) return;
        this.recEscuta = null;
        if (['not-allowed', 'service-not-allowed', 'network', 'audio-capture'].includes(erro)) {
          // permissão negada ou navegador sem suporte: desliga e explica
          const automatico = erro === 'not-allowed' && this.ligadoAutomatico;
          this.definirMaosLivres(false, { lembrar: !automatico });
          this.abrirConversa();
          this.falar(automatico
            ? 'Toque no botão 👂 pra religar o modo mãos livres nesta página.'
            : this.mensagemErroMicrofone(erro), { semVoz: true });
          return;
        }
        // o navegador encerra a escuta de tempos em tempos: religa sozinho
        setTimeout(() => this.iniciarEscuta(), 300);
      };

      try { rec.start(); }
      catch { this.recEscuta = null; }
    }

    pararEscuta() {
      const r = this.recEscuta;
      this.recEscuta = null;
      if (r) { r.onend = null; r.onresult = null; try { r.abort(); } catch {} }
    }

    retomarEscuta() {
      if (this.maosLivres) setTimeout(() => this.iniciarEscuta(), 400);
    }

    tratarEscuta(textoOriginal, final) {
      const palavras = textoOriginal.trim().split(/\s+/);
      const norm = palavras.map(normalizar);
      const nomeNorm = normalizar(this.nome);
      // aceita variações que o reconhecimento costuma escrever: "Equinho", "é quinho", "ekinho", "equino"...
      const ehNome = (w) => w === nomeNorm || /^e?(qu|k)i?nh?o$/.test(w) || w === 'equino';
      let fim = -1;
      for (let i = 0; i < norm.length; i++) {
        if (ehNome(norm[i])) { fim = i + 1; break; }
        if (norm[i] === 'e' && /^(qu|k)inh?o$/.test(norm[i + 1] || '')) { fim = i + 2; break; }
      }
      if (fim === -1) return;

      const resto = palavras.slice(fim).join(' ').replace(/^[\s,.!?:;]+/, '').trim();
      const comando = normalizar(resto);

      // "Equinho, parar" funciona a qualquer momento, até durante a leitura da página
      if (/^(parar?|pare|para de falar|silencio|chega|cala)\b/.test(comando)) {
        if (final) {
          if ('speechSynthesis' in window) speechSynthesis.cancel();
          this.falandoEmVoz = false;
          this.terminarVoz?.();
          this.falaId++;
          this.tocar('idle');
          this.el.texto.textContent = 'Parei! Em que posso ajudar?';
        }
        return;
      }
      if (!final || this.falandoEmVoz || Date.now() < this.ignorarAte || this.ocupado || this.ouvindo) return;

      if (/^(desligar?|desliga|tchau)\b/.test(comando)) { this.definirMaosLivres(false, { avisar: true }); return; }

      this.abrirConversa();
      if (comando.split(' ').filter(Boolean).length >= 2) {
        this.perguntar(resto);  // "Equinho, como peço coleta?" → pergunta direto
      } else {
        // só "Equinho": responde e escuta a pergunta
        this.pararEscuta();
        this.falar('Oi! Pode falar.').then(() => this.ouvir());
      }
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
        this.pararEscuta();
        if (this.ouvindo) { this.cancelado = true; this.rec?.abort(); }
        this.classList.add('minimizado');
        guardar.salvar('minimizado', '1');
      });
      this.shadowRoot.querySelector('.reabrir').addEventListener('click', () => {
        this.classList.remove('minimizado');
        guardar.salvar('minimizado', '0');
        this.irParaCanto(false);
        this.abrirConversa();
        this.retomarEscuta();
      });

      addEventListener('resize', () => this.mover(this.pos.x, this.pos.y, false));
    }

    abrirConversa() {
      if (this.classList.contains('minimizado')) {
        this.classList.remove('minimizado');
        guardar.salvar('minimizado', '0');
        this.irParaCanto(false);
      }
      this.el.form.classList.add('visivel');
      this.el.bolha.classList.add('visivel');
      if (!this.el.texto.textContent) this.el.texto.textContent = 'Em que posso ajudar?';
    }

    alternarConversa() {
      if (this.el.form.classList.contains('visivel')) {
        this.el.form.classList.remove('visivel');
        this.el.bolha.classList.remove('visivel');
        this.calarVoz();
        if (this.ouvindo) { this.cancelado = true; this.rec?.abort(); }
        this.falaId++;
        this.tocar('idle');
        return;
      }
      this.abrirConversa();
      this.el.input.focus();
    }

    atualizarBotaoVoz() {
      this.el.voz.textContent = this.voz ? '🔊' : '🔇';
      const rotulo = this.voz ? `Voz do ${this.nome} ligada. Clique para desligar` : `Voz do ${this.nome} desligada. Clique para ligar`;
      this.el.voz.title = rotulo;
      this.el.voz.setAttribute('aria-label', rotulo);
    }
  }

  if (!customElements.get('mascote-ia')) customElements.define('mascote-ia', MascoteIA);
  const colocar = () => { if (!document.querySelector('mascote-ia')) document.body.appendChild(document.createElement('mascote-ia')); };
  if (document.body) colocar(); else addEventListener('DOMContentLoaded', colocar);
})();
