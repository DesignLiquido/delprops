import * as fs from 'fs';
import * as path from 'path';
import { sistemaArquivosNode } from '../fontes/sistema-arquivos-node';

describe('Módulo SistemaArquivosNode', () => {
    let tempDir: string;

    beforeAll(() => {
        tempDir = fs.mkdtempSync(path.join(__dirname, '..', '__teste-sistema-arquivos-'));
        fs.writeFileSync(path.join(tempDir, 'arquivo.txt'), 'conteudo do arquivo');
        fs.writeFileSync(path.join(tempDir, 'module.js'), 'module.exports = { nome: "teste" };');
        fs.mkdirSync(path.join(tempDir, 'subpasta'));
    });

    afterAll(() => {
        fs.rmSync(tempDir, { recursive: true, force: true });
    });

    describe('separadorCaminho', () => {
        it('deve retornar o separador de caminho do sistema', () => {
            expect(sistemaArquivosNode.separadorCaminho).toBe(path.sep);
        });
    });

    describe('existe', () => {
        it('deve retornar verdadeiro para caminho existente', async () => {
            const resultado = await sistemaArquivosNode.existe(tempDir);
            expect(resultado).toBe(true);
        });

        it('deve retornar verdadeiro para arquivo existente', async () => {
            const arquivo = path.join(tempDir, 'arquivo.txt');
            const resultado = await sistemaArquivosNode.existe(arquivo);
            expect(resultado).toBe(true);
        });

        it('deve retornar falso para caminho inexistente', async () => {
            const resultado = await sistemaArquivosNode.existe('/caminho/inexistente/12345');
            expect(resultado).toBe(false);
        });
    });

    describe('listarDiretorio', () => {
        it('deve listar arquivos e diretórios de um diretório', async () => {
            const entradas = await sistemaArquivosNode.listarDiretorio(tempDir);
            expect(entradas).toHaveLength(3);

            const arquivo = entradas.find(e => e.nome === 'arquivo.txt');
            expect(arquivo).toBeDefined();
            expect(arquivo!.ehDiretorio).toBe(false);

            const module = entradas.find(e => e.nome === 'module.js');
            expect(module).toBeDefined();
            expect(module!.ehDiretorio).toBe(false);

            const subpasta = entradas.find(e => e.nome === 'subpasta');
            expect(subpasta).toBeDefined();
            expect(subpasta!.ehDiretorio).toBe(true);
        });
    });

    describe('lerTexto', () => {
        it('deve ler o conteúdo de um arquivo', async () => {
            const arquivo = path.join(tempDir, 'arquivo.txt');
            const conteudo = await sistemaArquivosNode.lerTexto(arquivo);
            expect(conteudo).toBe('conteudo do arquivo');
        });
    });

    describe('juntarCaminhos', () => {
        it('deve juntar partes do caminho com o separador do sistema', () => {
            const resultado = sistemaArquivosNode.juntarCaminhos('/base', 'sub', 'arquivo.txt');
            expect(resultado).toBe(path.join('/base', 'sub', 'arquivo.txt'));
        });

        it('deve aceitar múltiplas partes', () => {
            const resultado = sistemaArquivosNode.juntarCaminhos('a', 'b', 'c', 'd');
            expect(resultado).toBe(path.join('a', 'b', 'c', 'd'));
        });
    });

    describe('resolverCaminho', () => {
        it('deve resolver um caminho absoluto a partir de partes', () => {
            const resultado = sistemaArquivosNode.resolverCaminho('/base', 'sub');
            expect(resultado).toBe(path.resolve('/base', 'sub'));
        });

        it('deve resolver caminhos relativos', () => {
            const resultado = sistemaArquivosNode.resolverCaminho('/base', '..', 'outro');
            expect(resultado).toBe(path.resolve('/base', '..', 'outro'));
        });
    });

    describe('carregarModulo', () => {
        it('deve carregar um módulo JavaScript por caminho', async () => {
            const arquivo = path.join(tempDir, 'module.js');
            const modulo = await sistemaArquivosNode.carregarModulo(arquivo);
            expect(modulo).toEqual({ nome: 'teste' });
        });

        it('deve lançar erro para caminho inexistente', async () => {
            const arquivo = path.join(tempDir, 'inexistente.js');
            await expect(sistemaArquivosNode.carregarModulo(arquivo)).rejects.toThrow();
        });
    });
});
