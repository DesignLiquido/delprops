import { TipoValor } from "../tipos";

export interface DefinicaoPropriedade {
    nome: string;
    tipo: TipoValor;
    detalhe: string;
    padrao?: string;
    valoresPermitidos?: string[];
}
