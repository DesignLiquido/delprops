import { DefinicaoPropriedade } from './interfaces';
import { TipoValor } from './tipos';
import { PropriedadeParseada } from './analisador';

/**
 * Aviso de validação para propriedades desconhecidas.
 */
export interface AvisoValidacao {
    chave: string;
    linha: number;
    mensagem: string;
}

/**
 * Erro de validação para tipos ou valores inválidos.
 */
export interface ErroValidacao {
    chave: string;
    linha: number;
    mensagem: string;
}

/**
 * Resultado completo da validação.
 */
export interface ResultadoValidacao {
    avisos: AvisoValidacao[];
    erros: ErroValidacao[];
}

/**
 * Inferir o tipo de um valor a partir de sua representação textual.
 *
 * - `verdadeiro` / `falso` → `'logico'`
 * - Valor entre aspas simples → `'texto'`
 * - Apenas dígitos → `'numero'`
 * - Caso contrário → `null`
 */
export function inferirTipo(valor: string): TipoValor | null {
    if (valor === 'verdadeiro' || valor === 'falso') {
        return 'logico';
    }

    if (valor.startsWith("'") && valor.endsWith("'") && valor.length >= 2) {
        return 'texto';
    }

    if (/^\d+$/.test(valor)) {
        return 'numero';
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
    propriedades: PropriedadeParseada[],
    esquemas: Map<string, DefinicaoPropriedade[]>
): ResultadoValidacao {
    const avisos: AvisoValidacao[] = [];
    const erros: ErroValidacao[] = [];

    // Namespaces ordenados do mais específico ao menos específico
    // para que 'liquido.aplicacao' seja testado antes de 'liquido'
    const nomesNamespaces = Array
      .from(esquemas.keys())
      .sort((a, b) => b.length - a.length);

    for (const prop of propriedades) {
        // Encontrar namespace correspondente
        const namespaceEncontrado = nomesNamespaces.find(ns =>
            prop.chave === ns || prop.chave.startsWith(ns + '.')
        );

        if (!namespaceEncontrado) {
            // Namespace não conhecido — permitido sem validação
            continue;
        }

        // Extrair o nome da propriedade
        let nomePropriedade: string;

        if (prop.chave === namespaceEncontrado) {
            // Chave é exatamente o namespace (sem propriedade)
            nomePropriedade = '';
        } else {
            const restante = prop.chave.slice(
              namespaceEncontrado.length + 1
            );

            // Namespace liquido.dados tem sub-namespace dinâmico (<nome>)
            // ex: liquido.dados.lincones.tecnologia → propriedade = 'tecnologia'
            if (namespaceEncontrado === 'liquido.dados') {
                const partes = restante.split('.');
                nomePropriedade = partes.length >= 2
                    ? partes.slice(1).join('.')
                    : '';
            } else {
                nomePropriedade = restante;
            }
        }

        if (nomePropriedade === '') {
            avisos.push({
                chave: prop.chave,
                linha: prop.linha,
                mensagem: `Namespace '${namespaceEncontrado}' sem nome de propriedade.`,
            });
            continue;
        }

        // Buscar definição da propriedade no esquema
        const definicoes = esquemas.get(namespaceEncontrado)!;
        const definicao = definicoes.find(d => d.nome === nomePropriedade);

        if (!definicao) {
            avisos.push({
                chave: prop.chave,
                linha: prop.linha,
                mensagem: `Propriedade '${nomePropriedade}' desconhecida no namespace '${namespaceEncontrado}'.`,
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
                    mensagem: `Valor '${valorLimpo}' não está entre os permitidos: [${definicao.valoresPermitidos.join(', ')}].`,
                });
            }
        }
    }

    return { avisos, erros };
}
