# delprops

Especificação e biblioteca de análise do formato de arquivo `.delprops` — arquivo de propriedades/configuração do ecossistema [Delégua](https://github.com/DesignLiquido/delegua).

## Estrutura do projeto

Cada namespace de propriedades é representado como um arquivo `.ts` dentro de uma pasta com o nome do namespace raiz:

```
fontes/
├── tipos.ts              ← tipos compartilhados (TipoValor, DefinicaoPropriedade)
├── liquido/
│   ├── roteador.ts       ← propriedades de liquido.roteador.*
│   ├── dados.ts          ← propriedades de liquido.dados.<nome>.*
│   ├── autenticacao.ts   ← propriedades de liquido.autenticacao.*
│   └── index.ts
└── index.ts
```

Cada arquivo exporta um array de `DefinicaoPropriedade`:

```typescript
import { DefinicaoPropriedade } from '../tipos';

const roteador: DefinicaoPropriedade[] = [
    { nome: 'cors', tipo: 'logico', detalhe: 'Habilita CORS.' },
    // ...
];

export default roteador;
```

O tipo `DefinicaoPropriedade` é:

```typescript
export type TipoValor = 'logico' | 'texto' | 'numero';

export interface DefinicaoPropriedade {
    nome: string;
    tipo: TipoValor;
    detalhe: string;
    valoresPermitidos?: string[]; // apenas para propriedades enumeradas
}
```

A raiz da biblioteca exporta tudo de forma agrupada por namespace:

```typescript
import { liquido } from '@designliquido/delprops';

// liquido.roteador → DefinicaoPropriedade[]
// liquido.dados    → DefinicaoPropriedade[] (fallback genérico)
// liquido.autenticacao → DefinicaoPropriedade[]
```

---

## Esquemas contribuídos por pacotes externos

Pacotes do ecossistema Delégua podem contribuir com seus próprios esquemas de propriedades para um namespace. O mecanismo tem duas partes:

### 1. Declaração no `package.json` do pacote contribuidor

Adicione uma chave `"delprops"` ao `package.json` do pacote:

```json
"delprops": {
    "namespace": "liquido.dados",
    "schema": "./delprops/dados"
}
```

- `namespace`: o caminho de namespace que este pacote estende.
- `schema`: caminho relativo à raiz do pacote para o arquivo de schema (sem extensão `.js`/`.ts`).

### 2. O arquivo de schema

Crie o arquivo apontado por `schema`. Ele deve exportar `default` um array de `DefinicaoPropriedade`:

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

Use `descobrir()` para escanear um diretório `node_modules` e registrar automaticamente todos os pacotes que declaram `"delprops"`:

```typescript
import path from 'path';
import { descobrir } from '@designliquido/delprops';

descobrir(path.join(__dirname, 'node_modules'));
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

## Namespace `liquido`

O namespace `liquido` é reservado para a configuração do framework web [Líquido](https://github.com/DesignLiquido/liquido).

### `liquido.roteador`

Controla o comportamento do roteador HTTP.

| Propriedade         | Tipo    | Descrição                                              |
|---------------------|---------|--------------------------------------------------------|
| `diretorioEstatico` | texto   | Caminho do diretório de arquivos estáticos.            |
| `cors`              | lógico  | Habilita CORS.                                         |
| `bodyParser`        | lógico  | Habilita o body-parser.                                |
| `morgan`            | lógico  | Habilita o log de requisições com morgan.              |
| `cookieParser`      | lógico  | Habilita o cookie-parser.                              |
| `passport`          | lógico  | Habilita o passport para autenticação.                 |
| `json`              | lógico  | Habilita o suporte a JSON no body.                     |
| `helmet`            | lógico  | Habilita o helmet para segurança de cabeçalhos HTTP.   |
| `porta`             | número  | Porta em que o servidor escutará.                      |

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

## Exemplo completo

```
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

// Configuração de bases de dados
liquido.dados.lincones.tecnologia = 'sqlite'
liquido.dados.lincones.caminho = ':memory:'

// Configuração de autenticação
liquido.autenticacao.tecnologia = 'jwt'
```

> **Nota:** Os schemas autoritativos de `liquido.roteador` e `liquido.autenticacao` são definidos pelo próprio pacote `liquido` em sua pasta `delprops/`. Os schemas embutidos neste pacote servem como fallback para quando `liquido` não estiver instalado.

---

## Regras de validação

1. Linhas em branco e comentários (`//`) são ignorados.
2. Toda linha não vazia deve seguir o formato `<chave> = <valor>`. Linhas sem `=` são inválidas.
3. Chave e valor não podem estar vazios.
4. Para propriedades do namespace `liquido`, o caminho completo deve ser conhecido — propriedades desconhecidas geram aviso.
5. O tipo do valor deve corresponder ao tipo esperado pela propriedade — divergências geram erro.
6. Propriedades com valores enumerados (como `tecnologia`) só aceitam os valores listados na tabela.
7. Namespaces fora do conjunto conhecido (ex: `liquido`) são permitidos sem validação de esquema, para uso por outros projetos do ecossistema.
