# Fullstack Reddit Clone: Next.js 14, Next-Auth, TypeScript, PostgreSQL, TanStack Query, Prisma, Tailwind, Redis, Uploadthing

![Captura de pantalla 2024-03-16 223846](https://github.com/psuarezdev/reddit-clone/assets/104940521/a7dff599-84e8-4904-8358-37c83537a412)

## Prerequisites

**Node version 18.x.x**

## Setting up the project

### Cloning the repository

```shell
git clone https://github.com/psuarezdev/reddit-clone.git
```

### Install packages

```shell
npm i -E
```

### Setup .env file

```js
# See the documentation for all the connection string options: https://pris.ly/d/connection-strings
DATABASE_URL=
NEXTAUTH_SECRET=

GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

UPLOADTHING_SECRET=
UPLOADTHING_APP_ID=

REDIS_URL=
REDIS_SECRET=
```

### Setup Prisma

```shell
npx prisma migrate dev --name init
```

### Start the app

```shell
npm run dev
```
