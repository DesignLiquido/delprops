import { DefinicaoPropriedade } from '../tipos';

const autenticacao: DefinicaoPropriedade[] = [
    {
        nome: 'tecnologia',
        tipo: 'texto',
        detalhe: 'Tecnologia de autenticação.',
        valoresPermitidos: ['jwt'],
    },
];

export default autenticacao;
