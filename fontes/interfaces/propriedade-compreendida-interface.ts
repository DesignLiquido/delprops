/**
 * Resultado do parse de uma linha do arquivo .delprops.
 */
export interface PropriedadeCompreendidaInterface {
    /** Chave completa, ex: "liquido.roteador.cors" */
    chave: string;
    /** Valor sem aspas, ex: "verdadeiro" */
    valor: string;
    /** Número da linha (base 1) */
    linha: number;
}
