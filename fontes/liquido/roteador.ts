import { DefinicaoPropriedade } from '../interfaces';

const roteador: DefinicaoPropriedade[] = [
    {
        nome: 'diretorioEstatico',
        tipo: 'texto',
        detalhe: 'Caminho do diretório de arquivos estáticos.',
        padrao: "'publico'",
    },
    {
        nome: 'cors',
        tipo: 'logico',
        detalhe: 'Habilita CORS.',
        padrao: 'falso',
    },
    {
        nome: 'bodyParser',
        tipo: 'logico',
        detalhe: 'Habilita o body-parser.',
        padrao: 'verdadeiro',
    },
    {
        nome: 'morgan',
        tipo: 'logico',
        detalhe: 'Habilita o log de requisições com morgan.',
        padrao: 'falso',
    },
    {
        nome: 'cookieParser',
        tipo: 'logico',
        detalhe: 'Habilita o cookie-parser.',
        padrao: 'verdadeiro',
    },
    {
        nome: 'passport',
        tipo: 'logico',
        detalhe: 'Habilita o passport para autenticação.',
        padrao: 'falso',
    },
    {
        nome: 'json',
        tipo: 'logico',
        detalhe: 'Habilita o suporte a JSON no body.',
        padrao: 'verdadeiro',
    },
    {
        nome: 'helmet',
        tipo: 'logico',
        detalhe: 'Habilita o helmet para segurança de cabeçalhos HTTP.',
        padrao: 'verdadeiro',
    },
    {
        nome: 'porta',
        tipo: 'numero',
        detalhe: 'Porta na qual o servidor irá subir.',
        padrao: '3000',
    }
];

export default roteador;
