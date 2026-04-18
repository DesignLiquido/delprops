import { DefinicaoPropriedade } from "./definicao-propriedade-interface";

export interface ContribuicaoEsquema {
    pacote: string;
    definicoes: DefinicaoPropriedade[];
}
