import {
  ResultadoCompreensaoInterface,
  PropriedadeCompreendidaInterface,
  ErroCompreensaoInterface,
} from "./interfaces";

/**
 * Analisa (parse) o conteúdo de um arquivo .delprops.
 *
 * Regras:
 * - Linhas em branco são ignoradas.
 * - Comentários começam com `//` e são ignorados.
 * - Toda linha não vazia deve seguir `<chave> = <valor>`.
 * - Chave e valor não podem estar vazios.
 *
 * @param conteudo O texto completo do arquivo .delprops.
 * @returns Um objeto com as propriedades parseadas e erros de sintaxe.
 */
export function analisar(conteudo: string): ResultadoCompreensaoInterface {
  const propriedades: PropriedadeCompreendidaInterface[] = [];
  const erros: ErroCompreensaoInterface[] = [];
  const linhas = conteudo.split("\n");
  const chavesVistas = new Map<string, number>();

  for (let i = 0; i < linhas.length; i++) {
    const numeroLinha = i + 1;
    const linhaBruta = linhas[i];
    const linha = linhaBruta.trim();

    // Ignorar linhas em branco
    if (linha === "") continue;

    // Ignorar comentários
    if (linha.startsWith("//")) continue;

    // Verificar presença do separador =
    const indiceIgual = linha.indexOf("=");
    if (indiceIgual === -1) {
      erros.push({
        mensagem: `Linha sem o separador '='.`,
        linha: numeroLinha,
      });
      continue;
    }

    const chave = linha.slice(0, indiceIgual).trim();
    const valor = linha.slice(indiceIgual + 1).trim();

    // Validar chave e valor não vazios
    if (chave === "") {
      erros.push({
        mensagem: `Chave vazia.`,
        linha: numeroLinha,
      });
      continue;
    }

    if (valor === "") {
      erros.push({
        mensagem: `Valor vazio para a chave '${chave}'.`,
        linha: numeroLinha,
      });
      continue;
    }

    // Verificar chave duplicada
    const linhaOriginal = chavesVistas.get(chave);
    if (linhaOriginal !== undefined) {
      erros.push({
        mensagem: `Chave duplicada '${chave}' (já definida na linha ${linhaOriginal}).`,
        linha: numeroLinha,
      });
      continue;
    }

    chavesVistas.set(chave, numeroLinha);
    propriedades.push({ chave, valor, linha: numeroLinha });
  }

  return { propriedades, erros };
}
