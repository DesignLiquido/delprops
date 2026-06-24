import * as fs from 'fs';
import * as path from 'path';

import { SistemaArquivosDescoberta } from './interfaces';

export const sistemaArquivosNode: SistemaArquivosDescoberta = {
    separadorCaminho: path.sep,
    existe: async (caminho) => fs.existsSync(caminho),
    listarDiretorio: async (caminho) =>
        fs.readdirSync(caminho, { withFileTypes: true }).map(e => ({
            nome: e.name,
            ehDiretorio: e.isDirectory(),
        })),
    lerTexto: async (caminho) => fs.readFileSync(caminho, 'utf-8'),
    juntarCaminhos: (...partes) => path.join(...partes),
    resolverCaminho: (...partes) => path.resolve(...partes),
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    carregarModulo: async (caminho) => require(caminho),
};
