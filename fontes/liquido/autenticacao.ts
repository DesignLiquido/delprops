import { DefinicaoPropriedade } from '../interfaces';

const autenticacao: DefinicaoPropriedade[] = [
    {
        nome: 'tecnologia',
        tipo: 'texto',
        detalhe: 'Tecnologia de autenticação.',
        valoresPermitidos: ['jwt'],
    },
];

export default autenticacao;
