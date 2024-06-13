import Koa from "koa";
import Router from "koa-router";
import bodyParser from "koa-bodyparser";
import jwt from "jsonwebtoken";
import { ApolloServer, gql } from "apollo-server-koa";
import cors from "kcors";

const app = new Koa();
const router = new Router();

const SECRET_KEY = "123";

// Simulando uma base de dados de usuários
const users = [
  { id: 1, username: "1234", password: "1234" },
  { id: 2, username: "123", password: "123" },
];

// Middleware para autenticação JWT
const authenticateJWT = async (ctx, next) => {
  const authHeader = ctx.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1]; // Pega o token após "Bearer"
    try {
      const decoded = jwt.verify(token, SECRET_KEY);
      ctx.state.user = decoded;
      await next();
    } catch (err) {
      ctx.status = 401;
      ctx.body = { error: "Token inválido" };
    }
  } else {
    ctx.status = 401;
    ctx.body = { error: "Token necessário" };
  }
};

// Rota para autenticação e obtenção de token JWT
router.post("/login", async (ctx) => {
  const { username, password } = ctx.request.body;
  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  if (user) {
    const token = jwt.sign(
      { id: user.id, username: user.username },
      SECRET_KEY
    );
    ctx.body = { token };
  } else {
    ctx.status = 401;
    ctx.body = { error: "Credenciais inválidas" };
  }
});

// Rota protegida
router.get("/protegido", authenticateJWT, async (ctx) => {
  ctx.body = { message: "Rota protegida alcançada!" };
});

// Tipo de Schema do GraphQL
const typeDefs = gql`
  type Query {
    hello: String
  }
`;

// Resolvers do GraphQL
const resolvers = {
  Query: {
    hello: () => "Olá, mundo!",
  },
};

// Criação do servidor Apollo
const server = new ApolloServer({ typeDefs, resolvers });

async function startServer() {
  await server.start();

  // Usando o middleware Apollo com Koa
  app.use(bodyParser());
  app.use(router.routes());
  app.use(router.allowedMethods());
  app.use(cors());

  app.use(server.getMiddleware());

  // Iniciando o servidor
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
  });
}

startServer();
