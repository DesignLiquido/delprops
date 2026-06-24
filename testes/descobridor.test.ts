import { descobrir } from '../fontes/descobridor';
import { obter, obterTodos } from '../fontes/registro';
import { SistemaArquivosDescoberta } from '../fontes/interfaces';

function criarSistemaArquivosMock(): jest.Mocked<SistemaArquivosDescoberta> {
    return {
        separadorCaminho: '/',
        existe: jest.fn(),
        listarDiretorio: jest.fn(),
        lerTexto: jest.fn(),
        juntarCaminhos: jest.fn((...partes: string[]) => partes.join('/')),
        resolverCaminho: jest.fn((...partes: string[]) => partes.join('/')),
        carregarModulo: jest.fn(),
    };
}

describe('Módulo Descobridor', () => {
    let sistemaArquivos: jest.Mocked<SistemaArquivosDescoberta>;

    beforeEach(() => {
        jest.clearAllMocks();
        sistemaArquivos = criarSistemaArquivosMock();
        obterTodos().clear();
    });

    describe('descobrir', () => {
        it('deve retornar silenciosamente se o diretório não existe', async () => {
            sistemaArquivos.existe.mockResolvedValue(false);

            await expect(descobrir('/caminho/inexistente', sistemaArquivos)).resolves.toBeUndefined();
            expect(sistemaArquivos.existe).toHaveBeenCalled();
        });

        it('deve ignorar entradas que não são diretórios', async () => {
            sistemaArquivos.existe.mockResolvedValue(true);
            sistemaArquivos.listarDiretorio.mockResolvedValue([{ nome: 'arquivo.txt', ehDiretorio: false }]);

            await descobrir('/caminho/node_modules', sistemaArquivos);

            expect(sistemaArquivos.listarDiretorio).toHaveBeenCalledWith('/caminho/node_modules');
        });

        it('deve processar pacotes com escopo @designliquido', async () => {
            sistemaArquivos.existe.mockImplementation(async (caminho) => !caminho.includes('package.json'));
            sistemaArquivos.listarDiretorio
                .mockResolvedValueOnce([{ nome: '@designliquido', ehDiretorio: true }])
                .mockResolvedValueOnce([{ nome: 'meu-pacote', ehDiretorio: true }]);

            await descobrir('/caminho/node_modules', sistemaArquivos);

            expect(sistemaArquivos.listarDiretorio).toHaveBeenCalledTimes(2);
        });

        it('deve ignorar outros escopos que não @designliquido', async () => {
            sistemaArquivos.existe.mockResolvedValue(true);
            sistemaArquivos.listarDiretorio.mockResolvedValueOnce([{ nome: '@outro-escopo', ehDiretorio: true }]);

            await descobrir('/caminho/node_modules', sistemaArquivos);

            expect(sistemaArquivos.listarDiretorio).toHaveBeenCalledTimes(1);
        });

        it('deve processar pacote "liquido" sem escopo', async () => {
            sistemaArquivos.existe.mockImplementation(async (caminho) => !caminho.includes('package.json'));
            sistemaArquivos.listarDiretorio.mockResolvedValueOnce([{ nome: 'liquido', ehDiretorio: true }]);

            await descobrir('/caminho/node_modules', sistemaArquivos);

            expect(sistemaArquivos.listarDiretorio).toHaveBeenCalled();
        });

        it('deve ignorar pacotes que não são "liquido" ou "@designliquido"', async () => {
            sistemaArquivos.existe.mockResolvedValue(true);
            sistemaArquivos.listarDiretorio.mockResolvedValueOnce([{ nome: 'outro-pacote', ehDiretorio: true }]);

            await descobrir('/caminho/node_modules', sistemaArquivos);

            expect(sistemaArquivos.listarDiretorio).toHaveBeenCalledTimes(1);
        });
    });

    describe('Carregamento de manifesto', () => {
        it('deve ignorar pacote sem package.json', async () => {
            sistemaArquivos.existe.mockImplementation(async (caminho) => !caminho.includes('package.json'));
            sistemaArquivos.listarDiretorio.mockResolvedValueOnce([{ nome: 'liquido', ehDiretorio: true }]);

            await descobrir('/caminho/node_modules', sistemaArquivos);

            expect(obter('qualquer.namespace')).toEqual([]);
        });

        it('deve ignorar manifesto inválido', async () => {
            sistemaArquivos.existe.mockResolvedValue(true);
            sistemaArquivos.listarDiretorio.mockResolvedValueOnce([{ nome: 'liquido', ehDiretorio: true }]);
            sistemaArquivos.lerTexto.mockResolvedValue('{ json inválido }');

            await descobrir('/caminho/node_modules', sistemaArquivos);

            expect(obter('qualquer.namespace')).toEqual([]);
        });
    });
});
