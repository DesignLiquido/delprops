import estilos from '../../fontes/liquido/estilos';

describe('liquido/estilos', () => {
    it('deve exportar array não vazio', () => {
        expect(estilos).toBeDefined();
        expect(estilos.length).toBeGreaterThan(0);
    });

    it('deve ter todas as propriedades com campos obrigatórios', () => {
        for (const def of estilos) {
            expect(def.nome).toBeTruthy();
            expect(def.tipo).toBeTruthy();
            expect(def.detalhe).toBeTruthy();
        }
    });

    it('deve conter propriedade "diretorioBase" com padrão "publico/css"', () => {
        const prop = estilos.find(d => d.nome === 'diretorioBase');
        expect(prop).toBeDefined();
        expect(prop!.tipo).toBe('texto');
        expect(prop!.padrao).toBe("'publico/css'");
    });

    it('deve ter exatamente 1 propriedade', () => {
        expect(estilos).toHaveLength(1);
    });
});
