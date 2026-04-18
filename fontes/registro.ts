import { ContribuicaoEsquema, DefinicaoPropriedade } from './interfaces';

const registros = new Map<string, ContribuicaoEsquema[]>();

/**
 * Registra manualmente o esquema de propriedades de um pacote para um dado namespace.
 *
 * @param namespace Caminho do namespace, separado por pontos (ex: `'liquido.dados'`).
 * @param pacote    Nome do pacote contribuidor (ex: `'@designliquido/lincones-sqlite'`).
 * @param definicoes Array de propriedades aceitas neste namespace.
 *
 * @example
 * import { registrar } from '@designliquido/delprops';
 * import dadosSqlite from '@designliquido/lincones-sqlite/delprops/dados';
 * registrar('liquido.dados', '@designliquido/lincones-sqlite', dadosSqlite);
 */
export function registrar(namespace: string, pacote: string, definicoes: DefinicaoPropriedade[]): void {
    if (!registros.has(namespace)) {
        registros.set(namespace, []);
    }
    registros.get(namespace)!.push({ pacote, definicoes });
}

/**
 * Retorna todas as propriedades registradas para um namespace,
 * consolidando as contribuições de todos os pacotes.
 */
export function obter(namespace: string): DefinicaoPropriedade[] {
    const contribuicoes = registros.get(namespace) ?? [];
    return contribuicoes.flatMap(c => c.definicoes);
}

/**
 * Retorna verdadeiro se ao menos um pacote registrou esquema para o namespace.
 */
export function temRegistro(namespace: string): boolean {
    return registros.has(namespace) && registros.get(namespace)!.length > 0;
}

/**
 * Retorna o mapa completo de registros, agrupado por namespace.
 */
export function obterTodos(): Map<string, ContribuicaoEsquema[]> {
    return registros;
}
