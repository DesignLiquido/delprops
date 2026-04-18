import aplicacao from '../../fontes/liquido/aplicacao';

describe('liquido/aplicacao', () => {
    it('deve exportar array não vazio', () => {
        expect(aplicacao).toBeDefined();
        expect(aplicacao.length).toBeGreaterThan(0);
    });

    it('deve ter todas as propriedades com campos obrigatórios', () => {
        for (const def of aplicacao) {
            expect(def.nome).toBeTruthy();
            expect(def.tipo).toBeTruthy();
            expect(def.detalhe).toBeTruthy();
        }
    });

    it('deve conter propriedade "nome" do tipo texto', () => {
        const prop = aplicacao.find(d => d.nome === 'nome');
        expect(prop).toBeDefined();
        expect(prop!.tipo).toBe('texto');
    });

    it('deve conter propriedade "versao" do tipo texto', () => {
        const prop = aplicacao.find(d => d.nome === 'versao');
        expect(prop).toBeDefined();
        expect(prop!.tipo).toBe('texto');
    });

    it('deve conter propriedade "descricao" do tipo texto', () => {
        const prop = aplicacao.find(d => d.nome === 'descricao');
        expect(prop).toBeDefined();
        expect(prop!.tipo).toBe('texto');
    });

    it('deve conter propriedade "licenca.nome" do tipo texto', () => {
        const prop = aplicacao.find(d => d.nome === 'licenca.nome');
        expect(prop).toBeDefined();
        expect(prop!.tipo).toBe('texto');
    });

    it('deve conter propriedade "licenca.url" do tipo texto', () => {
        const prop = aplicacao.find(d => d.nome === 'licenca.url');
        expect(prop).toBeDefined();
        expect(prop!.tipo).toBe('texto');
    });

    it('deve ter exatamente 5 propriedades', () => {
        expect(aplicacao).toHaveLength(5);
    });
});
