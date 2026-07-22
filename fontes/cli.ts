import { analisar } from './analisador';
import { validar } from './validador';
import { SistemaCLI, DefinicaoPropriedade, OpcoesCLI } from './interfaces';
import {
    formatarValidacao,
    formatarCompreender,
    formatarEsquemas,
    formatarAjuda,
} from './cli-formatadores';
import {
    obterEsquemasEmbutidos,
    carregarEsquemasDeArquivo,
    mesclarEsquemas,
} from './cli-esquemas';
import pacote from '../package.json';

const versao = pacote.version;

function compreenderArgumentos(args: string[]): OpcoesCLI {
    if (args.length === 0 || args[0] === '--ajuda') {
      return { comando: 'ajuda' };
    }

    if (args[0] === '--versao' || args[0] === '-v') {
      return { comando: 'versao' };
    }

    const comando = args[0];

    if (comando === 'esquemas') return { comando };

    if (comando === 'validar' || comando === 'compreender') {
        let caminhoArquivo: string | undefined;
        let caminhoEsquemas: string | undefined;

        for (let i = 1; i < args.length; i++) {
            if (args[i] === '--esquemas') {
                const valor = args[++i];

                if (valor === undefined || valor.startsWith('-')) {
                    return {
                        comando,
                        erro: `A opção '--esquemas' requer um valor.`,
                    };
                }

                caminhoEsquemas = valor;
            } else if (caminhoArquivo === undefined) {
                caminhoArquivo = args[i];
            }
        }

        if (caminhoArquivo === undefined) {
            return {
                comando,
                erro: `O comando '${comando}' requer o caminho de um arquivo .delprops.`,
            };
        }

        return { comando, caminhoArquivo, caminhoEsquemas };
    }

    return { comando: 'ajuda', erro: `Comando desconhecido: '${comando}'.` };
}

/**
 * Lê um arquivo de forma segura, retornando `null` em caso de erro
 * e escrevendo a mensagem de erro apropriada via sistema.
 */
async function lerArquivoSeguro(
    sistema: SistemaCLI,
    caminho: string
): Promise<string | null> {
    const caminhoAbsoluto = sistema.resolverCaminho(
        sistema.diretorioAtual(),
        caminho
    );

    if (!(await sistema.existe(caminhoAbsoluto))) {
        sistema.escreverErro(
            `Arquivo não encontrado: ${caminho}\n`
        );
        return null;
    }

    try {
        return await sistema.lerArquivo(caminhoAbsoluto);
    } catch (e) {
        sistema.escreverErro(
            `Erro ao ler o arquivo: ${(e as Error).message}\n`
        );
        return null;
    }
}

async function comandoAjuda(sistema: SistemaCLI): Promise<void> {
    sistema.escreverSaida(formatarAjuda() + '\n');
    sistema.encerrar(0);
}

async function comandoVersao(sistema: SistemaCLI): Promise<void> {
    sistema.escreverSaida(`delprops v${versao}\n`);
    sistema.encerrar(0);
}

async function comandoEsquemas(
    sistema: SistemaCLI,
    esquemasAdicionais?: Map<string, DefinicaoPropriedade[]>
): Promise<void> {
    const esquemas = obterEsquemasEmbutidos();

    if (esquemasAdicionais) {
        mesclarEsquemas(esquemas, esquemasAdicionais);
    }

    sistema.escreverSaida(formatarEsquemas(esquemas));
    sistema.escreverSaida('\n');
    sistema.encerrar(0);
}

async function comandoCompreender(
    sistema: SistemaCLI,
    caminhoArquivo: string
): Promise<void> {
    const conteudo = await lerArquivoSeguro(sistema, caminhoArquivo);
    if (conteudo === null) {
        sistema.encerrar(1);
        return;
    }

    const resultado = analisar(conteudo);
    sistema.escreverSaida(formatarCompreender(resultado) + '\n');
    sistema.encerrar(resultado.erros.length > 0 ? 1 : 0);
}

async function comandoValidar(
    sistema: SistemaCLI,
    caminhoArquivo: string,
    caminhoEsquemas?: string,
    esquemasAdicionais?: Map<string, DefinicaoPropriedade[]>
): Promise<void> {
    const conteudo = await lerArquivoSeguro(sistema, caminhoArquivo);
    if (conteudo === null) {
        sistema.encerrar(1);
        return;
    }

    const esquemas = obterEsquemasEmbutidos();

    if (caminhoEsquemas) {
        const esquemasExternos = await carregarEsquemasDeArquivo(
            sistema,
            caminhoEsquemas
        );
      
        if (esquemasExternos === null) {
            sistema.encerrar(1);
            return;
        }
      
        mesclarEsquemas(esquemas, esquemasExternos);
    }

    if (esquemasAdicionais) {
        mesclarEsquemas(esquemas, esquemasAdicionais);
    }

    const compreendido = analisar(conteudo);
    const resultadoValidacao = validar(compreendido.propriedades, esquemas);

    sistema.escreverSaida(formatarValidacao(resultadoValidacao) + '\n');
    sistema.encerrar(resultadoValidacao.erros.length > 0 ? 1 : 0);
}

/**
 * Executa a CLI com o sistema fornecido pelo ambiente.
 *
 * Esta função é pura em relação ao ambiente: não depende de APIs específicas
 * do Node.js, browser, ou qualquer outra plataforma. Toda interação com o
 * sistema é feita exclusivamente através da interface {@link SistemaCLI}.
 *
 * @param sistema            Implementação das operações de sistema do ambiente.
 * @param esquemasAdicionais Mapa opcional de esquemas para complementar os
 *                           esquemas embutidos da biblioteca.
 */
export async function executarCLI(
    sistema: SistemaCLI,
    esquemasAdicionais?: Map<string, DefinicaoPropriedade[]>
): Promise<void> {
    const opcoes = compreenderArgumentos(sistema.argumentos);

    if (opcoes.erro) {
        sistema.escreverErro(opcoes.erro + '\n');
        sistema.escreverSaida(
            '\nExecute "delprops --ajuda" para obter ajuda.\n'
        );
        sistema.encerrar(1);
        return;
    }

    switch (opcoes.comando) {
        case 'ajuda':
            await comandoAjuda(sistema);
            break;

        case 'versao':
            await comandoVersao(sistema);
            break;

        case 'esquemas':
            await comandoEsquemas(sistema, esquemasAdicionais);
            break;

        case 'compreender':
            await comandoCompreender(sistema, opcoes.caminhoArquivo!);
            break;

        case 'validar':
            await comandoValidar(
                sistema,
                opcoes.caminhoArquivo!,
                opcoes.caminhoEsquemas,
                esquemasAdicionais
            );
            break;

        default:
            sistema.escreverErro(
                `Comando não implementado: '${opcoes.comando}'.\n`
            );
            sistema.encerrar(1);
    }
}
