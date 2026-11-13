/* Telefone com seletor de país, DDD entre parênteses e número.
   Valida códigos de país existentes, DDDs brasileiros existentes e a quantidade de dígitos.
   O campo original (name="telefone") continua no formulário, com o valor montado: +55 11 912345678. */
(function () {
  "use strict";

  // Códigos de país (E.164) atribuídos, sem o "+".
  var CODIGOS_PAIS = new Set(("1 7 20 27 30 31 32 33 34 36 39 40 41 43 44 45 46 47 48 49 " +
    "51 52 53 54 55 56 57 58 60 61 62 63 64 65 66 81 82 84 86 90 91 92 93 94 95 98 " +
    "211 212 213 216 218 220 221 222 223 224 225 226 227 228 229 230 231 232 233 234 235 236 237 238 239 " +
    "240 241 242 243 244 245 246 247 248 249 250 251 252 253 254 255 256 257 258 260 261 262 263 264 265 266 267 268 269 " +
    "290 291 297 298 299 350 351 352 353 354 355 356 357 358 359 370 371 372 373 374 375 376 377 378 380 381 382 383 385 386 387 389 " +
    "420 421 423 500 501 502 503 504 505 506 507 508 509 590 591 592 593 594 595 596 597 598 599 " +
    "670 672 673 674 675 676 677 678 679 680 681 682 683 685 686 687 688 689 690 691 692 " +
    "800 808 850 852 853 855 856 870 878 880 881 882 883 886 888 960 961 962 963 964 965 966 967 968 970 971 972 973 974 975 976 977 979 991 992 993 994 995 996 998").split(" "));

  // DDDs brasileiros existentes.
  var DDDS_BR = new Set(("11 12 13 14 15 16 17 18 19 21 22 24 27 28 31 32 33 34 35 37 38 41 42 43 44 45 46 47 48 49 " +
    "51 53 54 55 61 62 63 64 65 66 67 68 69 71 73 74 75 77 79 81 82 83 84 85 86 87 88 89 91 92 93 94 95 96 97 98 99").split(" "));

  // Países mais usados no seletor. "outro" permite digitar qualquer código.
  var PAISES = [
    { iso: "BR", nome: "Brasil", codigo: "55" },
    { iso: "US", nome: "EUA e Canadá", codigo: "1" },
    { iso: "PT", nome: "Portugal", codigo: "351" },
    { iso: "AR", nome: "Argentina", codigo: "54" },
    { iso: "CL", nome: "Chile", codigo: "56" },
    { iso: "CO", nome: "Colômbia", codigo: "57" },
    { iso: "PE", nome: "Peru", codigo: "51" },
    { iso: "MX", nome: "México", codigo: "52" },
    { iso: "UY", nome: "Uruguai", codigo: "598" },
    { iso: "PY", nome: "Paraguai", codigo: "595" },
    { iso: "BO", nome: "Bolívia", codigo: "591" },
    { iso: "ES", nome: "Espanha", codigo: "34" },
    { iso: "IT", nome: "Itália", codigo: "39" },
    { iso: "FR", nome: "França", codigo: "33" },
    { iso: "DE", nome: "Alemanha", codigo: "49" },
    { iso: "GB", nome: "Reino Unido", codigo: "44" },
    { iso: "NL", nome: "Países Baixos", codigo: "31" },
    { iso: "JP", nome: "Japão", codigo: "81" },
    { iso: "CN", nome: "China", codigo: "86" },
    { iso: "OUTRO", nome: "Outro país", codigo: "" }
  ];

  function bandeira(iso) {
    if (iso === "OUTRO") return "🌐";
    return String.fromCodePoint.apply(null, iso.split("").map(function (c) { return 0x1F1E6 + c.charCodeAt(0) - 65; }));
  }

  function validarBR(nacional) {
    if (nacional.length !== 10 && nacional.length !== 11) {
      return "Telefone com DDD deve ter 10 dígitos (fixo) ou 11 dígitos (celular).";
    }
    if (!DDDS_BR.has(nacional.slice(0, 2))) {
      return "DDD " + nacional.slice(0, 2) + " não existe.";
    }
    return "";
  }

  // Retorna "" se válido; caso contrário, a mensagem de erro.
  function validarTelefone(valor) {
    var s = String(valor || "").trim();
    if (s === "") return "";
    if (!/^\+?[0-9\s().-]+$/.test(s)) {
      return "Use apenas números, espaços, parênteses, hífen e o + no início.";
    }
    var internacional = s.charAt(0) === "+";
    var digitos = s.replace(/\D/g, "");
    if (digitos === "") return "Digite o número de telefone.";

    if (internacional) {
      var codigo = "";
      for (var len = 3; len >= 1; len--) {
        var cand = digitos.slice(0, len);
        if (cand.length === len && CODIGOS_PAIS.has(cand)) { codigo = cand; break; }
      }
      if (!codigo) return "Código de país inexistente.";
      var resto = digitos.slice(codigo.length);
      if (codigo === "55") return validarBR(resto);
      if (codigo === "1") {
        return resto.length === 10 ? "" : "Número com +1 deve ter 10 dígitos depois do código.";
      }
      var total = digitos.length;
      if (total < 8 || total > 15) {
        return "Número com " + total + " dígito(s). O limite internacional é de 8 a 15 dígitos, com o código do país.";
      }
      return "";
    }

    if (digitos.slice(0, 2) === "55" && (digitos.length === 12 || digitos.length === 13)) {
      return validarBR(digitos.slice(2));
    }
    return validarBR(digitos);
  }

  // ---------- Interface ----------

  var ESTILO = [
    ".tel-grupo{width:100%;}",
    /* Uma só caixa, com a mesma aparência dos outros campos do site */
    ".form-grupo .tel-campo{display:flex;align-items:stretch;width:100%;border:2px solid var(--borda-campo);border-radius:6px;background:var(--superficie);color:var(--texto);font-family:inherit;transition:border-color .15s ease;}",
    ".form-grupo .tel-campo:focus-within{outline:3px solid var(--foco);outline-offset:3px;box-shadow:0 0 0 7px var(--anel-foco);}",
    ".form-grupo .tel-campo.tel-erro{border:3px solid var(--erro);background:var(--erro-fundo);}",
    ".tel-campo .tel-pais{display:flex;align-items:center;gap:8px;padding:0 10px 0 12px;border-right:2px solid var(--borda-campo);flex:0 0 auto;max-width:100%;}",
    ".tel-campo .tel-iso{display:inline-block;padding:3px 7px;border-radius:4px;background:#2e7d32;color:#fff;font-size:.78rem;font-weight:700;letter-spacing:.06em;line-height:1.2;}",
    ".form-grupo .tel-campo select{width:auto;max-width:14rem;border:0;background:transparent;color:inherit;font:inherit;font-size:1.05rem;padding:12px 4px 12px 0;margin:0;box-shadow:none;outline:none;cursor:pointer;}",
    ".form-grupo .tel-campo .tel-codigo{width:6rem;border:0;border-bottom:2px solid var(--borda-campo);background:transparent;color:inherit;font:inherit;font-size:1rem;padding:8px 2px;margin:0;box-shadow:none;outline:none;}",
    ".tel-campo .tel-ddd{display:flex;align-items:center;gap:2px;padding:0 6px 0 10px;color:var(--texto-suave);font-size:1.15rem;flex:0 0 auto;}",
    ".form-grupo .tel-campo .tel-ddd input{width:2.6rem;border:0;background:transparent;color:var(--texto);font:inherit;font-size:1.1rem;text-align:center;padding:12px 0;margin:0;box-shadow:none;outline:none;}",
    ".form-grupo .tel-campo .tel-numero{flex:1 1 auto;min-width:0;border:0;background:transparent;color:var(--texto);font:inherit;font-size:1.1rem;padding:12px 14px 12px 6px;margin:0;box-shadow:none;outline:none;}",
    ".form-grupo .tel-campo input::placeholder{color:var(--texto-suave);opacity:1;}",
    ".form-grupo .tel-campo input:user-invalid,.form-grupo .tel-campo select:user-invalid{border:0;background:transparent;}",
    ".tel-campo[data-sem-ddd='true'] .tel-ddd{display:none;}",
    "@media (max-width:480px){.tel-campo{flex-wrap:wrap;}.tel-campo .tel-pais{flex:1 1 100%;border-right:0;border-bottom:2px solid var(--borda-campo);padding:0 12px;}.tel-campo .tel-ddd{padding-left:12px;}.form-grupo .tel-campo .tel-numero{flex:1 1 0;padding-left:4px;}}"
  ].join("");

  function injetarEstilo() {
    if (document.getElementById("tel-estilo")) return;
    var st = document.createElement("style");
    st.id = "tel-estilo";
    st.textContent = ESTILO;
    document.head.appendChild(st);
  }

  function formatarNumero(digitos, br) {
    if (!br) return digitos;
    if (digitos.length <= 4) return digitos;
    var corte = digitos.length <= 8 ? 4 : 5;
    return digitos.slice(0, corte) + "-" + digitos.slice(corte, 9);
  }

  function criar(tag, attrs, texto) {
    var el = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) { el.setAttribute(k, attrs[k]); });
    if (texto !== undefined) el.textContent = texto;
    return el;
  }

  function montar(original) {
    var id = original.id;
    var obrigatorio = original.hasAttribute("required");
    var descricaoId = original.getAttribute("aria-describedby") || "";

    // Campo original vira o carregador do valor enviado.
    original.type = "hidden";
    original.removeAttribute("required");
    original.removeAttribute("aria-describedby");
    original.removeAttribute("title");

    var grupo = criar("div", { "class": "tel-grupo" });
    var caixa = criar("div", { "class": "tel-campo" });

    // País: código ISO, seletor e, se preciso, o código digitado.
    var pais = criar("div", { "class": "tel-pais" });
    var iso = criar("span", { "class": "tel-iso", "aria-hidden": "true" }, "BR");
    var select = criar("select", { id: id + "-pais", "aria-label": "País do telefone" });
    PAISES.forEach(function (p) {
      var o = criar("option", { value: p.iso }, p.iso === "OUTRO" ? "Outro país" : "+" + p.codigo + " " + p.nome);
      if (p.iso === "BR") o.selected = true;
      select.appendChild(o);
    });
    var codigoOutro = criar("input", { type: "text", inputmode: "numeric", placeholder: "+código", "aria-label": "Código do país, só números", "class": "tel-codigo" });
    codigoOutro.hidden = true;
    pais.appendChild(iso);
    pais.appendChild(select);
    pais.appendChild(codigoOutro);
    caixa.appendChild(pais);

    // DDD entre parênteses (só para o Brasil).
    var dddWrap = criar("div", { "class": "tel-ddd" });
    dddWrap.appendChild(criar("span", { "aria-hidden": "true" }, "("));
    var ddd = criar("input", { type: "text", id: id + "-ddd", inputmode: "numeric", maxlength: "2", placeholder: "11", "aria-label": "DDD" });
    dddWrap.appendChild(ddd);
    dddWrap.appendChild(criar("span", { "aria-hidden": "true" }, ")"));
    caixa.appendChild(dddWrap);

    // Número.
    var numero = criar("input", { type: "tel", id: id + "-numero", "class": "tel-numero", inputmode: "tel", autocomplete: "tel-national", placeholder: "91234-5678", "aria-label": "Número do telefone" });
    if (descricaoId) numero.setAttribute("aria-describedby", descricaoId);
    if (obrigatorio) numero.required = true;
    caixa.appendChild(numero);

    grupo.appendChild(caixa);
    original.parentNode.insertBefore(grupo, original);
    grupo.appendChild(original);

    // Rótulo passa a apontar para o campo visível.
    var rotulo = document.querySelector('label[for="' + id + '"]');
    if (rotulo) rotulo.htmlFor = numero.id;

    function paisAtual() {
      return PAISES.filter(function (p) { return p.iso === select.value; })[0];
    }

    function codigoAtual() {
      var p = paisAtual();
      if (p.iso === "OUTRO") return codigoOutro.value.replace(/\D/g, "");
      return p.codigo;
    }

    function atualizarCampos() {
      var p = paisAtual();
      var br = p.iso === "BR";
      iso.textContent = p.iso === "OUTRO" ? "+" : p.iso;
      codigoOutro.hidden = p.iso !== "OUTRO";
      dddWrap.hidden = !br;
      caixa.setAttribute("data-sem-ddd", br ? "false" : "true");
      ddd.required = br && obrigatorio;
      numero.placeholder = br ? "91234-5678" : "Número sem o código do país";
      numero.maxLength = br ? 10 : 15;
      sincronizar();
    }

    function sincronizar() {
      var p = paisAtual();
      var br = p.iso === "BR";
      var dig = numero.value.replace(/\D/g, "").slice(0, br ? 9 : 15);
      var dddDig = ddd.value.replace(/\D/g, "").slice(0, 2);
      var valor = "";
      if (dig !== "" || (br && dddDig !== "")) {
        valor = br ? "+55" + dddDig + dig : (codigoAtual() ? "+" + codigoAtual() + dig : "");
      }
      original.value = valor;

      ddd.setCustomValidity("");
      numero.setCustomValidity("");
      ddd.setAttribute("aria-invalid", "false");
      numero.setAttribute("aria-invalid", "false");
      caixa.classList.remove("tel-erro");
      if (valor === "") return;

      var erro = validarTelefone(valor);
      if (erro === "") return;
      caixa.classList.add("tel-erro");
      if (br && dddDig.length < 2) {
        ddd.setCustomValidity("Preencha o DDD com 2 números.");
        ddd.setAttribute("aria-invalid", "true");
      } else if (/^DDD \d{2} não existe/.test(erro)) {
        ddd.setCustomValidity(erro);
        ddd.setAttribute("aria-invalid", "true");
      } else {
        numero.setCustomValidity(erro);
        numero.setAttribute("aria-invalid", "true");
      }
    }

    select.addEventListener("change", function () { atualizarCampos(); if (paisAtual().iso === "OUTRO") codigoOutro.focus(); });
    codigoOutro.addEventListener("input", function () { codigoOutro.value = codigoOutro.value.replace(/\D/g, "").slice(0, 4); sincronizar(); });
    ddd.addEventListener("input", function () { ddd.value = ddd.value.replace(/\D/g, "").slice(0, 2); if (ddd.value.length === 2) numero.focus(); sincronizar(); });
    numero.addEventListener("input", function () {
      var br = paisAtual().iso === "BR";
      var dig = numero.value.replace(/\D/g, "").slice(0, br ? 9 : 15);
      numero.value = formatarNumero(dig, br);
      sincronizar();
    });
    numero.addEventListener("blur", sincronizar);
    ddd.addEventListener("blur", sincronizar);

    atualizarCampos();
  }

  function iniciar() {
    injetarEstilo();
    var campos = document.querySelectorAll('input[type="tel"]');
    for (var i = 0; i < campos.length; i++) {
      if (campos[i].type === "tel" && campos[i].name === "telefone") montar(campos[i]);
    }
  }

  if (typeof window !== "undefined" && typeof document !== "undefined") {
    window.validarTelefone = validarTelefone;
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar);
    else iniciar();
  }
  if (typeof module !== "undefined") module.exports = { validarTelefone: validarTelefone };
})();
