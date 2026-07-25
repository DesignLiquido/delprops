import { analisar } from "./analisador";
import { validar } from "./validador";
import {
  SistemaCLIInterface,
  DefinicaoPropriedadeInterface,
  OpcoesCLIInterface,
  ErroValidacaoInterface,
} from "./interfaces";
import {
  formatarValidacao,
  formatarCompreensao,
  formatarEsquemas,
  formatarAjuda,
  formatarInfo,
} from "./cli-formatadores";
import {
  obterEsquemasEmbutidos,
  carregarEsquemasDeArquivo,
  mesclarEsquemas,
} from "./cli-esquemas";
import pacote from "../package.json";

const versao = pacote.version;

function compreenderArgumentos(args: string[]): OpcoesCLIInterface {
  if (args.length === 0 || args[0] === "--ajuda") {
    return { comando: "ajuda" };
  }

  if (args[0] === "--versao" || args[0] === "-v") {
    return { comando: "versao" };
  }

  const comando = args[0];

  if (comando === "esquemas") return { comando };

  if (comando === "info") {
    const nomePropriedade = args[1];
    if (!nomePropriedade || nomePropriedade.startsWith("-")) {
      return {
        comando,
        erro: `O comando 'info' requer o nome de uma propriedade.`,
      };
    }
    return { comando, nomePropriedade };
  }

  if (comando === "validar" || comando === "compreender") {
    let caminhoArquivo: string | undefined;
    let caminhoEsquemas: string | undefined;

    for (let i = 1; i < args.length; i++) {
      if (args[i] === "--esquemas") {
        const valor = args[++i];

        if (valor === undefined || valor.startsWith("-")) {
          return {
            comando,
            erro: `A opção '--esquemas' requer um valor.`,
          };
        }

        caminhoEsquemas = valor;
      } else if (caminhoArquivo === undefined) {
        caminhoArquivo = args[i];
      }
    }

    if (caminhoArquivo === undefined) {
      return {
        comando,
        erro: `O comando '${comando}' requer o caminho de um arquivo .delprops.`,
      };
    }

    return { comando, caminhoArquivo, caminhoEsquemas };
  }

  return { comando: "ajuda", erro: `Comando desconhecido: '${comando}'.` };
}

/**
 * Lê um arquivo de forma segura, retornando `null` em caso de erro
 * e escrevendo a mensagem de erro apropriada via sistema.
 */
async function lerArquivoSeguro(
  sistema: SistemaCLIInterface,
  caminho: string,
): Promise<string | null> {
  const caminhoAbsoluto = sistema.resolverCaminho(
    sistema.diretorioAtual(),
    caminho,
  );

  if (!(await sistema.existe(caminhoAbsoluto))) {
    sistema.escreverErro(`Arquivo não encontrado: ${caminho}\n`);
    return null;
  }

  try {
    return await sistema.lerArquivo(caminhoAbsoluto);
  } catch (e) {
    sistema.escreverErro(`Erro ao ler o arquivo: ${(e as Error).message}\n`);
    return null;
  }
}

async function comandoAjuda(sistema: SistemaCLIInterface): Promise<void> {
  sistema.escreverSaida(formatarAjuda() + "\n");
  sistema.encerrar(0);
}

async function comandoVersao(sistema: SistemaCLIInterface): Promise<void> {
  sistema.escreverSaida(`delprops v${versao}\n`);
  sistema.encerrar(0);
}

async function comandoInfo(
  sistema: SistemaCLIInterface,
  nomePropriedade: string,
  esquemasAdicionais?: Map<string, DefinicaoPropriedadeInterface[]>,
): Promise<void> {
  const esquemas = obterEsquemasEmbutidos();

  if (esquemasAdicionais) {
    mesclarEsquemas(esquemas, esquemasAdicionais);
  }

  const resultados: {
    namespace: string;
    definicao: DefinicaoPropriedadeInterface;
  }[] = [];

  for (const [namespace, definicoes] of esquemas) {
    for (const def of definicoes) {
      if (def.nome === nomePropriedade) {
        resultados.push({ namespace, definicao: def });
      }
    }
  }

  sistema.escreverSaida(formatarInfo(resultados) + "\n");
  sistema.encerrar(resultados.length === 0 ? 1 : 0);
}

async function comandoEsquemas(
  sistema: SistemaCLIInterface,
  esquemasAdicionais?: Map<string, DefinicaoPropriedadeInterface[]>,
): Promise<void> {
  const esquemas = obterEsquemasEmbutidos();

  if (esquemasAdicionais) {
    mesclarEsquemas(esquemas, esquemasAdicionais);
  }

  sistema.escreverSaida(formatarEsquemas(esquemas));
  sistema.escreverSaida("\n");
  sistema.encerrar(0);
}

async function comandoCompreender(
  sistema: SistemaCLIInterface,
  caminhoArquivo: string,
): Promise<void> {
  const conteudo = await lerArquivoSeguro(sistema, caminhoArquivo);
  if (conteudo === null) {
    sistema.encerrar(1);
    return;
  }

  const resultado = analisar(conteudo);
  sistema.escreverSaida(formatarCompreensao(resultado) + "\n");
  sistema.encerrar(resultado.erros.length > 0 ? 1 : 0);
}

async function comandoValidar(
  sistema: SistemaCLIInterface,
  caminhoArquivo: string,
  caminhoEsquemas?: string,
  esquemasAdicionais?: Map<string, DefinicaoPropriedadeInterface[]>,
): Promise<void> {
  const conteudo = await lerArquivoSeguro(sistema, caminhoArquivo);
  if (conteudo === null) {
    sistema.encerrar(1);
    return;
  }

  const esquemas = obterEsquemasEmbutidos();

  if (caminhoEsquemas) {
    const esquemasExternos = await carregarEsquemasDeArquivo(
      sistema,
      caminhoEsquemas,
    );

    if (esquemasExternos === null) {
      sistema.encerrar(1);
      return;
    }

    mesclarEsquemas(esquemas, esquemasExternos);
  }

  if (esquemasAdicionais) {
    mesclarEsquemas(esquemas, esquemasAdicionais);
  }

  const compreendido = analisar(conteudo);
  const resultadoValidacao = validar(compreendido.propriedades, esquemas);

  // Propagar erros de parse (ex: chaves duplicadas) para a validação
  const errosParse: ErroValidacaoInterface[] = compreendido.erros.map((e) => ({
    chave: "",
    linha: e.linha,
    mensagem: e.mensagem,
  }));
  resultadoValidacao.erros.push(...errosParse);

  sistema.escreverSaida(formatarValidacao(resultadoValidacao) + "\n");
  sistema.encerrar(resultadoValidacao.erros.length > 0 ? 1 : 0);
}

/**
 * Executa a CLI com o sistema fornecido pelo ambiente.
 *
 * Esta função é pura em relação ao ambiente: não depende de APIs específicas
 * do Node.js, browser, ou qualquer outra plataforma. Toda interação com o
 * sistema é feita exclusivamente através da interface {@link SistemaCLI}.
 *
 * @param sistema            Implementação das operações de sistema do ambiente.
 * @param esquemasAdicionais Mapa opcional de esquemas para complementar os
 *                           esquemas embutidos da biblioteca.
 */
export async function executarCLI(
  sistema: SistemaCLIInterface,
  esquemasAdicionais?: Map<string, DefinicaoPropriedadeInterface[]>,
): Promise<void> {
  const opcoes = compreenderArgumentos(sistema.argumentos);

  if (opcoes.erro) {
    sistema.escreverErro(opcoes.erro + "\n");
    sistema.escreverSaida('\nExecute "delprops --ajuda" para obter ajuda.\n');
    sistema.encerrar(1);
    return;
  }

  switch (opcoes.comando) {
    case "ajuda":
      await comandoAjuda(sistema);
      break;

    case "versao":
      await comandoVersao(sistema);
      break;

    case "esquemas":
      await comandoEsquemas(sistema, esquemasAdicionais);
      break;

    case "info":
      await comandoInfo(sistema, opcoes.nomePropriedade!, esquemasAdicionais);
      break;

    case "compreender":
      await comandoCompreender(sistema, opcoes.caminhoArquivo!);
      break;

    case "validar":
      await comandoValidar(
        sistema,
        opcoes.caminhoArquivo!,
        opcoes.caminhoEsquemas,
        esquemasAdicionais,
      );
      break;

    default:
      sistema.escreverErro(`Comando não implementado: '${opcoes.comando}'.\n`);
      sistema.encerrar(1);
  }
}
