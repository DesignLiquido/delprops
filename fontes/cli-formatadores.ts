import { DefinicaoPropriedade } from './interfaces';

/**
 * Formata o resultado da validação para exibição no terminal.
 */
export function formatarValidacao(validacao: {
    avisos: { linha: number; chave: string; mensagem: string }[];
    erros: { linha: number; chave: string; mensagem: string }[];
}): string {
    const linhas: string[] = [];
    const totalAvisos = validacao.avisos.length;
    const totalErros = validacao.erros.length;

    if (totalAvisos === 0 && totalErros === 0) {
        linhas.push('Arquivo válido. Nenhum aviso ou erro encontrado.');
        return linhas.join('\n');
    }

    for (const aviso of validacao.avisos) {
        linhas.push(
            `[Aviso] Linha ${aviso.linha}: ${aviso.chave} — ${aviso.mensagem}`
        );
    }

    for (const erro of validacao.erros) {
        linhas.push(
            `[Erro] Linha ${erro.linha}: ${erro.chave} — ${erro.mensagem}`
        );
    }

    linhas.push('');
    linhas.push(`Resumo: ${totalAvisos} aviso(s), ${totalErros} erro(s).`);
    return linhas.join('\n');
}

/**
 * Formata o resultado da compreensão para exibição no terminal.
 */
export function formatarCompreensao(resultado: {
    propriedades: { chave: string; valor: string; linha: number }[];
    erros: { mensagem: string; linha: number }[];
}): string {
    const linhas: string[] = [];

    if (resultado.propriedades.length > 0) {
        linhas.push('Propriedades encontradas:');
        
        for (const prop of resultado.propriedades) {
            linhas.push(`  Linha ${prop.linha}: ${prop.chave} = ${prop.valor}`);
        }
    } else {
        linhas.push('Nenhuma propriedade encontrada.');
    }

    if (resultado.erros.length > 0) {
        linhas.push('');
        linhas.push('Erros de sintaxe:');
        
        for (const erro of resultado.erros) {
            linhas.push(`  Linha ${erro.linha}: ${erro.mensagem}`);
        }
    }

    return linhas.join('\n');
}

/**
 * Formata a listagem de namespaces e propriedades disponíveis.
 */
export function formatarEsquemas(
    esquemas: Map<string, DefinicaoPropriedade[]>
): string {
    const linhas: string[] = [];
    
    linhas.push('Namespaces e propriedades disponíveis:');
    linhas.push('');

    for (const [namespace, definicoes] of esquemas) {
        linhas.push(`  ${namespace}:`);
        
        for (const def of definicoes) {
            const tipo = def.tipo;
            const padrao = def.padrao ? ` (padrão: ${def.padrao})` : '';
            const permitidos = def.valoresPermitidos
                ? ` [${def.valoresPermitidos.join(', ')}]`
                : '';
            linhas.push(`    • ${def.nome} (${tipo})${permitidos}${padrao}`);
            linhas.push(`      ${def.detalhe}`);
        }
        
        linhas.push('');
    }

    return linhas.join('\n');
}

/**
 * Retorna o texto de ajuda da CLI.
 */
export function formatarAjuda(): string {
    return [
        'delprops — Ferramenta de linha de comando para arquivos .delprops',
        '',
        'Uso:',
        '  delprops <comando> [argumentos]',
        '',
        'Comandos:',
        '  validar <caminho>                Compreende e valida um arquivo .delprops',
        '    --esquemas <caminho>             Caminho para arquivo JSON com esquemas',
        '                                     adicionais',
        '',
        '  compreender <caminho>                  Compreende e exibe as propriedades do arquivo',
        '',
        '  esquemas                         Lista namespaces e propriedades disponíveis',
        '',
        '  --ajuda,                         Exibe esta mensagem de ajuda',
        '  --versao, -v                     Exibe a versão',
        '',
        'Exemplos:',
        '  delprops validar config.delprops',
        '  delprops validar config.delprops --esquemas meus-esquemas.json',
        '  delprops compreender config.delprops',
        '  delprops esquemas',
    ].join('\n');
}
