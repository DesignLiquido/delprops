import linguagem from '../../fontes/liquido/linguagem';

describe('liquido/linguagem', () => {
    it('deve exportar array não vazio', () => {
        expect(linguagem).toBeDefined();
        expect(linguagem.length).toBeGreaterThan(0);
    });

    it('deve ter todas as propriedades com campos obrigatórios', () => {
        for (const def of linguagem) {
            expect(def.nome).toBeTruthy();
            expect(def.tipo).toBeTruthy();
            expect(def.detalhe).toBeTruthy();
        }
    });

    it('deve conter propriedade "linguagem" do tipo texto', () => {
        const prop = linguagem.find(d => d.nome === 'linguagem');
        expect(prop).toBeDefined();
        expect(prop!.tipo).toBe('texto');
    });

    it('deve restringir linguagem a valores permitidos', () => {
        const prop = linguagem.find(d => d.nome === 'linguagem');
        expect(prop!.valoresPermitidos).toEqual(['delégua', 'pituguês']);
    });

    it('deve ter exatamente 1 propriedade', () => {
        expect(linguagem).toHaveLength(1);
    });
});
