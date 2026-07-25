import { analisar } from '../fontes/analisador';

describe('Módulo Analisador', () => {
    describe('analisar', () => {
        it('deve retornar lista vazia para conteúdo vazio', () => {
            const resultado = analisar('');
            expect(resultado.propriedades).toEqual([]);
            expect(resultado.erros).toEqual([]);
        });

        it('deve ignorar linhas em branco', () => {
            const resultado = analisar('\n\n\n');
            expect(resultado.propriedades).toEqual([]);
            expect(resultado.erros).toEqual([]);
        });

        it('deve ignorar comentários', () => {
            const resultado = analisar('// Isto é um comentário\n// Outro comentário');
            expect(resultado.propriedades).toEqual([]);
            expect(resultado.erros).toEqual([]);
        });

        it('deve ignorar comentários com espaços à esquerda', () => {
            const resultado = analisar('  // comentário com espaços');
            expect(resultado.propriedades).toEqual([]);
            expect(resultado.erros).toEqual([]);
        });

        it('deve parsear uma propriedade simples', () => {
            const resultado = analisar('liquido.roteador.cors = verdadeiro');
            expect(resultado.propriedades).toHaveLength(1);
            expect(resultado.erros).toEqual([]);
            expect(resultado.propriedades[0]).toEqual({
                chave: 'liquido.roteador.cors',
                valor: 'verdadeiro',
                linha: 1,
            });
        });

        it('deve parsear valor texto com aspas simples', () => {
            const resultado = analisar("liquido.dados.principal.tecnologia = 'sqlite'");
            expect(resultado.propriedades).toHaveLength(1);
            expect(resultado.propriedades[0].valor).toBe("'sqlite'");
        });

        it('deve parsear valor número', () => {
            const resultado = analisar('liquido.roteador.porta = 3000');
            expect(resultado.propriedades).toHaveLength(1);
            expect(resultado.propriedades[0].valor).toBe('3000');
        });

        it('deve aceitar espaços em volta do =', () => {
            const resultado = analisar('  liquido.roteador.cors  =  verdadeiro  ');
            expect(resultado.propriedades).toHaveLength(1);
            expect(resultado.propriedades[0].chave).toBe('liquido.roteador.cors');
            expect(resultado.propriedades[0].valor).toBe('verdadeiro');
        });

        it('deve parsear múltiplas linhas', () => {
            const resultado = analisar([
                'liquido.roteador.cors = verdadeiro',
                "liquido.dados.lincones.tecnologia = 'sqlite'",
                'liquido.roteador.porta = 3000',
            ].join('\n'));

            expect(resultado.propriedades).toHaveLength(3);
            expect(resultado.erros).toEqual([]);
        });

        it('deve misturar comentários e propriedades', () => {
            const resultado = analisar([
                '// Configuração do servidor',
                'liquido.roteador.cors = verdadeiro',
                '',
                '// Configuração de dados',
                "liquido.dados.lincones.caminho = ':memory:'",
            ].join('\n'));

            expect(resultado.propriedades).toHaveLength(2);
            expect(resultado.erros).toEqual([]);
        });

        it('deve reportar erro para linha sem =', () => {
            const resultado = analisar('liquido.roteador.cors');
            expect(resultado.propriedades).toEqual([]);
            expect(resultado.erros).toHaveLength(1);
            expect(resultado.erros[0]).toEqual({
                mensagem: "Linha sem o separador '='.",
                linha: 1,
            });
        });

        it('deve reportar erro para chave vazia', () => {
            const resultado = analisar('= verdadeiro');
            expect(resultado.propriedades).toEqual([]);
            expect(resultado.erros).toHaveLength(1);
            expect(resultado.erros[0]).toEqual({
                mensagem: 'Chave vazia.',
                linha: 1,
            });
        });

        it('deve reportar erro para valor vazio', () => {
            const resultado = analisar('liquido.roteador.cors = ');
            expect(resultado.propriedades).toEqual([]);
            expect(resultado.erros).toHaveLength(1);
            expect(resultado.erros[0]).toEqual({
                mensagem: "Valor vazio para a chave 'liquido.roteador.cors'.",
                linha: 1,
            });
        });

        it('deve reportar múltiplos erros', () => {
            const resultado = analisar([
                'chave1 = valor1',
                '= outro',
                'chave2 = ',
            ].join('\n'));

            expect(resultado.propriedades).toHaveLength(1);
            expect(resultado.propriedades[0].chave).toBe('chave1');
            expect(resultado.erros).toHaveLength(2);
            expect(resultado.erros[0].mensagem).toBe('Chave vazia.');
            expect(resultado.erros[1].mensagem).toBe("Valor vazio para a chave 'chave2'.");
        });

        it('deve parsear valor texto com espaços', () => {
            const resultado = analisar("app.titulo = 'Meu Projeto Legal'");
            expect(resultado.propriedades).toHaveLength(1);
            expect(resultado.propriedades[0].valor).toBe("'Meu Projeto Legal'");
        });

        it('deve reportar erro para chave duplicada exata', () => {
            const resultado = analisar([
                'liquido.roteador.cors = verdadeiro',
                'liquido.roteador.cors = falso',
            ].join('\n'));

            expect(resultado.propriedades).toHaveLength(1);
            expect(resultado.propriedades[0].valor).toBe('verdadeiro');
            expect(resultado.erros).toHaveLength(1);
            expect(resultado.erros[0]).toEqual({
                mensagem: expect.stringContaining('Chave duplicada'),
                linha: 2,
            });
            expect(resultado.erros[0].mensagem).toContain('linha 1');
        });

        it('deve reportar erro para chave duplicada entre comentários', () => {
            const resultado = analisar([
                'liquido.roteador.cors = verdadeiro',
                '// um comentário',
                'liquido.roteador.cors = falso',
            ].join('\n'));

            expect(resultado.propriedades).toHaveLength(1);
            expect(resultado.propriedades[0].valor).toBe('verdadeiro');
            expect(resultado.erros).toHaveLength(1);
            expect(resultado.erros[0].linha).toBe(3);
            expect(resultado.erros[0].mensagem).toContain('linha 1');
        });

        it('deve reportar múltiplas chaves duplicadas', () => {
            const resultado = analisar([
                'liquido.roteador.cors = verdadeiro',
                'liquido.roteador.porta = 3000',
                'liquido.roteador.cors = falso',
                'liquido.roteador.porta = 8080',
            ].join('\n'));

            expect(resultado.propriedades).toHaveLength(2);
            expect(resultado.erros).toHaveLength(2);
            expect(resultado.erros[0].mensagem).toContain("liquido.roteador.cors");
            expect(resultado.erros[1].mensagem).toContain("liquido.roteador.porta");
        });

        it('deve permitir chaves com mesmo nome em namespaces diferentes', () => {
            const resultado = analisar([
                'liquido.roteador.cors = verdadeiro',
                'liquido.dados.principal.cors = falso',
            ].join('\n'));

            expect(resultado.propriedades).toHaveLength(2);
            expect(resultado.erros).toEqual([]);
        });
    });
});
