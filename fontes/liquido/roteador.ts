import { DefinicaoPropriedade } from '../tipos';

const roteador: DefinicaoPropriedade[] = [
    {
        nome: 'diretorioEstatico',
        tipo: 'texto',
        detalhe: 'Caminho do diretório de arquivos estáticos.',
    },
    {
        nome: 'cors',
        tipo: 'logico',
        detalhe: 'Habilita CORS.',
    },
    {
        nome: 'bodyParser',
        tipo: 'logico',
        detalhe: 'Habilita o body-parser.',
    },
    {
        nome: 'morgan',
        tipo: 'logico',
        detalhe: 'Habilita o log de requisições com morgan.',
    },
    {
        nome: 'cookieParser',
        tipo: 'logico',
        detalhe: 'Habilita o cookie-parser.',
    },
    {
        nome: 'passport',
        tipo: 'logico',
        detalhe: 'Habilita o passport para autenticação.',
    },
    {
        nome: 'json',
        tipo: 'logico',
        detalhe: 'Habilita o suporte a JSON no body.',
    },
    {
        nome: 'helmet',
        tipo: 'logico',
        detalhe: 'Habilita o helmet para segurança de cabeçalhos HTTP.',
    },
];

export default roteador;
