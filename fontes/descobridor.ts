import * as fs from 'fs';
import * as path from 'path';

import { registrar } from './registro';
import { DefinicaoPropriedade } from './tipos';

interface ManifestoDelprops {
    /** Namespace que este pacote estende (ex: `'liquido.dados'`). */
    namespace: string;
    /** Caminho relativo à raiz do pacote para o arquivo de schema (sem extensão). */
    schema: string;
}

/**
 * Percorre um diretório `node_modules` em busca de pacotes que declaram uma
 * contribuição `"delprops"` em seu `package.json`, carregando e registrando
 * automaticamente seus esquemas.
 *
 * @param caminhoNodeModules Caminho absoluto para o diretório `node_modules`.
 *
 * @example
 * import { descobrir } from '@designliquido/delprops';
 * descobrir(path.join(__dirname, 'node_modules'));
 */
export function descobrir(caminhoNodeModules: string): void {
    if (!fs.existsSync(caminhoNodeModules)) return;

    for (const entrada of fs.readdirSync(caminhoNodeModules, { withFileTypes: true })) {
        if (!entrada.isDirectory()) continue;

        if (entrada.name.startsWith('@')) {
            // Pacote com escopo (@org/pkg)
            const caminhoEscopo = path.join(caminhoNodeModules, entrada.name);
            for (const sub of fs.readdirSync(caminhoEscopo, { withFileTypes: true })) {
                if (sub.isDirectory()) {
                    tentarCarregar(
                        path.join(caminhoEscopo, sub.name),
                        `${entrada.name}/${sub.name}`
                    );
                }
            }
        } else {
            tentarCarregar(path.join(caminhoNodeModules, entrada.name), entrada.name);
        }
    }
}

function tentarCarregar(caminhoPacote: string, nomePacote: string): void {
    const caminhoPackageJson = path.join(caminhoPacote, 'package.json');
    if (!fs.existsSync(caminhoPackageJson)) return;

    let entrada: ManifestoDelprops | ManifestoDelprops[] | undefined;
    try {
        const packageJson = JSON.parse(fs.readFileSync(caminhoPackageJson, 'utf-8'));
        entrada = packageJson.delprops;
    } catch {
        return;
    }

    if (!entrada) return;

    const manifestos = Array.isArray(entrada) ? entrada : [entrada];

    for (const manifesto of manifestos) {
        if (!manifesto?.namespace || !manifesto?.schema) continue;

        try {
            const caminhoSchema = path.resolve(caminhoPacote, manifesto.schema);
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const modulo = require(caminhoSchema);
            const definicoes: DefinicaoPropriedade[] = modulo.default ?? modulo;
            registrar(manifesto.namespace, nomePacote, definicoes);
        } catch {
            // Pacote declarou delprops mas o arquivo de schema não pôde ser carregado.
        }
    }
}
