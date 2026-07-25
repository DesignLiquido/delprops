import { DefinicaoPropriedadeInterface } from "./definicao-propriedade-interface";

export interface ContribuicaoEsquema {
  pacote: string;
  definicoes: DefinicaoPropriedadeInterface[];
}
