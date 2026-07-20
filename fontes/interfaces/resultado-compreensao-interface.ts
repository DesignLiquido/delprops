import { PropriedadeCompreendidaInterface } from "./propriedade-compreendida-interface";
import { ErroCompreensaoInterface } from "./erro-compreensao-interface";

/**
 * Resultado completo do parse de um conteúdo .delprops.
 */
export interface ResultadoCompreensaoInterface {
    propriedades: PropriedadeCompreendidaInterface[];
    erros: ErroCompreensaoInterface[];
}
