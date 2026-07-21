# delprops

<p align="center">
  <img src="./recursos/delprops-logo.png" alt="delegua" width="auto" height="130px">
</p>

Especificação e biblioteca de análise do formato de arquivo `.delprops` — arquivo de propriedades/configuração do ecossistema [Delégua](https://github.com/DesignLiquido/delegua).

## Estrutura do projeto

Cada namespace de propriedades é representado como um arquivo `.ts` dentro de uma pasta com o nome do namespace raiz:

```
fontes/
├── tipos.ts                    ← TipoValor
├── interfaces/                 ← DefinicaoPropriedade e demais contratos
├── registro.ts                 ← registrar() / obter() / temRegistro()
├── descobridor.ts              ← descobrir() (descoberta automática em node_modules)
├── sistema-arquivos-node.ts    ← implementação Node de SistemaArquivosDescoberta
├── analisador.ts                ← analisar() (parser do arquivo .delprops)
├── validador.ts                 ← validar() (validação contra os esquemas)
├── liquido/
│   ├── arquetipo.ts      ← propriedades de liquido.arquetipo
│   ├── linguagem.ts      ← propriedades de liquido.linguagem
│   ├── aplicacao.ts      ← propriedades de liquido.aplicacao.*
│   ├── roteador.ts       ← propriedades de liquido.roteador.*
│   ├── dados.ts          ← propriedades de liquido.dados.<nome>.*
│   ├── autenticacao.ts   ← propriedades de liquido.autenticacao.*
│   ├── estilos.ts        ← propriedades de liquido.estilos.*
│   └── index.ts
└── index.ts
```

Cada arquivo exporta um array de `DefinicaoPropriedade`:

```typescript
import { DefinicaoPropriedade } from '../interfaces';

const roteador: DefinicaoPropriedade[] = [
    { nome: 'cors', tipo: 'logico', detalhe: 'Habilita CORS.', padrao: 'falso' },
    // ...
];

export default roteador;
```

O tipo `DefinicaoPropriedade` é:

```typescript
// fontes/tipos.ts
export type TipoValor = 'logico' | 'texto' | 'numero';

// fontes/interfaces/definicao-propriedade-interface.ts
export interface DefinicaoPropriedade {
    nome: string;
    tipo: TipoValor;
    detalhe: string;
    padrao?: string;              // valor padrão, na mesma sintaxe do .delprops
    valoresPermitidos?: string[]; // apenas para propriedades enumeradas
}
```

A raiz da biblioteca exporta tudo de forma agrupada por namespace:

```typescript
import { liquido } from '@designliquido/delprops';

// liquido.arquetipo     → DefinicaoPropriedade[]
// liquido.linguagem     → DefinicaoPropriedade[]
// liquido.aplicacao     → DefinicaoPropriedade[]
// liquido.roteador      → DefinicaoPropriedade[]
// liquido.dados         → DefinicaoPropriedade[] (fallback genérico)
// liquido.autenticacao  → DefinicaoPropriedade[]
// liquido.estilos       → DefinicaoPropriedade[]
```

---

## Esquemas contribuídos por pacotes externos

Pacotes do ecossistema Delégua podem contribuir com seus próprios esquemas de propriedades para um namespace. O mecanismo tem duas partes:

### 1. Declaração no `package.json` do pacote contribuidor

Adicione uma chave `"delprops"` ao `package.json` do pacote:

```json
"delprops": {
    "espacoNomes": "liquido.dados",
    "esquema": "./delprops/dados"
}
```

- `espacoNomes`: o caminho do espaço de nomes que este pacote estende.
- `esquema`: caminho relativo à raiz do pacote para o arquivo de esquema (sem extensão `.js`/`.ts`).

### 2. O arquivo de esquema

Crie o arquivo apontado por `esquema`. Ele deve exportar `default` um array de `DefinicaoPropriedade`:

```typescript
// meu-pacote/delprops/dados.ts
import { DefinicaoPropriedade } from '@designliquido/delprops';

const dados: DefinicaoPropriedade[] = [
    {
        nome: 'tecnologia',
        tipo: 'texto',
        detalhe: 'Tecnologia de banco de dados.',
        valoresPermitidos: ['minha-tecnologia'],
    },
    // ...
];

export default dados;
```

### Descoberta automática

Use `descobrir()` para escanear um diretório `node_modules` e registrar automaticamente todos os pacotes que declaram `"delprops"`. É necessário fornecer uma implementação de `SistemaArquivosDescoberta` — a biblioteca já traz `sistemaArquivosNode` para uso em Node.js:

```typescript
import path from 'path';
import { descobrir, sistemaArquivosNode } from '@designliquido/delprops';

await descobrir(path.join(__dirname, 'node_modules'), sistemaArquivosNode);
```

### Registro manual

Use `registrar()` quando preferir controle explícito sobre o que é carregado:

```typescript
import { registrar } from '@designliquido/delprops';
import dadosSqlite from '@designliquido/lincones-sqlite/delprops/dados';

registrar('liquido.dados', '@designliquido/lincones-sqlite', dadosSqlite);
```

### Consulta

```typescript
import { obter, temRegistro } from '@designliquido/delprops';

if (temRegistro('liquido.dados')) {
    const propriedades = obter('liquido.dados');
    // → DefinicaoPropriedade[] de todos os pacotes registrados para este namespace
}
```

### Pacotes que implementam este contrato

| Pacote | Namespace(s) | Contribuição |
|--------|--------------|--------------|
| `liquido`                            | `liquido.roteador`, `liquido.autenticacao` | Schemas autoritativos do framework |
| `@designliquido/lincones-sqlite`     | `liquido.dados` | SQLite     |
| `@designliquido/lincones-postgresql` | `liquido.dados` | PostgreSQL |
| `@designliquido/lincones-mysql`      | `liquido.dados` | MySQL      |

## O formato `.delprops`

O `.delprops` é o formato padrão de configuração para projetos Delégua, inspirado no formato `.properties` do Java. Cada linha não vazia e não comentada define uma propriedade no formato:

```
<namespace>.<subnamespace>[.<subnamespace>...] = <valor>
```

### Comentários

Comentários de linha são iniciados com `//`:

```
// Isto é um comentário
liquido.roteador.cors = verdadeiro
```

### Tipos de valor

| Tipo    | Exemplos                          |
|---------|-----------------------------------|
| Lógico  | `verdadeiro`, `falso`             |
| Texto   | `'publico'`, `'sqlite'`, `':memory:'` |
| Número  | `3000`, `5432`                    |

---

## Analisando e validando arquivos `.delprops`

A biblioteca expõe duas funções puras para processar o conteúdo de um arquivo `.delprops`: `analisar()` (parser) e `validar()` (validador contra os esquemas).

### `analisar()`

Recebe o texto do arquivo e retorna as propriedades reconhecidas e eventuais erros de sintaxe (linha sem `=`, chave ou valor vazios):

```typescript
import { analisar } from '@designliquido/delprops';

const { propriedades, erros } = analisar(conteudoDoArquivo);
// propriedades: { chave, valor, linha }[]
// erros: { mensagem, linha }[]
```

### `validar()`

Recebe as propriedades já parseadas e um mapa de `namespace → DefinicaoPropriedade[]` (por exemplo, obtido via `obter()` ou montado manualmente), e retorna avisos (propriedade desconhecida) e erros (tipo ou valor incompatível):

```typescript
import { analisar, validar, liquido } from '@designliquido/delprops';

const esquemas = new Map([
    ['liquido.roteador', liquido.roteador],
    ['liquido.dados', liquido.dados],
    ['liquido.autenticacao', liquido.autenticacao],
]);

const { propriedades } = analisar(conteudoDoArquivo);
const { avisos, erros } = validar(propriedades, esquemas);
```

Namespaces fora do mapa `esquemas` são ignorados pela validação (permitindo uso por outros projetos do ecossistema). Dentro de um namespace conhecido, propriedades ausentes do esquema geram aviso; tipo ou valor incompatível geram erro.

---

## Namespace `liquido`

O namespace `liquido` é reservado para a configuração do framework web [Líquido](https://github.com/DesignLiquido/liquido).

### `liquido.arquetipo`

| Propriedade | Tipo  | Descrição                            | Valores permitidos |
|-------------|-------|----------------------------------------|----------------------|
| `arquetipo` | texto | Arquétipo do projeto Líquido.         | `rest`, `mvc`        |

### `liquido.linguagem`

| Propriedade | Tipo  | Descrição                                        | Valores permitidos    |
|-------------|-------|-----------------------------------------------------|--------------------------|
| `linguagem` | texto | Linguagem de programação de back-end do projeto.   | `delégua`, `pituguês` |

### `liquido.aplicacao`

| Propriedade    | Tipo  | Descrição                       |
|----------------|-------|-----------------------------------|
| `nome`         | texto | Nome da aplicação.               |
| `versao`       | texto | Versão da aplicação.             |
| `descricao`    | texto | Descrição da aplicação.          |
| `licenca.nome` | texto | Nome da licença da aplicação.    |
| `licenca.url`  | texto | URL da licença da aplicação.     |

### `liquido.roteador`

Controla o comportamento do roteador HTTP.

| Propriedade         | Tipo    | Descrição                                              | Padrão       |
|---------------------|---------|--------------------------------------------------------|--------------|
| `diretorioEstatico` | texto   | Caminho do diretório de arquivos estáticos.            | `'publico'`  |
| `cors`              | lógico  | Habilita CORS.                                         | `falso`      |
| `bodyParser`        | lógico  | Habilita o body-parser.                                | `verdadeiro` |
| `morgan`            | lógico  | Habilita o log de requisições com morgan.              | `falso`      |
| `cookieParser`      | lógico  | Habilita o cookie-parser.                              | `verdadeiro` |
| `passport`          | lógico  | Habilita o passport para autenticação.                 | `falso`      |
| `json`              | lógico  | Habilita o suporte a JSON no body.                     | `verdadeiro` |
| `helmet`            | lógico  | Habilita o helmet para segurança de cabeçalhos HTTP.   | `verdadeiro` |
| `porta`             | número  | Porta na qual o servidor irá subir.                    | `3000`       |

**Exemplo:**

```
liquido.roteador.diretorioEstatico = 'publico'
liquido.roteador.cors = verdadeiro
liquido.roteador.bodyParser = verdadeiro
liquido.roteador.morgan = verdadeiro
liquido.roteador.cookieParser = verdadeiro
liquido.roteador.passport = falso
liquido.roteador.json = verdadeiro
liquido.roteador.helmet = verdadeiro
liquido.roteador.porta = 3000
```

---

### `liquido.dados.<nome>`

Configura uma fonte de dados nomeada. `<nome>` é um identificador livre escolhido pelo projeto (ex: `lincones`, `principal`, `cache`).

| Propriedade  | Tipo    | Descrição                                                                     |
|--------------|---------|-------------------------------------------------------------------------------|
| `tecnologia` | texto   | Tecnologia de banco de dados. Valores permitidos: `sqlite`, `mysql`, `postgres`, `mongodb`, `mssql`. |
| `caminho`    | texto   | Caminho do arquivo de banco de dados (ex: `':memory:'` para SQLite em memória). |
| `host`       | texto   | Endereço do servidor de banco de dados.                                       |
| `porta`      | número  | Porta do servidor de banco de dados.                                          |
| `usuario`    | texto   | Nome de usuário para conexão.                                                 |
| `senha`      | texto   | Senha para conexão.                                                           |
| `banco`      | texto   | Nome do banco de dados.                                                       |
| `autoInicializar`      | lógico | Inicializa o banco automaticamente ao iniciar o servidor.           |
| `arquivoInicializacao` | texto  | Arquivo de inicialização do banco (padrão: `'inicializacao.lincones'`). |

**Exemplo:**

```
// Banco de dados em memória
liquido.dados.lincones.tecnologia = 'sqlite'
liquido.dados.lincones.caminho = ':memory:'

// Banco de dados PostgreSQL remoto
liquido.dados.principal.tecnologia = 'postgres'
liquido.dados.principal.host = 'localhost'
liquido.dados.principal.porta = 5432
liquido.dados.principal.usuario = 'admin'
liquido.dados.principal.senha = 'segredo'
liquido.dados.principal.banco = 'meu_banco'
```

---

### `liquido.autenticacao`

Configura o mecanismo de autenticação da aplicação.

| Propriedade  | Tipo   | Descrição                                                 |
|--------------|--------|-----------------------------------------------------------|
| `tecnologia` | texto  | Tecnologia de autenticação. Valores permitidos: `jwt`.    |

**Exemplo:**

```
liquido.autenticacao.tecnologia = 'jwt'
liquido.autenticacao.segredo = 'minha-chave-secreta'
liquido.autenticacao.expiracao = '7d'
```

---

### `liquido.estilos`

Configura a geração de CSS a partir de FolEs.

| Propriedade      | Tipo  | Descrição                                                              | Padrão            |
|-------------------|-------|--------------------------------------------------------------------------|--------------------|
| `diretorioBase`   | texto | Caminho do diretório onde o CSS gerado a partir de FolEs é salvo e servido. | `'publico/css'` |

**Exemplo:**

```
liquido.estilos.diretorioBase = 'publico/css'
```

---

## Exemplo completo

```
// Metadados do projeto
liquido.arquetipo = 'rest'
liquido.linguagem = 'delégua'
liquido.aplicacao.nome = 'meu-projeto'
liquido.aplicacao.versao = '1.0.0'

// Configuração de arquivos estáticos
liquido.roteador.diretorioEstatico = 'publico'

// Configuração do roteador
liquido.roteador.cors = verdadeiro
liquido.roteador.bodyParser = verdadeiro
liquido.roteador.morgan = verdadeiro
liquido.roteador.cookieParser = verdadeiro
liquido.roteador.passport = falso
liquido.roteador.json = verdadeiro
liquido.roteador.helmet = verdadeiro
liquido.roteador.porta = 3000

// Configuração de bases de dados
liquido.dados.lincones.tecnologia = 'sqlite'
liquido.dados.lincones.caminho = ':memory:'

// Configuração de autenticação
liquido.autenticacao.tecnologia = 'jwt'

// Configuração de estilos
liquido.estilos.diretorioBase = 'publico/css'
```

> **Nota:** Os schemas autoritativos de cada namespace `liquido.*` são definidos pelo próprio pacote `liquido` em sua pasta `delprops/`. Os schemas embutidos neste pacote servem como fallback para quando `liquido` não estiver instalado.

---

## Regras de validação

1. Linhas em branco e comentários (`//`) são ignorados pelo parser (`analisar()`).
2. Toda linha não vazia deve seguir o formato `<chave> = <valor>`. Linhas sem `=` são inválidas.
3. Chave e valor não podem estar vazios.
4. Para propriedades do namespace `liquido`, o caminho completo deve ser conhecido — propriedades desconhecidas geram aviso (`validar()`).
5. O tipo do valor deve corresponder ao tipo esperado pela propriedade — divergências geram erro.
6. Propriedades com valores enumerados (como `tecnologia`, `arquetipo`, `linguagem`) só aceitam os valores listados na tabela.
7. Namespaces fora do conjunto conhecido (ex: `liquido`) são permitidos sem validação de esquema, para uso por outros projetos do ecossistema.
