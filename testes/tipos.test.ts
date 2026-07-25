import { TipoValor } from "../fontes/tipos";
import { DefinicaoPropriedadeInterface } from "../fontes/interfaces";

describe("Módulo Tipos", () => {
  describe("TipoValor", () => {
    it('deve permitir tipo "logico"', () => {
      const tipo: TipoValor = "logico";
      expect(tipo).toBe("logico");
    });

    it('deve permitir tipo "texto"', () => {
      const tipo: TipoValor = "texto";
      expect(tipo).toBe("texto");
    });

    it('deve permitir tipo "numero"', () => {
      const tipo: TipoValor = "numero";
      expect(tipo).toBe("numero");
    });
  });

  describe("DefinicaoPropriedade", () => {
    it("deve criar definição com campos obrigatórios", () => {
      const def: DefinicaoPropriedadeInterface = {
        nome: "cor",
        tipo: "texto",
        detalhe: "Cor do elemento",
      };

      expect(def.nome).toBe("cor");
      expect(def.tipo).toBe("texto");
      expect(def.detalhe).toBe("Cor do elemento");
    });

    it('deve permitir campo "padrao" opcional', () => {
      const def: DefinicaoPropriedadeInterface = {
        nome: "visivel",
        tipo: "logico",
        detalhe: "Elemento visível",
        padrao: "verdadeiro",
      };

      expect(def.padrao).toBe("verdadeiro");
    });

    it('deve permitir campo "valoresPermitidos" opcional', () => {
      const def: DefinicaoPropriedadeInterface = {
        nome: "alinhamento",
        tipo: "texto",
        detalhe: "Alinhamento do texto",
        valoresPermitidos: ["esquerda", "centro", "direita"],
      };

      expect(def.valoresPermitidos).toEqual(["esquerda", "centro", "direita"]);
    });

    it("deve permitir múltiplos valores permitidos", () => {
      const def: DefinicaoPropriedadeInterface = {
        nome: "tamanho",
        tipo: "numero",
        detalhe: "Tamanho em pixels",
        valoresPermitidos: ["10", "12", "14", "16", "18", "20"],
      };

      expect(def.valoresPermitidos).toHaveLength(6);
    });

    it("deve permitir definição completa com todos os campos", () => {
      const def: DefinicaoPropriedadeInterface = {
        nome: "estilo",
        tipo: "texto",
        detalhe: "Estilo do elemento",
        padrao: "normal",
        valoresPermitidos: ["normal", "negrito", "itálico"],
      };

      expect(def.nome).toBe("estilo");
      expect(def.tipo).toBe("texto");
      expect(def.detalhe).toBe("Estilo do elemento");
      expect(def.padrao).toBe("normal");
      expect(def.valoresPermitidos).toHaveLength(3);
    });
  });
});
