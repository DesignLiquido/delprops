#!/usr/bin/env node
'use strict';

/**
 * Ponto de entrada da CLI delprops para Node.js.
 *
 * Este arquivo carrega a implementação compilada e executa a CLI.
 * Permanece em JavaScript para não depender de ts-node em produção.
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require('path');

let delprops;
try {
    // Tenta carregar do pacote instalado (dist/)
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    delprops = require(path.join(__dirname, '..', 'dist'));
} catch {
    // Fallback para desenvolvimento: carrega via ts-node
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const tsNode = require('ts-node');
    tsNode.register({ project: path.join(__dirname, '..', 'tsconfig.json') });
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    delprops = require(path.join(__dirname, '..', 'fontes', 'index'));
}

delprops.executarCLI(delprops.sistemaCLINode);
