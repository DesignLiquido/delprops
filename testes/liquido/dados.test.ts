import dados from '../../fontes/liquido/dados';

describe('liquido/dados', () => {
    it('deve exportar array não vazio', () => {
        expect(dados).toBeDefined();
        expect(dados.length).toBeGreaterThan(0);
    });

    it('deve ter todas as propriedades com campos obrigatórios', () => {
        for (const def of dados) {
            expect(def.nome).toBeTruthy();
            expect(def.tipo).toBeTruthy();
            expect(def.detalhe).toBeTruthy();
        }
    });

    it('deve conter propriedade "tecnologia" com valores permitidos de banco', () => {
        const prop = dados.find(d => d.nome === 'tecnologia');
        expect(prop).toBeDefined();
        expect(prop!.tipo).toBe('texto');
        expect(prop!.valoresPermitidos).toEqual(['sqlite', 'mysql', 'postgres', 'mongodb', 'mssql']);
    });

    it('deve conter propriedade "caminho" do tipo texto', () => {
        const prop = dados.find(d => d.nome === 'caminho');
        expect(prop).toBeDefined();
        expect(prop!.tipo).toBe('texto');
    });

    it('deve conter propriedade "host" do tipo texto', () => {
        const prop = dados.find(d => d.nome === 'host');
        expect(prop).toBeDefined();
        expect(prop!.tipo).toBe('texto');
    });

    it('deve conter propriedade "porta" do tipo numero', () => {
        const prop = dados.find(d => d.nome === 'porta');
        expect(prop).toBeDefined();
        expect(prop!.tipo).toBe('numero');
    });

    it('deve conter propriedade "usuario" do tipo texto', () => {
        const prop = dados.find(d => d.nome === 'usuario');
        expect(prop).toBeDefined();
        expect(prop!.tipo).toBe('texto');
    });

    it('deve conter propriedade "senha" do tipo texto', () => {
        const prop = dados.find(d => d.nome === 'senha');
        expect(prop).toBeDefined();
        expect(prop!.tipo).toBe('texto');
    });

    it('deve conter propriedade "banco" do tipo texto', () => {
        const prop = dados.find(d => d.nome === 'banco');
        expect(prop).toBeDefined();
        expect(prop!.tipo).toBe('texto');
    });

    it('deve conter propriedade "autoInicializar" do tipo logico', () => {
        const prop = dados.find(d => d.nome === 'autoInicializar');
        expect(prop).toBeDefined();
        expect(prop!.tipo).toBe('logico');
    });

    it('deve conter propriedade "arquivoInicializacao" do tipo texto', () => {
        const prop = dados.find(d => d.nome === 'arquivoInicializacao');
        expect(prop).toBeDefined();
        expect(prop!.tipo).toBe('texto');
    });

    it('deve ter exatamente 9 propriedades', () => {
        expect(dados).toHaveLength(9);
    });
});
