import roteador from '../../fontes/liquido/roteador';

describe('liquido/roteador', () => {
    it('deve exportar array não vazio', () => {
        expect(roteador).toBeDefined();
        expect(roteador.length).toBeGreaterThan(0);
    });

    it('deve ter todas as propriedades com campos obrigatórios', () => {
        for (const def of roteador) {
            expect(def.nome).toBeTruthy();
            expect(def.tipo).toBeTruthy();
            expect(def.detalhe).toBeTruthy();
        }
    });

    it('deve conter propriedade "diretorioEstatico" com padrão "publico"', () => {
        const prop = roteador.find(d => d.nome === 'diretorioEstatico');
        expect(prop).toBeDefined();
        expect(prop!.tipo).toBe('texto');
        expect(prop!.padrao).toBe("'publico'");
    });

    it('deve conter propriedade "cors" do tipo logico com padrão falso', () => {
        const prop = roteador.find(d => d.nome === 'cors');
        expect(prop).toBeDefined();
        expect(prop!.tipo).toBe('logico');
        expect(prop!.padrao).toBe('falso');
    });

    it('deve conter propriedade "bodyParser" do tipo logico com padrão verdadeiro', () => {
        const prop = roteador.find(d => d.nome === 'bodyParser');
        expect(prop).toBeDefined();
        expect(prop!.tipo).toBe('logico');
        expect(prop!.padrao).toBe('verdadeiro');
    });

    it('deve conter propriedade "morgan" do tipo logico com padrão falso', () => {
        const prop = roteador.find(d => d.nome === 'morgan');
        expect(prop).toBeDefined();
        expect(prop!.tipo).toBe('logico');
        expect(prop!.padrao).toBe('falso');
    });

    it('deve conter propriedade "cookieParser" do tipo logico com padrão verdadeiro', () => {
        const prop = roteador.find(d => d.nome === 'cookieParser');
        expect(prop).toBeDefined();
        expect(prop!.tipo).toBe('logico');
        expect(prop!.padrao).toBe('verdadeiro');
    });

    it('deve conter propriedade "passport" do tipo logico com padrão falso', () => {
        const prop = roteador.find(d => d.nome === 'passport');
        expect(prop).toBeDefined();
        expect(prop!.tipo).toBe('logico');
        expect(prop!.padrao).toBe('falso');
    });

    it('deve conter propriedade "json" do tipo logico com padrão verdadeiro', () => {
        const prop = roteador.find(d => d.nome === 'json');
        expect(prop).toBeDefined();
        expect(prop!.tipo).toBe('logico');
        expect(prop!.padrao).toBe('verdadeiro');
    });

    it('deve conter propriedade "helmet" do tipo logico com padrão verdadeiro', () => {
        const prop = roteador.find(d => d.nome === 'helmet');
        expect(prop).toBeDefined();
        expect(prop!.tipo).toBe('logico');
        expect(prop!.padrao).toBe('verdadeiro');
    });

    it('deve ter exatamente 8 propriedades', () => {
        expect(roteador).toHaveLength(8);
    });
});
