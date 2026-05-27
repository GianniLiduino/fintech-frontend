# Fintech Frontend

Este é o frontend da aplicação **Fintech**, uma plataforma completa de gestão de finanças pessoais. O projeto foi desenvolvido com **React**, **TypeScript** e **Vite**, utilizando **React Bootstrap** para a interface do usuário.

## 🚀 Funcionalidades

A aplicação permite a gestão integral da vida financeira do usuário, organizada nos seguintes módulos:

- **Autenticação**: Sistema de login e registro seguro com persistência de token.
- **Dashboard (Home)**: Visão geral dos saldos e movimentações recentes.
- **Contas**: Gerenciamento de múltiplas contas bancárias e saldos.
- **Categorias**: Organização de fluxos de caixa (Receitas e Despesas).
- **Transações**: Histórico detalhado de movimentações com filtros.
- **Investimentos**: Gestão de ativos (CDB, Ações, Criptomoedas, etc.).
- **Metas (Goals)**: Planejamento financeiro com acompanhamento de progresso e depósitos integrados.

## 🛠️ Tecnologias Utilizadas

- **React 19**
- **TypeScript**
- **Vite**
- **React Router 7**
- **React Bootstrap** (Styling)
- **Bootstrap Icons**

## 🏁 Como Iniciar o Projeto

Siga os passos abaixo para rodar o projeto em sua máquina local:

### 1. Pré-requisitos

Instalar o **Node.js** (versão LTS recomendada) em seu sistema.

### 2. Instalação das Dependências

Clone o repositório e, dentro da pasta do projeto, execute:

```bash
npm install
```

### 3. Configuração de Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto (ou edite o existente) e configure a URL da API:

```env
VITE_API_URL=http://localhost:8080/api
```

### 4. Executando o Servidor de Desenvolvimento

Para iniciar a aplicação em modo de desenvolvimento com Hot Module Replacement (HMR):

```bash
npm run dev
```

O projeto estará disponível por padrão em `http://localhost:5173`.

### 5. Build para Produção

Para gerar a versão otimizada do projeto para deploy:

```bash
npm run build
```

Os arquivos finais serão gerados na pasta `dist/`.

## 📁 Estrutura do Projeto

- `src/components`: Componentes reutilizáveis da interface (Header, ProtectedRoute, etc.).
- `src/pages`: Páginas da aplicação (Home, Login, Accounts, etc.).
- `src/assets`: Recursos estáticos como imagens e ícones.
- `api/`: Documentação e coleções de referência da API.

---

Desenvolvido como parte do projeto de conclusão de fase para a disciplina de Desenvolvimento Frontend.
