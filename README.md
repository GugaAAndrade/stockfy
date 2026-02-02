# StockFy

Sistema de Gestão de Estoque (SaaS) com Next.js, Tailwind e Prisma.

## Requisitos

- Node.js 18+
- Docker (para PostgreSQL local)

## Setup

```bash
npm install
```

Suba o PostgreSQL via Docker:

```bash
docker compose up -d
```

Rode as migrations:

```bash
npx prisma migrate dev --name init
```

Se o schema mudar, rode uma nova migration:

```bash
npx prisma migrate dev --name update
```

Inicie o servidor:

```bash
npm run dev
```

## Estrutura

- `src/app/(dashboard)` UI principal
- `src/app/api` rotas REST internas
- `src/components` componentes de layout e dashboard
- `src/lib/db` camada de acesso a dados (Prisma)
- `src/lib/services` regras de negócio
- `src/lib/validators` validação Zod
- `prisma/` schema e migrations

## Observações

- O tema claro/escuro é persistido em `localStorage`.
- A modelagem está pronta para evoluir; alguns campos estão neutros por falta de definição do domínio.
