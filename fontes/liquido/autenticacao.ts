import { DefinicaoPropriedadeInterface } from "../interfaces";

const autenticacao: DefinicaoPropriedadeInterface[] = [
  {
    nome: "tecnologia",
    tipo: "texto",
    detalhe: "Tecnologia de autenticação.",
    valoresPermitidos: ["jwt"],
  },
];

export default autenticacao;
