import { registrar } from './registro';
import { DefinicaoPropriedade, SistemaArquivosDescoberta } from './interfaces';

interface ManifestoDelprops {
    /** Namespace que este pacote estende (ex: `'liquido.dados'`). */
    espacoNomes: string;
    /** Caminho relativo à raiz do pacote para o arquivo de schema (sem extensão). */
    esquema: string;
}

/**
 * Percorre um diretório `node_modules` em busca de pacotes que declaram uma
 * contribuição `"delprops"` em seu `package.json`, carregando e registrando
 * automaticamente seus esquemas.
 *
 * @param caminhoNodeModules Caminho absoluto para o diretório `node_modules`.
 * @param sistemaArquivos Implementação das APIs de sistema de arquivos do ambiente.
 *
 * @example
 * import { descobrir, sistemaArquivosNode } from '@designliquido/delprops';
 * await descobrir(path.join(__dirname, 'node_modules'), sistemaArquivosNode);
 */
export async function descobrir(
    caminhoNodeModules: string,
    sistemaArquivos: SistemaArquivosDescoberta
): Promise<void> {
    if (!await sistemaArquivos.existe(caminhoNodeModules)) return;

    for (const entrada of await sistemaArquivos.listarDiretorio(caminhoNodeModules)) {
        if (!entrada.ehDiretorio) continue;

        if (entrada.nome.startsWith('@')) {
            // Pacote com escopo (@org/pkg) - apenas @designliquido
            if (entrada.nome !== '@designliquido') continue;

            const caminhoEscopo = sistemaArquivos.juntarCaminhos(caminhoNodeModules, entrada.nome);
            for (const sub of await sistemaArquivos.listarDiretorio(caminhoEscopo)) {
                if (sub.ehDiretorio) {
                    await tentarCarregar(
                        sistemaArquivos.juntarCaminhos(caminhoEscopo, sub.nome),
                        `${entrada.nome}/${sub.nome}`,
                        sistemaArquivos
                    );
                }
            }
        } else {
            // Apenas o pacote 'liquido'
            if (entrada.nome !== 'liquido') continue;

            await tentarCarregar(
                sistemaArquivos.juntarCaminhos(caminhoNodeModules, entrada.nome),
                entrada.nome,
                sistemaArquivos
            );
        }
    }
}

async function tentarCarregar(
    caminhoPacote: string,
    nomePacote: string,
    sistemaArquivos: SistemaArquivosDescoberta
): Promise<void> {
    const caminhoPackageJson = sistemaArquivos.juntarCaminhos(caminhoPacote, 'package.json');
    if (!await sistemaArquivos.existe(caminhoPackageJson)) return;

    let entrada: ManifestoDelprops | ManifestoDelprops[] | undefined;
    try {
        const packageJson = JSON.parse(await sistemaArquivos.lerTexto(caminhoPackageJson));
        entrada = packageJson.delprops;
    } catch {
        return;
    }

    if (!entrada) return;

    const manifestos = Array.isArray(entrada) ? entrada : [entrada];

    for (const manifesto of manifestos) {
        if (!manifesto?.espacoNomes || !manifesto?.esquema) continue;

        try {
            const caminhoEsquema = sistemaArquivos.resolverCaminho(caminhoPacote, manifesto.esquema);
            const modulo = await sistemaArquivos.carregarModulo(caminhoEsquema);
            const definicoes = (modulo.default ?? modulo) as DefinicaoPropriedade[];
            registrar(manifesto.espacoNomes, nomePacote, definicoes);
        } catch {
            // Pacote declarou delprops mas o arquivo de schema não pôde ser carregado.
        }
    }
}
