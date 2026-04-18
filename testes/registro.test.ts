import { registrar, obter, temRegistro, obterTodos } from '../fontes/registro';
import { DefinicaoPropriedade } from '../fontes/interfaces';

describe('Módulo Registro', () => {
  beforeEach(() => {
    // Limpar todos os registros antes de cada teste
    const todos = obterTodos();
    todos.clear();
  });

  describe('registrar', () => {
    it('deve registrar uma nova propriedade para um namespace', () => {
      const definicoes: DefinicaoPropriedade[] = [
        {
          nome: 'cor',
          tipo: 'texto',
          detalhe: 'Cor do elemento'
        }
      ];

      registrar('liquido.dados', '@designliquido/teste', definicoes);

      expect(temRegistro('liquido.dados')).toBe(true);
    });

    it('deve registrar múltiplas propriedades', () => {
      const definicoes: DefinicaoPropriedade[] = [
        {
          nome: 'cor',
          tipo: 'texto',
          detalhe: 'Cor do elemento'
        },
        {
          nome: 'tamanho',
          tipo: 'numero',
          detalhe: 'Tamanho em pixels'
        }
      ];

      registrar('liquido.dados', '@designliquido/teste', definicoes);

      const resultado = obter('liquido.dados');
      expect(resultado).toHaveLength(2);
    });

    it('deve permitir múltiplas contribuições para o mesmo namespace', () => {
      const definicoes1: DefinicaoPropriedade[] = [
        {
          nome: 'cor',
          tipo: 'texto',
          detalhe: 'Cor do elemento'
        }
      ];

      const definicoes2: DefinicaoPropriedade[] = [
        {
          nome: 'visivel',
          tipo: 'logico',
          detalhe: 'Elemento visível'
        }
      ];

      registrar('liquido.dados', '@designliquido/teste1', definicoes1);
      registrar('liquido.dados', '@designliquido/teste2', definicoes2);

      const resultado = obter('liquido.dados');
      expect(resultado).toHaveLength(2);
      expect(resultado[0].nome).toBe('cor');
      expect(resultado[1].nome).toBe('visivel');
    });
  });

  describe('obter', () => {
    it('deve retornar propriedades de um namespace registrado', () => {
      const definicoes: DefinicaoPropriedade[] = [
        {
          nome: 'cor',
          tipo: 'texto',
          detalhe: 'Cor do elemento'
        }
      ];

      registrar('liquido.dados', '@designliquido/teste', definicoes);

      const resultado = obter('liquido.dados');
      expect(resultado).toHaveLength(1);
      expect(resultado[0].nome).toBe('cor');
    });

    it('deve retornar array vazio para namespace não registrado', () => {
      const resultado = obter('namespace.inexistente');
      expect(resultado).toEqual([]);
    });

    it('deve consolidar propriedades de múltiplos pacotes', () => {
      const def1: DefinicaoPropriedade[] = [
        { nome: 'prop1', tipo: 'texto', detalhe: 'Propriedade 1' }
      ];
      const def2: DefinicaoPropriedade[] = [
        { nome: 'prop2', tipo: 'numero', detalhe: 'Propriedade 2' }
      ];

      registrar('teste', 'pacote1', def1);
      registrar('teste', 'pacote2', def2);

      const resultado = obter('teste');
      expect(resultado).toHaveLength(2);
    });
  });

  describe('temRegistro', () => {
    it('deve retornar verdadeiro para namespace com registro', () => {
      const definicoes: DefinicaoPropriedade[] = [
        {
          nome: 'cor',
          tipo: 'texto',
          detalhe: 'Cor do elemento'
        }
      ];

      registrar('liquido.dados', '@designliquido/teste', definicoes);

      expect(temRegistro('liquido.dados')).toBe(true);
    });

    it('deve retornar falso para namespace sem registro', () => {
      expect(temRegistro('namespace.inexistente')).toBe(false);
    });
  });

  describe('obterTodos', () => {
    it('deve retornar mapa vazio quando não há registros', () => {
      const resultado = obterTodos();
      expect(resultado.size).toBe(0);
    });

    it('deve retornar todos os registros agrupados por namespace', () => {
      const def1: DefinicaoPropriedade[] = [
        { nome: 'cor', tipo: 'texto', detalhe: 'Cor' }
      ];
      const def2: DefinicaoPropriedade[] = [
        { nome: 'visivel', tipo: 'logico', detalhe: 'Visibilidade' }
      ];

      registrar('namespace1', 'pacote1', def1);
      registrar('namespace2', 'pacote2', def2);

      const resultado = obterTodos();
      expect(resultado.size).toBe(2);
      expect(resultado.has('namespace1')).toBe(true);
      expect(resultado.has('namespace2')).toBe(true);
    });
  });
});
