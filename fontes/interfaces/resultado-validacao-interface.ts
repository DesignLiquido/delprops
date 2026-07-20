import { AvisoValidacaoInterface, ErroValidacaoInterface } from "./";

/**
 * Resultado completo da validação.
 */
export interface ResultadoValidacaoInterface {
    avisos: AvisoValidacaoInterface[];
    erros: ErroValidacaoInterface[];
}
