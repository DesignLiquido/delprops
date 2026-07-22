import { DefinicaoPropriedade, SistemaCLI } from './interfaces';
import * as liquidoSchemas from './liquido';

/**
 * Monta o mapa de esquemas embutidos da biblioteca (liquido.*).
 */
export function obterEsquemasEmbutidos(): Map<string, DefinicaoPropriedade[]> {
    const esquemas = new Map<string, DefinicaoPropriedade[]>();

    const entradas: [string, DefinicaoPropriedade[]][] = [
        ['liquido.arquetipo', liquidoSchemas.arquetipo],
        ['liquido.linguagem', liquidoSchemas.linguagem],
        ['liquido.aplicacao', liquidoSchemas.aplicacao],
        ['liquido.roteador', liquidoSchemas.roteador],
        ['liquido.dados', liquidoSchemas.dados],
        ['liquido.autenticacao', liquidoSchemas.autenticacao],
        ['liquido.estilos', liquidoSchemas.estilos],
    ];

    for (const [ns, definicoes] of entradas) {
        esquemas.set(ns, definicoes);
    }

    return esquemas;
}

/**
 * Carrega esquemas a partir de um arquivo JSON externo.
 * Retorna null em caso de erro.
 */
export async function carregarEsquemasDeArquivo(
    sistema: SistemaCLI,
    caminho: string
): Promise<Map<string, DefinicaoPropriedade[]> | null> {
    const caminhoAbsoluto = sistema.resolverCaminho(
        sistema.diretorioAtual(),
        caminho
    );

    if (!(await sistema.existe(caminhoAbsoluto))) {
        sistema.escreverErro(
            `Arquivo de esquemas não encontrado: ${caminho}\n`
        );
        return null;
    }

    try {
        const conteudo = await sistema.lerArquivo(caminhoAbsoluto);
        const dados = JSON.parse(conteudo) as Record<
            string,
            unknown
        >;
        const resultado = new Map<string, DefinicaoPropriedade[]>();

        for (const [ns, defs] of Object.entries(dados)) {
            if (Array.isArray(defs)) {
                resultado.set(ns, defs as DefinicaoPropriedade[]);
            }
        }

        return resultado;
    } catch (e) {
        sistema.escreverErro(
            `Erro ao carregar esquemas de '${caminho}': ${(e as Error).message}\n`
        );
        return null;
    }
}

/**
 * Mescla esquemas adicionais nos esquemas base, mutando o mapa base.
 */
export function mesclarEsquemas(
    base: Map<string, DefinicaoPropriedade[]>,
    adicionais: Map<string, DefinicaoPropriedade[]>
): void {
    for (const [ns, defs] of adicionais) {
        const existentes = base.get(ns) ?? [];
        base.set(ns, [...existentes, ...defs]);
    }
}
