export type TipoValor = 'logico' | 'texto' | 'numero';

export interface DefinicaoPropriedade {
    nome: string;
    tipo: TipoValor;
    detalhe: string;
    padrao?: string;
    valoresPermitidos?: string[];
}
