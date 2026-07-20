/**
 * Erro de validação para tipos ou valores inválidos.
 */
export interface ErroValidacaoInterface {
    chave: string;
    linha: number;
    mensagem: string;
}
