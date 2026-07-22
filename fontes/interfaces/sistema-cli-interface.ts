/**
 * Abstração agnóstica para operações de sistema da CLI.
 *
 * O ambiente deve implementar esta interface e injetá-la 
 * na função {@link executarCLI}, mantendo a lógica do CLI
 * independente de APIs específicas de qualquer plataforma.
 */
export interface SistemaCLI {
    /** Argumentos da linha de comando (já sem o interpretador e caminho do script). */
    argumentos: string[];

    /** Lê o conteúdo textual de um arquivo. */
    lerArquivo(caminho: string): Promise<string>;

    /** Retorna o diretório de trabalho atual. */
    diretorioAtual(): string;

    /** Junta partes de caminho usando o separador do sistema. */
    juntarCaminhos(...partes: string[]): string;

    /** Resolve um ou mais segmentos de caminho para um caminho absoluto. */
    resolverCaminho(...partes: string[]): string;

    /** Escreve texto no fluxo de saída padrão. */
    escreverSaida(texto: string): void;

    /** Escreve texto no fluxo de erro padrão. */
    escreverErro(texto: string): void;

    /** Encerra o processo com o código de saída informado. */
    encerrar(codigo: number): void;

    /** Verifica se um caminho existe no sistema de arquivos. */
    existe(caminho: string): Promise<boolean>;
}
