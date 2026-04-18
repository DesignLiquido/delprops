import arquetipo from '../../fontes/liquido/arquetipo';

describe('liquido/arquetipo', () => {
    it('deve exportar array não vazio', () => {
        expect(arquetipo).toBeDefined();
        expect(arquetipo.length).toBeGreaterThan(0);
    });

    it('deve ter todas as propriedades com campos obrigatórios', () => {
        for (const def of arquetipo) {
            expect(def.nome).toBeTruthy();
            expect(def.tipo).toBeTruthy();
            expect(def.detalhe).toBeTruthy();
        }
    });

    it('deve conter propriedade "arquetipo" do tipo texto', () => {
        const prop = arquetipo.find(d => d.nome === 'arquetipo');
        expect(prop).toBeDefined();
        expect(prop!.tipo).toBe('texto');
    });

    it('deve restringir arquétipo a valores permitidos', () => {
        const prop = arquetipo.find(d => d.nome === 'arquetipo');
        expect(prop!.valoresPermitidos).toEqual(['rest', 'mvc']);
    });

    it('deve ter exatamente 1 propriedade', () => {
        expect(arquetipo).toHaveLength(1);
    });
});
