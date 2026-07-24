import * as fs from 'fs';
import * as path from 'path';
import { SistemaCLIInterface } from './interfaces';

/**
 * Implementação Node.js da interface {@link SistemaCLIInterface}.
 *
 * As APIs do Node.js são encapsuladas aqui, mantendo a lógica
 * da CLI pura e independente de plataforma.
 */
export const sistemaCLINode: SistemaCLIInterface = {
    argumentos: process.argv.slice(2),
    lerArquivo: async (caminho: string): Promise<string> => {
        return fs.promises.readFile(caminho, 'utf-8');
    },
    diretorioAtual: (): string => process.cwd(),
    juntarCaminhos: (...partes: string[]): string => path.join(...partes),
    resolverCaminho: (...partes: string[]): string => path.resolve(...partes),
    escreverSaida: (texto: string): void => {
        process.stdout.write(texto);
    },
    escreverErro: (texto: string): void => {
        process.stderr.write(texto);
    },
    encerrar: (codigo: number): void => {
        process.exit(codigo);
    },
    existe: async (caminho: string): Promise<boolean> => {
        return fs.existsSync(caminho);
    },
};
