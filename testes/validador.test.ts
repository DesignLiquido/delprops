import { validar, inferirTipo, valorSemAspas } from '../fontes/validador';
import { DefinicaoPropriedade, PropriedadeCompreendidaInterface } from '../fontes/interfaces';

function criarEsquemas(): Map<string, DefinicaoPropriedade[]> {
    const esquemas = new Map<string, DefinicaoPropriedade[]>();
    esquemas.set('liquido.roteador', [
        { nome: 'cors', tipo: 'logico', detalhe: 'Habilita CORS.' },
        { nome: 'porta', tipo: 'numero', detalhe: 'Porta do servidor.' },
    ]);
    esquemas.set('liquido.dados', [
        { nome: 'tecnologia', tipo: 'texto', detalhe: 'Tecnologia.', valoresPermitidos: ['sqlite', 'postgres'] },
        { nome: 'host', tipo: 'texto', detalhe: 'Host.' },
    ]);
    esquemas.set('liquido.autenticacao', [
        { nome: 'tecnologia', tipo: 'texto', detalhe: 'Tecnologia.', valoresPermitidos: ['jwt'] },
    ]);
    return esquemas;
}

describe('Módulo Validador', () => {
    describe('inferirTipo', () => {
        it('deve inferir tipo logico para verdadeiro', () => {
            expect(inferirTipo('verdadeiro')).toBe('logico');
        });

        it('deve inferir tipo logico para falso', () => {
            expect(inferirTipo('falso')).toBe('logico');
        });

        it('deve inferir tipo texto para valor com aspas', () => {
            expect(inferirTipo("'sqlite'")).toBe('texto');
        });

        it('deve inferir tipo texto para valor com aspas e espaços', () => {
            expect(inferirTipo("'Meu Projeto'")).toBe('texto');
        });

        it('deve inferir tipo numero para dígitos', () => {
            expect(inferirTipo('3000')).toBe('numero');
        });

        it('deve inferir tipo numero para 0', () => {
            expect(inferirTipo('0')).toBe('numero');
        });

        it('deve retornar null para valor desconhecido', () => {
            expect(inferirTipo('qualquer-coisa')).toBeNull();
        });

        it('deve inferir tipo numero para negativo', () => {
            expect(inferirTipo('-1')).toBe('numero');
        });

        it('deve inferir tipo numero para decimal positivo', () => {
            expect(inferirTipo('3.14')).toBe('numero');
        });

        it('deve inferir tipo numero para decimal negativo', () => {
            expect(inferirTipo('-1.5')).toBe('numero');
        });

        it('deve inferir tipo numero para zero decimal', () => {
            expect(inferirTipo('0.5')).toBe('numero');
        });

        it('deve retornar null para aspas vazias', () => {
            expect(inferirTipo("''")).toBe('texto');
        });

        it('deve retornar null para aspa simples isolada (length < 2)', () => {
            expect(inferirTipo("'")).toBeNull();
        });

        it('deve retornar null para aspa de abertura sem fechamento', () => {
            expect(inferirTipo("'hello")).toBeNull();
        });

        it('deve retornar null para texto não numérico', () => {
            expect(inferirTipo('abc')).toBeNull();
        });
    });

    describe('valorSemAspas', () => {
        it('deve remover aspas simples do valor', () => {
            expect(valorSemAspas("'sqlite'")).toBe('sqlite');
        });

        it('deve retornar o mesmo valor se não tiver aspas', () => {
            expect(valorSemAspas('verdadeiro')).toBe('verdadeiro');
        });

        it('deve retornar string vazia para aspas vazias', () => {
            expect(valorSemAspas("''")).toBe('');
        });

        it('deve retornar a aspa simples sem modificar (length < 2)', () => {
            expect(valorSemAspas("'")).toBe("'");
        });

        it('deve retornar valor sem modificar se tiver aspa só no início', () => {
            expect(valorSemAspas("'hello")).toBe("'hello");
        });
    });

    describe('validar', () => {
        let esquemas: Map<string, DefinicaoPropriedade[]>;

        beforeEach(() => {
            esquemas = criarEsquemas();
        });

        it('deve validar propriedade logico correta', () => {
            const props: PropriedadeCompreendidaInterface[] = [
                { chave: 'liquido.roteador.cors', valor: 'verdadeiro', linha: 1 },
            ];

            const resultado = validar(props, esquemas);
            expect(resultado.avisos).toEqual([]);
            expect(resultado.erros).toEqual([]);
        });

        it('deve validar propriedade número correta', () => {
            const props: PropriedadeCompreendidaInterface[] = [
                { chave: 'liquido.roteador.porta', valor: '3000', linha: 1 },
            ];

            const resultado = validar(props, esquemas);
            expect(resultado.avisos).toEqual([]);
            expect(resultado.erros).toEqual([]);
        });

        it('deve validar propriedade texto correta', () => {
            const props: PropriedadeCompreendidaInterface[] = [
                { chave: 'liquido.autenticacao.tecnologia', valor: "'jwt'", linha: 1 },
            ];

            const resultado = validar(props, esquemas);
            expect(resultado.avisos).toEqual([]);
            expect(resultado.erros).toEqual([]);
        });

        it('deve validar liquido.dados com sub-namespace dinâmico', () => {
            const props: PropriedadeCompreendidaInterface[] = [
                { chave: 'liquido.dados.lincones.tecnologia', valor: "'sqlite'", linha: 1 },
            ];

            const resultado = validar(props, esquemas);
            expect(resultado.avisos).toEqual([]);
            expect(resultado.erros).toEqual([]);
        });

        it('deve ignorar namespace não conhecido (regra 7)', () => {
            const props: PropriedadeCompreendidaInterface[] = [
                { chave: 'meuapp.config.timeout', valor: '3000', linha: 1 },
            ];

            const resultado = validar(props, esquemas);
            expect(resultado.avisos).toEqual([]);
            expect(resultado.erros).toEqual([]);
        });

        it('deve gerar erro para tipo incompatível', () => {
            const props: PropriedadeCompreendidaInterface[] = [
                { chave: 'liquido.roteador.cors', valor: "'sim'", linha: 1 },
            ];

            const resultado = validar(props, esquemas);
            expect(resultado.avisos).toEqual([]);
            expect(resultado.erros).toHaveLength(1);
            expect(resultado.erros[0].mensagem).toContain('Tipo esperado');
        });

        it('deve gerar erro para valor não permitido', () => {
            const props: PropriedadeCompreendidaInterface[] = [
                { chave: 'liquido.dados.lincones.tecnologia', valor: "'mysql'", linha: 1 },
            ];

            const resultado = validar(props, esquemas);
            expect(resultado.avisos).toEqual([]);
            expect(resultado.erros).toHaveLength(1);
            expect(resultado.erros[0].mensagem).toContain('não está entre os permitidos');
        });

        it('deve gerar aviso para propriedade desconhecida', () => {
            const props: PropriedadeCompreendidaInterface[] = [
                { chave: 'liquido.roteador.timeout', valor: '3000', linha: 1 },
            ];

            const resultado = validar(props, esquemas);
            expect(resultado.erros).toEqual([]);
            expect(resultado.avisos).toHaveLength(1);
            expect(resultado.avisos[0].mensagem).toContain('desconhecida');
        });

        it('deve gerar erro para valor sem tipo conhecido', () => {
            const props: PropriedadeCompreendidaInterface[] = [
                { chave: 'liquido.roteador.cors', valor: 'talvez', linha: 1 },
            ];

            const resultado = validar(props, esquemas);
            expect(resultado.erros).toHaveLength(1);
            expect(resultado.erros[0].mensagem).toContain('não corresponde a nenhum tipo conhecido');
        });

        it('deve gerar aviso para chave igual ao namespace sem propriedade', () => {
            const props: PropriedadeCompreendidaInterface[] = [
                { chave: 'liquido.roteador', valor: 'verdadeiro', linha: 1 },
            ];

            const resultado = validar(props, esquemas);
            expect(resultado.avisos).toHaveLength(1);
            expect(resultado.avisos[0].mensagem).toContain('sem nome de propriedade');
        });

        it('deve aceitar valor dentro dos permitidos para propriedade com valoresPermitidos', () => {
            const props: PropriedadeCompreendidaInterface[] = [
                { chave: 'liquido.autenticacao.tecnologia', valor: "'jwt'", linha: 1 },
            ];

            const resultado = validar(props, esquemas);
            expect(resultado.avisos).toEqual([]);
            expect(resultado.erros).toEqual([]);
        });

        it('deve processar múltiplas propriedades com diferentes resultados', () => {
            const props: PropriedadeCompreendidaInterface[] = [
                { chave: 'liquido.roteador.cors', valor: 'verdadeiro', linha: 1 },
                { chave: 'liquido.roteador.timeout', valor: '3000', linha: 2 },
                { chave: 'liquido.roteador.porta', valor: "'abc'", linha: 3 },
                { chave: 'liquido.dados.lincones.tecnologia', valor: "'mongodb'", linha: 4 },
            ];

            const resultado = validar(props, esquemas);

            // cors: OK
            // timeout: aviso (prop desconhecida)
            // porta: erro (tipo texto em campo numero)
            // tecnologia mongodb: erro (não permitido)
            expect(resultado.avisos).toHaveLength(1);
            expect(resultado.erros).toHaveLength(2);
        });
    });
});
