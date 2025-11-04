# Migrations do Banco de Dados

Este diretório contém as migrations do Drizzle ORM para o PostgreSQL.

## Como Gerar Migrations

```bash
# Gerar migration a partir do schema
pnpm drizzle-kit generate:pg

# Ou usar o comando npm
npm run db:generate
```

## Como Aplicar Migrations

```bash
# Aplicar migrations pendentes
DATABASE_URL="<seu_database_url>" pnpm tsx scripts/migrate.ts

# Ou usar o comando npm
npm run db:migrate
```

## Como Fazer Push Direto (Desenvolvimento)

Para desenvolvimento local, você pode fazer push direto do schema sem gerar migrations:

```bash
# Push do schema diretamente para o banco
DATABASE_URL="<seu_database_url>" pnpm drizzle-kit push:pg
```

⚠️ **Atenção:** O comando `push` não cria migrations e pode causar perda de dados. Use apenas em desenvolvimento!

## Estrutura

- Cada migration é composta por um arquivo SQL
- As migrations são aplicadas em ordem cronológica
- O Drizzle mantém um registro das migrations aplicadas na tabela `__drizzle_migrations`

## Comandos Úteis

```bash
# Ver status das migrations
pnpm drizzle-kit check

# Gerar migration com nome customizado
pnpm drizzle-kit generate:pg --name add_new_table

# Ver SQL que será executado
pnpm drizzle-kit up
```
