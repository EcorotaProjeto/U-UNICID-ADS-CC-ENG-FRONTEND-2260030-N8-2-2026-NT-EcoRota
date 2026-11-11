/* Validação de telefone: aceita códigos de país existentes, DDDs brasileiros existentes
   e recusa números com menos ou mais dígitos que o limite. */
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
    if (s === "") return ""; // campo vazio: quem decide é o atributo required
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

    // Sem +: número nacional. Aceita 55 na frente se o total for de 12 ou 13 dígitos.
    if (digitos.slice(0, 2) === "55" && (digitos.length === 12 || digitos.length === 13)) {
      return validarBR(digitos.slice(2));
    }
    return validarBR(digitos);
  }

  if (typeof window !== "undefined") {
    window.validarTelefone = validarTelefone;
    var campos = document.querySelectorAll('input[type="tel"]');
    for (var i = 0; i < campos.length; i++) {
      (function (el) {
        var checar = function () { el.setCustomValidity(validarTelefone(el.value)); };
        el.addEventListener("input", checar);
        el.addEventListener("blur", checar);
        checar();
      })(campos[i]);
    }
  }
  if (typeof module !== "undefined") module.exports = { validarTelefone: validarTelefone };
})();
