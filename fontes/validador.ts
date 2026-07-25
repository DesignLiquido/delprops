import {
  AvisoValidacaoInterface,
  DefinicaoPropriedadeInterface,
  ErroValidacaoInterface,
  PropriedadeCompreendidaInterface,
  ResultadoValidacaoInterface,
} from "./interfaces";
import { TipoValor } from "./tipos";

const REGEX_NUMERO = /^-?\d+(\.\d+)?$/;
const NAMESPACE_DADOS = "liquido.dados";

/**
 * Inferir o tipo de um valor a partir de sua representação textual.
 *
 * - `verdadeiro` / `falso` → `'logico'`
 * - Valor entre aspas simples → `'texto'`
 * - Números (inteiros e decimais) → `'numero'`
 * - Caso contrário → `null`
 */
export function inferirTipo(valor: string): TipoValor | null {
  if (valor === "verdadeiro" || valor === "falso") {
    return "logico";
  }

  if (valor.startsWith("'") && valor.endsWith("'") && valor.length >= 2) {
    return "texto";
  }

  if (REGEX_NUMERO.test(valor)) {
    return "numero";
  }

  return null;
}

/**
 * Remove aspas simples do valor, se presente.
 */
export function valorSemAspas(valor: string): string {
  if (valor.startsWith("'") && valor.endsWith("'") && valor.length >= 2) {
    return valor.slice(1, -1);
  }
  return valor;
}

/**
 * Constrói mapas de lookup (nome da propriedade → definição) para cada namespace,
 * permitindo busca O(1).
 */
function construirMapasLookup(
  esquemas: Map<string, DefinicaoPropriedadeInterface[]>,
): Map<string, Map<string, DefinicaoPropriedadeInterface>> {
  const mapas = new Map<string, Map<string, DefinicaoPropriedadeInterface>>();

  for (const [namespace, definicoes] of esquemas) {
    const mapa = new Map<string, DefinicaoPropriedadeInterface>();

    for (const def of definicoes) {
      mapa.set(def.nome, def);
    }

    mapas.set(namespace, mapa);
  }

  return mapas;
}

/**
 * Extrai o nome da propriedade a partir da chave completa.
 *
 * Para namespaces com sub-namespace dinâmico (ex: `liquido.dados`),
 * remove o segmento do sub-namespace para obter apenas o nome da propriedade.
 *
 * @example
 * extrairNomePropriedade('liquido.dados', 'liquido.dados.lincones.tecnologia')
 * // → 'tecnologia'
 */
function extrairNomePropriedade(namespace: string, chave: string): string {
  if (chave === namespace) return "";

  const restante = chave.slice(namespace.length + 1);

  // Namespace liquido.dados tem sub-namespace dinâmico (<nome>)
  // ex: liquido.dados.lincones.tecnologia → propriedade = 'tecnologia'
  if (namespace === NAMESPACE_DADOS) {
    const indicePonto = restante.indexOf(".");
    return indicePonto >= 0 ? restante.slice(indicePonto + 1) : "";
  }

  return restante;
}

/**
 * Valida uma lista de propriedades parseadas contra esquemas conhecidos.
 *
 * Para chaves que começam com namespace conhecido:
 * - Propriedades desconhecidas geram **aviso**.
 * - Tipo de valor incompatível gera **erro**.
 * - Valores fora dos permitidos geram **erro**.
 *
 * Para namespaces não conhecidos (ex: outros projetos do ecossistema),
 * a validação de esquema é ignorada.
 *
 * @param propriedades Lista de propriedades já parseadas.
 * @param esquemas     Mapa de namespace → array de definições de propriedade.
 * @returns Resultado com avisos e erros de validação.
 */
export function validar(
  propriedades: PropriedadeCompreendidaInterface[],
  esquemas: Map<string, DefinicaoPropriedadeInterface[]>,
): ResultadoValidacaoInterface {
  const avisos: AvisoValidacaoInterface[] = [];
  const erros: ErroValidacaoInterface[] = [];
  const mapasLookup = construirMapasLookup(esquemas);

  // Namespaces ordenados do mais específico ao menos específico
  // para que 'liquido.aplicacao' seja testado antes de 'liquido'
  const nomesNamespaces = Array.from(esquemas.keys()).sort(
    (a, b) => b.length - a.length,
  );

  for (const prop of propriedades) {
    // Encontrar namespace correspondente
    const namespaceEncontrado = nomesNamespaces.find(
      (ns) => prop.chave === ns || prop.chave.startsWith(ns + "."),
    );

    if (!namespaceEncontrado) {
      // Namespace não conhecido — permitido sem validação
      continue;
    }

    // Extrair o nome da propriedade a partir da chave
    const nomePropriedade = extrairNomePropriedade(
      namespaceEncontrado,
      prop.chave,
    );

    if (nomePropriedade === "") {
      avisos.push({
        chave: prop.chave,
        linha: prop.linha,
        mensagem: `Namespace '${namespaceEncontrado}' sem nome de propriedade.`,
      });
      continue;
    }

    const mapaDefinicoes = mapasLookup.get(namespaceEncontrado);
    const definicao =
      mapaDefinicoes !== undefined ? mapaDefinicoes.get(nomePropriedade) : null;

    if (!definicao) {
      avisos.push({
        chave: prop.chave,
        linha: prop.linha,
        mensagem: `Propriedade '${nomePropriedade}' desconhecida no espaço de nomes '${namespaceEncontrado}'.`,
      });
      continue;
    }

    // Validar tipo do valor
    const tipoInferido = inferirTipo(prop.valor);

    if (tipoInferido === null) {
      erros.push({
        chave: prop.chave,
        linha: prop.linha,
        mensagem: `Valor '${prop.valor}' não corresponde a nenhum tipo conhecido (logico, texto, numero).`,
      });
      continue;
    }

    if (tipoInferido !== definicao.tipo) {
      erros.push({
        chave: prop.chave,
        linha: prop.linha,
        mensagem: `Tipo esperado '${definicao.tipo}', mas o valor '${prop.valor}' parece ser '${tipoInferido}'.`,
      });
      continue;
    }

    // Validar valores permitidos
    if (definicao.valoresPermitidos && definicao.valoresPermitidos.length > 0) {
      const valorLimpo = valorSemAspas(prop.valor);
      if (!definicao.valoresPermitidos.includes(valorLimpo)) {
        erros.push({
          chave: prop.chave,
          linha: prop.linha,
          mensagem: `Valor '${valorLimpo}' não está entre os permitidos: [${definicao.valoresPermitidos.join(", ")}].`,
        });
      }
    }
  }

  return { avisos, erros };
}
