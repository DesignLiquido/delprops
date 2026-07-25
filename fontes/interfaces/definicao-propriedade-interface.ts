import { TipoValor } from "../tipos";

export interface DefinicaoPropriedadeInterface {
  nome: string;
  tipo: TipoValor;
  detalhe: string;
  padrao?: string;
  valoresPermitidos?: string[];
}
