import Koa from "koa";
import Router from "koa-router";
import bodyParser from "koa-bodyparser";
import jwt from "jsonwebtoken";
import { ApolloServer, gql } from "apollo-server-koa";
import cors from "@koa/cors";

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
  console.log('Authorization Header:', authHeader);
  if (authHeader) {
    const token = authHeader.split(" ")[1]; // Pega o token após "Bearer"
    console.log('Token:', token);
    try {
      const decoded = jwt.verify(token, SECRET_KEY);
      console.log('Decoded:', decoded);
      ctx.state.user = decoded;
      await next();
    } catch (err) {
      console.log("Token inválido:", err);
      ctx.status = 401;
      ctx.body = { error: "Token inválido" };
    }
  } else {
    console.log("Token necessário");
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
      SECRET_KEY,
      { expiresIn: '1h' } // Token expira em 1 hora
    );
    ctx.body = { token };
  } else {
    ctx.status = 401;
    ctx.body = { error: "Credenciais inválidas" };
  }
});

// Tipo de Schema do GraphQL
const typeDefs = gql`
  type Query {
    hello: String
    protected: String
  }
`;

// Resolvers do GraphQL
const resolvers = {
  Query: {
    hello: () => "Olá, mundo!",
    protected: (parent, args, context) => {
      if (!context.user) {
        throw new Error("Não autenticado");
      }
      return "Rota protegida alcançada!";
    }
  }
};

// Criação do servidor Apollo
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ ctx }) => {
    const token = ctx.headers.authorization || '';
    
    if (token) {
      try {
        const user = jwt.verify(token, SECRET_KEY);
        return { user };
      } catch (err) {
        console.log("Token inválido no contexto:", err);
      }
    } else {
      console.log("Token inválido ou ausente");
    }

    return {};
  }
});


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
