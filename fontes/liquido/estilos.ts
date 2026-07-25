import { DefinicaoPropriedadeInterface } from "../interfaces";

const estilos: DefinicaoPropriedadeInterface[] = [
  {
    nome: "diretorioBase",
    tipo: "texto",
    detalhe:
      "Caminho do diretório onde o CSS gerado a partir de FolEs é salvo e servido.",
    padrao: "'publico/css'",
  },
];

export default estilos;
