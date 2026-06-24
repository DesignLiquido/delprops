import { DefinicaoPropriedade } from '../interfaces';

/**
 * Propriedades de uma fonte de dados nomeada (`liquido.dados.<nome>.*`).
 * O nome da fonte é dinâmico e definido pelo projeto.
 */
const dados: DefinicaoPropriedade[] = [
    {
        nome: 'tecnologia',
        tipo: 'texto',
        detalhe: 'Tecnologia de banco de dados.',
        valoresPermitidos: ['sqlite', 'mysql', 'postgres', 'mongodb', 'mssql'],
    },
    {
        nome: 'caminho',
        tipo: 'texto',
        detalhe: "Caminho do arquivo de banco de dados (ex: ':memory:' para SQLite em memória).",
    },
    {
        nome: 'host',
        tipo: 'texto',
        detalhe: 'Endereço do servidor de banco de dados.',
    },
    {
        nome: 'porta',
        tipo: 'numero',
        detalhe: 'Porta do servidor de banco de dados.',
    },
    {
        nome: 'usuario',
        tipo: 'texto',
        detalhe: 'Nome de usuário para conexão.',
    },
    {
        nome: 'senha',
        tipo: 'texto',
        detalhe: 'Senha para conexão.',
    },
    {
        nome: 'banco',
        tipo: 'texto',
        detalhe: 'Nome do banco de dados.',
    },
    {
        nome: 'autoInicializar',
        tipo: 'logico',
        detalhe: 'Inicializa o banco automaticamente ao iniciar o servidor.',
    },
    {
        nome: 'arquivoInicializacao',
        tipo: 'texto',
        detalhe: "Arquivo de inicialização do banco (padrão: 'inicializacao.lincones').",
    },
];

export default dados;
