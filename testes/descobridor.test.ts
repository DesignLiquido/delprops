import * as fs from 'fs';
import * as path from 'path';
import { descobrir } from '../fontes/descobridor';
import { obter, obterTodos } from '../fontes/registro';

// Mock do módulo fs
jest.mock('fs');

describe('Módulo Descobridor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Limpar registros
    const todos = obterTodos();
    todos.clear();
  });

  describe('descobrir', () => {
    it('deve retornar silenciosamente se o diretório não existe', () => {
      const mockFs = fs as jest.Mocked<typeof fs>;
      mockFs.existsSync.mockReturnValue(false);

      expect(() => descobrir('/caminho/inexistente')).not.toThrow();
      expect(mockFs.existsSync).toHaveBeenCalled();
    });

    it('deve ignorar entradas que não são diretórios', () => {
      const mockFs = fs as jest.Mocked<typeof fs>;
      mockFs.existsSync.mockReturnValue(true);

      const arquivo = {
        name: 'arquivo.txt',
        isDirectory: () => false
      };

      mockFs.readdirSync.mockReturnValue([arquivo] as any);

      descobrir('/caminho/node_modules');

      expect(mockFs.readdirSync).toHaveBeenCalledWith('/caminho/node_modules', {
        withFileTypes: true
      });
    });

    it('deve processar pacotes com escopo @designliquido', () => {
      const mockFs = fs as jest.Mocked<typeof fs>;
      mockFs.existsSync.mockReturnValue(true);

      const scopeDir = {
        name: '@designliquido',
        isDirectory: () => true
      };

      const packageDir = {
        name: 'meu-pacote',
        isDirectory: () => true
      };

      mockFs.readdirSync
        .mockReturnValueOnce([scopeDir] as any)
        .mockReturnValueOnce([packageDir] as any);

      descobrir('/caminho/node_modules');

      expect(mockFs.readdirSync).toHaveBeenCalledTimes(2);
    });

    it('deve ignorar outros escopos que não @designliquido', () => {
      const mockFs = fs as jest.Mocked<typeof fs>;
      mockFs.existsSync.mockReturnValue(true);

      const scopeDir = {
        name: '@outro-escopo',
        isDirectory: () => true
      };

      mockFs.readdirSync.mockReturnValueOnce([scopeDir] as any);

      descobrir('/caminho/node_modules');

      // Deve ser chamado apenas uma vez (entrada inicial)
      expect(mockFs.readdirSync).toHaveBeenCalledTimes(1);
    });

    it('deve processar pacote "liquido" sem escopo', () => {
      const mockFs = fs as jest.Mocked<typeof fs>;
      mockFs.existsSync.mockReturnValue(true);

      const liquidoDir = {
        name: 'liquido',
        isDirectory: () => true
      };

      mockFs.readdirSync.mockReturnValueOnce([liquidoDir] as any);

      descobrir('/caminho/node_modules');

      expect(mockFs.readdirSync).toHaveBeenCalled();
    });

    it('deve ignorar pacotes que não são "liquido" ou "@designliquido"', () => {
      const mockFs = fs as jest.Mocked<typeof fs>;
      mockFs.existsSync.mockReturnValue(true);

      const outroDir = {
        name: 'outro-pacote',
        isDirectory: () => true
      };

      mockFs.readdirSync.mockReturnValueOnce([outroDir] as any);

      descobrir('/caminho/node_modules');

      // Deve ser chamado apenas uma vez (entrada inicial)
      expect(mockFs.readdirSync).toHaveBeenCalledTimes(1);
    });
  });

  describe('Carregamento de manifesto', () => {
    it('deve ignorar pacote sem package.json', () => {
      const mockFs = fs as jest.Mocked<typeof fs>;
      
      // Mock de diretórios comuns
      mockFs.existsSync.mockImplementation((path: any) => {
        if (typeof path === 'string') {
          return !path.includes('package.json');
        }
        return true;
      });

      const packageDir = {
        name: 'meu-pacote',
        isDirectory: () => true
      };

      mockFs.readdirSync.mockReturnValueOnce([packageDir] as any);

      descobrir('/caminho/node_modules');

      // Não deve lançar erro ao processar diretório sem package.json
      expect(obter('qualquer.namespace')).toEqual([]);
    });

    it('deve ignorar manifesto inválido', () => {
      const mockFs = fs as jest.Mocked<typeof fs>;

      // Mocking para valid package.json
      mockFs.existsSync.mockReturnValue(true);

      const packageDir = {
        name: 'liquido',
        isDirectory: () => true
      };

      mockFs.readdirSync.mockReturnValueOnce([packageDir] as any);
      mockFs.readFileSync.mockReturnValue('{ json inválido }');

      descobrir('/caminho/node_modules');

      // Não deve lançar erro
      expect(obter('qualquer.namespace')).toEqual([]);
    });
  });
});
