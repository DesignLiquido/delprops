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

        it('deve ignorar pacote com delprops nulo', async () => {
            sistemaArquivos.existe.mockResolvedValue(true);
            sistemaArquivos.listarDiretorio.mockResolvedValueOnce(
              [{ nome: 'liquido', ehDiretorio: true }]
            );
            sistemaArquivos.lerTexto.mockResolvedValue(
              JSON.stringify({ delprops: null })
            );

            await descobrir('/caminho/node_modules', sistemaArquivos);

            expect(obter('liquido.roteador')).toEqual([]);
        });

        it('deve carregar manifesto com delprops como objeto único', async () => {
            sistemaArquivos.existe.mockResolvedValue(true);
            sistemaArquivos.listarDiretorio.mockResolvedValueOnce(
              [{ nome: 'liquido', ehDiretorio: true }]
            );
            sistemaArquivos.lerTexto.mockResolvedValue(JSON.stringify({
                delprops: {
                    espacoNomes: 'liquido.roteador',
                    esquema: './delprops/roteador'
                }
            }));
            sistemaArquivos.carregarModulo.mockResolvedValue({
                default: [
                    { nome: 'cors', tipo: 'logico', detalhe: 'Habilita CORS.' }
                ]
            } as Record<string, unknown>);

            await descobrir('/caminho/node_modules', sistemaArquivos);

            const propriedades = obter('liquido.roteador');
            expect(propriedades).toHaveLength(1);
            expect(propriedades[0].nome).toBe('cors');
            expect(sistemaArquivos.carregarModulo).toHaveBeenCalled();
        });

        it('deve carregar manifesto com delprops como array', async () => {
            sistemaArquivos.existe.mockResolvedValue(true);
            sistemaArquivos.listarDiretorio
                .mockResolvedValueOnce([{ nome: '@designliquido', ehDiretorio: true }])
                .mockResolvedValueOnce([{ nome: 'meu-pacote', ehDiretorio: true }]);
            sistemaArquivos.lerTexto.mockResolvedValue(JSON.stringify({
                delprops: [
                    { espacoNomes: 'liquido.dados', esquema: './delprops/dados' },
                    { espacoNomes: 'liquido.autenticacao', esquema: './delprops/auth' }
                ]
            }));
            sistemaArquivos.carregarModulo
                .mockResolvedValueOnce({ default: [{ nome: 'tecnologia', tipo: 'texto', detalhe: 'Tecnologia.' }] } as Record<string, unknown>)
                .mockResolvedValueOnce({ default: [{ nome: 'segredo', tipo: 'texto', detalhe: 'Segredo.' }] } as Record<string, unknown>);

            await descobrir('/caminho/node_modules', sistemaArquivos);

            expect(obter('liquido.dados')).toHaveLength(1);
            expect(obter('liquido.autenticacao')).toHaveLength(1);
            expect(sistemaArquivos.carregarModulo).toHaveBeenCalledTimes(2);
        });

        it('deve ignorar manifesto com campos obrigatórios faltando', async () => {
            sistemaArquivos.existe.mockResolvedValue(true);
            sistemaArquivos.listarDiretorio.mockResolvedValueOnce([{ nome: 'liquido', ehDiretorio: true }]);
            sistemaArquivos.lerTexto.mockResolvedValue(JSON.stringify({
                delprops: {
                    espacoNomes: 'liquido.roteador'
                    // esquema ausente
                }
            }));

            await descobrir('/caminho/node_modules', sistemaArquivos);

            expect(obter('liquido.roteador')).toEqual([]);
        });

        it('deve lidar com erro no carregamento do módulo do esquema', async () => {
            sistemaArquivos.existe.mockResolvedValue(true);
            sistemaArquivos.listarDiretorio.mockResolvedValueOnce([{ nome: 'liquido', ehDiretorio: true }]);
            sistemaArquivos.lerTexto.mockResolvedValue(JSON.stringify({
                delprops: {
                    espacoNomes: 'liquido.roteador',
                    esquema: './delprops/roteador'
                }
            }));
            sistemaArquivos.carregarModulo.mockRejectedValue(new Error('Módulo não encontrado'));

            await descobrir('/caminho/node_modules', sistemaArquivos);

            expect(obter('liquido.roteador')).toEqual([]);
        });

        it('deve carregar manifesto usando o módulo diretamente quando não há default', async () => {
            sistemaArquivos.existe.mockResolvedValue(true);
            sistemaArquivos.listarDiretorio.mockResolvedValueOnce([{ nome: 'liquido', ehDiretorio: true }]);
            sistemaArquivos.lerTexto.mockResolvedValue(JSON.stringify({
                delprops: {
                    espacoNomes: 'liquido.roteador',
                    esquema: './delprops/roteador'
                }
            }));
            // Módulo sem default — usa o próprio módulo como definições
            sistemaArquivos.carregarModulo.mockResolvedValue([
                { nome: 'cors', tipo: 'logico', detalhe: 'Habilita CORS.' }
            ] as unknown as Record<string, unknown>);

            await descobrir('/caminho/node_modules', sistemaArquivos);

            const propriedades = obter('liquido.roteador');
            expect(propriedades).toHaveLength(1);
            expect(propriedades[0].nome).toBe('cors');
        });
    });
});
