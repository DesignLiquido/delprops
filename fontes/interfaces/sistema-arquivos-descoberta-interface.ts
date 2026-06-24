export interface EntradaDiretorio {
    nome: string;
    ehDiretorio: boolean;
}

export interface SistemaArquivosDescoberta {
    separadorCaminho: string;
    existe(caminho: string): Promise<boolean>;
    listarDiretorio(caminho: string): Promise<EntradaDiretorio[]>;
    lerTexto(caminho: string): Promise<string>;
    juntarCaminhos(...partes: string[]): string;
    resolverCaminho(...partes: string[]): string;
    carregarModulo(caminho: string): Promise<Record<string, unknown>>;
}
