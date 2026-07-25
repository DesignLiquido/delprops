import { executarCLI } from "../fontes/cli";
import {
  SistemaCLIInterface,
  DefinicaoPropriedadeInterface,
} from "../fontes/interfaces";

function criarSistemaCLIMock(): {
  sistema: jest.Mocked<SistemaCLIInterface>;
  saidas: string[];
  erros: string[];
} {
  const saidas: string[] = [];
  const erros: string[] = [];

  const sistema: jest.Mocked<SistemaCLIInterface> = {
    argumentos: [],
    lerArquivo: jest.fn(),
    diretorioAtual: jest.fn().mockReturnValue("/projeto"),
    juntarCaminhos: jest.fn((...partes: string[]) => partes.join("/")),
    resolverCaminho: jest.fn((...partes: string[]) => partes.join("/")),
    escreverSaida: jest.fn((texto: string) => {
      saidas.push(texto);
    }),
    escreverErro: jest.fn((texto: string) => {
      erros.push(texto);
    }),
    encerrar: jest.fn(),
    existe: jest.fn(),
  };

  return { sistema, saidas, erros };
}

describe("Módulo CLI", () => {
  describe("comando --ajuda", () => {
    it("deve exibir ajuda quando não há argumentos", async () => {
      const { sistema, saidas } = criarSistemaCLIMock();
      sistema.argumentos = [];

      await executarCLI(sistema);

      expect(sistema.encerrar).toHaveBeenCalledWith(0);
      expect(saidas.join("")).toContain(
        "delprops — Ferramenta de linha de comando",
      );
    });

    it("deve exibir ajuda com --ajuda", async () => {
      const { sistema, saidas } = criarSistemaCLIMock();
      sistema.argumentos = ["--ajuda"];

      await executarCLI(sistema);

      expect(sistema.encerrar).toHaveBeenCalledWith(0);
      expect(saidas.join("")).toContain("delprops");
    });
  });

  describe("comando --versao / -v", () => {
    it("deve exibir a versão com --versao", async () => {
      const { sistema, saidas } = criarSistemaCLIMock();
      sistema.argumentos = ["--versao"];

      await executarCLI(sistema);

      expect(sistema.encerrar).toHaveBeenCalledWith(0);
      expect(saidas.join("")).toMatch(/^delprops v\d+\.\d+\.\d+/);
    });

    it("deve exibir a versão com -v", async () => {
      const { sistema, saidas } = criarSistemaCLIMock();
      sistema.argumentos = ["-v"];

      await executarCLI(sistema);

      expect(sistema.encerrar).toHaveBeenCalledWith(0);
      expect(saidas.join("")).toMatch(/^delprops v/);
    });
  });

  describe("comando esquemas", () => {
    it("deve listar todos os namespaces embutidos", async () => {
      const { sistema, saidas } = criarSistemaCLIMock();
      sistema.argumentos = ["esquemas"];

      await executarCLI(sistema);

      expect(sistema.encerrar).toHaveBeenCalledWith(0);
      const output = saidas.join("");
      expect(output).toContain("liquido.arquetipo");
      expect(output).toContain("liquido.linguagem");
      expect(output).toContain("liquido.aplicacao");
      expect(output).toContain("liquido.roteador");
      expect(output).toContain("liquido.dados");
      expect(output).toContain("liquido.autenticacao");
      expect(output).toContain("liquido.estilos");
    });

    it("deve incluir esquemas adicionais passados por parâmetro", async () => {
      const { sistema, saidas } = criarSistemaCLIMock();
      sistema.argumentos = ["esquemas"];

      const adicionais = new Map<string, DefinicaoPropriedadeInterface[]>();
      adicionais.set("liquido.cache", [
        {
          nome: "tempoExpiracao",
          tipo: "numero",
          detalhe: "Tempo de expiração em segundos.",
        },
      ]);

      await executarCLI(sistema, adicionais);

      expect(sistema.encerrar).toHaveBeenCalledWith(0);
      const output = saidas.join("");
      expect(output).toContain("liquido.cache");
      expect(output).toContain("tempoExpiracao");
    });
  });

  describe("comando compreender", () => {
    it("deve compreender e exibir propriedades válidas", async () => {
      const { sistema, saidas } = criarSistemaCLIMock();
      sistema.argumentos = ["compreender", "config.delprops"];
      sistema.existe.mockResolvedValue(true);
      sistema.lerArquivo.mockResolvedValue(
        [
          "liquido.roteador.cors = verdadeiro",
          "liquido.dados.principal.tecnologia = 'sqlite'",
        ].join("\n"),
      );

      await executarCLI(sistema);

      expect(sistema.encerrar).toHaveBeenCalledWith(0);
      const output = saidas.join("");
      expect(output).toContain("liquido.roteador.cors");
      expect(output).toContain("liquido.dados.principal.tecnologia");
    });

    it("deve reportar erros de sintaxe", async () => {
      const { sistema, saidas } = criarSistemaCLIMock();
      sistema.argumentos = ["compreender", "config.delprops"];
      sistema.existe.mockResolvedValue(true);
      sistema.lerArquivo.mockResolvedValue("chave_invalida_sem_igual");

      await executarCLI(sistema);

      expect(sistema.encerrar).toHaveBeenCalledWith(1);
      const output = saidas.join("");
      expect(output).toContain("Erros de sintaxe");
    });

    it("deve reportar erro quando arquivo não existe", async () => {
      const { sistema, erros } = criarSistemaCLIMock();
      sistema.argumentos = ["compreender", "inexistente.delprops"];
      sistema.existe.mockResolvedValue(false);

      await executarCLI(sistema);

      expect(sistema.encerrar).toHaveBeenCalledWith(1);
      expect(erros.join("")).toContain("Arquivo não encontrado");
    });

    it("deve reportar erro quando --esquemas é passado sem valor", async () => {
      const { sistema, erros } = criarSistemaCLIMock();
      sistema.argumentos = ["validar", "config.delprops", "--esquemas"];

      await executarCLI(sistema);

      expect(sistema.encerrar).toHaveBeenCalledWith(1);
      expect(erros.join("")).toContain("'--esquemas' requer um valor");
    });

    it("deve reportar erro quando caminho do arquivo não é fornecido", async () => {
      const { sistema, erros } = criarSistemaCLIMock();
      sistema.argumentos = ["compreender"];

      await executarCLI(sistema);

      expect(sistema.encerrar).toHaveBeenCalledWith(1);
      expect(erros.join("")).toContain("requer o caminho de um arquivo");
    });
  });

  describe("comando validar", () => {
    it("deve validar arquivo com propriedades corretas", async () => {
      const { sistema, saidas } = criarSistemaCLIMock();
      sistema.argumentos = ["validar", "config.delprops"];
      sistema.existe.mockResolvedValue(true);
      sistema.lerArquivo.mockResolvedValue(
        [
          "liquido.roteador.cors = verdadeiro",
          "liquido.roteador.porta = 3000",
        ].join("\n"),
      );

      await executarCLI(sistema);

      expect(sistema.encerrar).toHaveBeenCalledWith(0);
      expect(saidas.join("")).toContain("Arquivo válido");
    });

    it("deve reportar erros de validação", async () => {
      const { sistema, saidas } = criarSistemaCLIMock();
      sistema.argumentos = ["validar", "config.delprops"];
      sistema.existe.mockResolvedValue(true);
      sistema.lerArquivo.mockResolvedValue("liquido.roteador.cors = 123");

      await executarCLI(sistema);

      expect(sistema.encerrar).toHaveBeenCalledWith(1);
      const output = saidas.join("");
      expect(output).toContain("[Erro]");
      expect(output).toContain("Resumo");
    });

    it("deve reportar avisos de propriedades desconhecidas", async () => {
      const { sistema, saidas } = criarSistemaCLIMock();
      sistema.argumentos = ["validar", "config.delprops"];
      sistema.existe.mockResolvedValue(true);
      sistema.lerArquivo.mockResolvedValue(
        [
          "liquido.roteador.cors = verdadeiro",
          "liquido.roteador.propriedadeInexistente = verdadeiro",
        ].join("\n"),
      );

      await executarCLI(sistema);

      expect(sistema.encerrar).toHaveBeenCalledWith(0);
      const output = saidas.join("");
      expect(output).toContain("[Aviso]");
      expect(output).toContain("propriedadeInexistente");
    });

    it("deve carregar esquemas de arquivo externo com --esquemas", async () => {
      const { sistema, saidas } = criarSistemaCLIMock();
      sistema.argumentos = [
        "validar",
        "config.delprops",
        "--esquemas",
        "meus-esquemas.json",
      ];
      sistema.existe.mockImplementation(
        async (caminho: string) =>
          caminho.includes("config.delprops") ||
          caminho.includes("meus-esquemas.json"),
      );
      sistema.lerArquivo.mockImplementation(async (caminho: string) => {
        if (caminho.includes("meus-esquemas.json")) {
          return JSON.stringify({
            "liquido.roteador": [
              {
                nome: "timeout",
                tipo: "numero",
                detalhe: "Timeout em ms.",
              },
            ],
          });
        }
        return "liquido.roteador.timeout = 5000\nliquido.roteador.cors = verdadeiro";
      });

      await executarCLI(sistema);

      expect(sistema.encerrar).toHaveBeenCalledWith(0);
      expect(saidas.join("")).toContain("Arquivo válido");
    });

    it("deve reportar erro se caminho de esquemas não existe", async () => {
      const { sistema, erros } = criarSistemaCLIMock();
      sistema.argumentos = [
        "validar",
        "config.delprops",
        "--esquemas",
        "inexistente.json",
      ];
      sistema.existe.mockImplementation(async (caminho: string) =>
        caminho.includes("config.delprops"),
      );
      sistema.lerArquivo.mockResolvedValue(
        "liquido.roteador.cors = verdadeiro",
      );

      await executarCLI(sistema);

      expect(sistema.encerrar).toHaveBeenCalledWith(1);
      expect(erros.join("")).toContain("não encontrado");
    });

    it("deve aceitar esquemas adicionais via parâmetro da função", async () => {
      const { sistema, saidas } = criarSistemaCLIMock();
      sistema.argumentos = ["validar", "config.delprops"];
      sistema.existe.mockResolvedValue(true);
      sistema.lerArquivo.mockResolvedValue(
        "liquido.meuapp.config = verdadeiro",
      );

      const adicionais = new Map<string, DefinicaoPropriedadeInterface[]>();
      adicionais.set("liquido.meuapp", [
        {
          nome: "config",
          tipo: "logico",
          detalhe: "Config personalizada.",
        },
      ]);

      await executarCLI(sistema, adicionais);

      expect(sistema.encerrar).toHaveBeenCalledWith(0);
      expect(saidas.join("")).toContain("Arquivo válido");
    });
  });

  describe("comando info", () => {
    it("deve exibir informações de uma propriedade encontrada", async () => {
      const { sistema, saidas } = criarSistemaCLIMock();
      sistema.argumentos = ["info", "cors"];

      await executarCLI(sistema);

      expect(sistema.encerrar).toHaveBeenCalledWith(0);
      const output = saidas.join("");
      expect(output).toContain("Propriedade: cors");
      expect(output).toContain("liquido.roteador");
      expect(output).toContain("logico");
    });

    it("deve exibir informações de propriedade com valores permitidos", async () => {
      const { sistema, saidas } = criarSistemaCLIMock();
      sistema.argumentos = ["info", "tecnologia"];

      await executarCLI(sistema);

      expect(sistema.encerrar).toHaveBeenCalledWith(0);
      const output = saidas.join("");
      expect(output).toContain("Propriedade: tecnologia");
      expect(output).toContain("liquido.dados");
      expect(output).toContain("liquido.autenticacao");
      expect(output).toContain("Valores permitidos");
    });

    it("deve exibir informação de propriedade com valor padrão", async () => {
      const { sistema, saidas } = criarSistemaCLIMock();
      sistema.argumentos = ["info", "porta"];

      await executarCLI(sistema);

      expect(sistema.encerrar).toHaveBeenCalledWith(0);
      const output = saidas.join("");
      expect(output).toContain("Propriedade: porta");
      expect(output).toContain("Padrão:");
    });

    it("deve reportar erro quando propriedade não é encontrada", async () => {
      const { sistema, saidas } = criarSistemaCLIMock();
      sistema.argumentos = ["info", "propriedade-inexistente"];

      await executarCLI(sistema);

      expect(sistema.encerrar).toHaveBeenCalledWith(1);
      const output = saidas.join("");
      expect(output).toContain("Nenhuma propriedade encontrada");
    });

    it("deve reportar erro quando nenhum nome é fornecido", async () => {
      const { sistema, erros } = criarSistemaCLIMock();
      sistema.argumentos = ["info"];

      await executarCLI(sistema);

      expect(sistema.encerrar).toHaveBeenCalledWith(1);
      expect(erros.join("")).toContain("requer o nome de uma propriedade");
    });

    it("deve incluir esquemas adicionais na busca", async () => {
      const { sistema, saidas } = criarSistemaCLIMock();
      sistema.argumentos = ["info", "tempoExpiracao"];

      const adicionais = new Map<string, DefinicaoPropriedadeInterface[]>();
      adicionais.set("liquido.cache", [
        {
          nome: "tempoExpiracao",
          tipo: "numero",
          detalhe: "Tempo de expiração em segundos.",
        },
      ]);

      await executarCLI(sistema, adicionais);

      expect(sistema.encerrar).toHaveBeenCalledWith(0);
      const output = saidas.join("");
      expect(output).toContain("tempoExpiracao");
      expect(output).toContain("liquido.cache");
    });
  });

  describe("comando validar com chaves duplicadas", () => {
    it("deve reportar erro de chave duplicada durante validação", async () => {
      const { sistema, saidas } = criarSistemaCLIMock();
      sistema.argumentos = ["validar", "config.delprops"];
      sistema.existe.mockResolvedValue(true);
      sistema.lerArquivo.mockResolvedValue(
        [
          "liquido.roteador.cors = verdadeiro",
          "liquido.roteador.cors = falso",
        ].join("\n"),
      );

      await executarCLI(sistema);

      expect(sistema.encerrar).toHaveBeenCalledWith(1);
      const output = saidas.join("");
      expect(output).toContain("Chave duplicada");
      expect(output).toContain("Resumo");
    });
  });

  describe("comando desconhecido", () => {
    it("deve exibir erro e sugerir --ajuda", async () => {
      const { sistema, saidas, erros } = criarSistemaCLIMock();
      sistema.argumentos = ["comando-estranho"];

      await executarCLI(sistema);

      expect(sistema.encerrar).toHaveBeenCalledWith(1);
      expect(erros.join("")).toContain("comando-estranho");
      expect(saidas.join("")).toContain("--ajuda");
    });
  });
});
