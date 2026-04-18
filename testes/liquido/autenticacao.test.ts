import autenticacao from '../../fontes/liquido/autenticacao';

describe('liquido/autenticacao', () => {
    it('deve exportar array não vazio', () => {
        expect(autenticacao).toBeDefined();
        expect(autenticacao.length).toBeGreaterThan(0);
    });

    it('deve ter todas as propriedades com campos obrigatórios', () => {
        for (const def of autenticacao) {
            expect(def.nome).toBeTruthy();
            expect(def.tipo).toBeTruthy();
            expect(def.detalhe).toBeTruthy();
        }
    });

    it('deve conter propriedade "tecnologia" do tipo texto', () => {
        const prop = autenticacao.find(d => d.nome === 'tecnologia');
        expect(prop).toBeDefined();
        expect(prop!.tipo).toBe('texto');
    });

    it('deve restringir tecnologia a valores permitidos', () => {
        const prop = autenticacao.find(d => d.nome === 'tecnologia');
        expect(prop!.valoresPermitidos).toEqual(['jwt']);
    });

    it('deve ter exatamente 1 propriedade', () => {
        expect(autenticacao).toHaveLength(1);
    });
});
