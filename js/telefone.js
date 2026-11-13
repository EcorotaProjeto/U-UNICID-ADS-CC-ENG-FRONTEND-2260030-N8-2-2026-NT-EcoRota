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
    ".tel-grupo{display:flex;flex-wrap:wrap;gap:8px;align-items:stretch;}",
    ".tel-linha{display:flex;align-items:center;gap:8px;width:100%;}",
    ".tel-pais{display:flex;align-items:center;gap:6px;border:2px solid #2e7d32;border-radius:8px;background:#fff;padding:0 8px;min-height:46px;}",
    ".tel-pais select{border:0;background:transparent;font:inherit;font-size:1rem;color:inherit;padding:8px 4px;cursor:pointer;max-width:100%;}",
    ".tel-pais input{width:4.5rem;border:0;border-bottom:2px solid #2e7d32;background:transparent;font:inherit;font-size:1rem;padding:6px 2px;}",
    ".tel-ddd{display:flex;align-items:center;gap:4px;font-size:1.1rem;color:#1b5e20;}",
    ".tel-ddd input{width:3.2rem;text-align:center;border:2px solid #2e7d32;border-radius:8px;font:inherit;font-size:1rem;padding:8px 4px;}",
    ".tel-numero{flex:1 1 9rem;min-width:0;border:2px solid #2e7d32;border-radius:8px;font:inherit;font-size:1rem;padding:8px 10px;background:#fff;}",
    ".tel-grupo input:focus,.tel-grupo select:focus{outline:3px solid #01579b;outline-offset:2px;}",
    ".tel-grupo [aria-invalid='true']{border-color:#b3261e;}",
    "@media (max-width:480px){.tel-linha{flex-wrap:wrap;}.tel-pais{flex:1 1 100%;}.tel-numero{flex:1 1 0;}}"
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

  function montar(original) {
    var id = original.id;
    var obrigatorio = original.hasAttribute("required");
    var descricaoId = original.getAttribute("aria-describedby") || "";

    // Campo original vira o carregador do valor enviado.
    original.type = "hidden";
    original.removeAttribute("required");
    original.removeAttribute("aria-describedby");
    original.removeAttribute("title");

    var grupo = document.createElement("div");
    grupo.className = "tel-grupo";

    var linha = document.createElement("div");
    linha.className = "tel-linha";

    // Seletor de país com bandeira e código.
    var pais = document.createElement("label");
    pais.className = "tel-pais";
    var select = document.createElement("select");
    select.id = id + "-pais";
    select.setAttribute("aria-label", "País do telefone");
    PAISES.forEach(function (p) {
      var o = document.createElement("option");
      o.value = p.iso;
      o.textContent = p.iso === "OUTRO" ? "🌐 Outro país" : bandeira(p.iso) + " +" + p.codigo + " " + p.nome;
      if (p.iso === "BR") o.selected = true;
      select.appendChild(o);
    });
    var codigoOutro = document.createElement("input");
    codigoOutro.type = "text";
    codigoOutro.inputMode = "numeric";
    codigoOutro.placeholder = "+código";
    codigoOutro.setAttribute("aria-label", "Código do país, só números");
    codigoOutro.hidden = true;
    pais.appendChild(select);
    pais.appendChild(codigoOutro);
    linha.appendChild(pais);

    // DDD entre parênteses (só para o Brasil).
    var dddWrap = document.createElement("div");
    dddWrap.className = "tel-ddd";
    var abre = document.createElement("span");
    abre.textContent = "(";
    var ddd = document.createElement("input");
    ddd.type = "text";
    ddd.id = id + "-ddd";
    ddd.inputMode = "numeric";
    ddd.maxLength = 2;
    ddd.placeholder = "11";
    ddd.setAttribute("aria-label", "DDD");
    var fecha = document.createElement("span");
    fecha.textContent = ")";
    dddWrap.appendChild(abre);
    dddWrap.appendChild(ddd);
    dddWrap.appendChild(fecha);
    linha.appendChild(dddWrap);

    // Número.
    var numero = document.createElement("input");
    numero.type = "tel";
    numero.id = id + "-numero";
    numero.className = "tel-numero";
    numero.inputMode = "tel";
    numero.autocomplete = "tel-national";
    numero.placeholder = "91234-5678";
    numero.setAttribute("aria-label", "Número do telefone");
    if (descricaoId) numero.setAttribute("aria-describedby", descricaoId);
    if (obrigatorio) numero.required = true;
    linha.appendChild(numero);

    grupo.appendChild(linha);
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
      codigoOutro.hidden = p.iso !== "OUTRO";
      dddWrap.hidden = !br;
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
      if (!br && p.iso === "OUTRO" && codigoAtual() === "") valor = "";
      original.value = valor;

      // Mensagens de validade no campo visível que o usuário está preenchendo.
      ddd.setAttribute("aria-invalid", "false");
      numero.setAttribute("aria-invalid", "false");
      ddd.setCustomValidity("");
      numero.setCustomValidity("");
      if (valor === "") return;

      var erro = validarTelefone(valor);
      if (erro === "") return;
      var mensagem = erro;
      if (br && dddDig.length < 2) {
        mensagem = "Preencha o DDD com 2 números.";
        ddd.setCustomValidity(mensagem);
        ddd.setAttribute("aria-invalid", "true");
      } else if (/^DDD \d{2} não existe/.test(erro)) {
        ddd.setCustomValidity(mensagem);
        ddd.setAttribute("aria-invalid", "true");
      } else {
        numero.setCustomValidity(mensagem);
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
