// backend/index.js
import express from "express";
import http from "http";
import cors from "cors";
import { ApolloServer } from "apollo-server-express";
import { typeDefs, resolvers } from "./schema.js";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { WebSocketServer } from "ws";
import { useServer } from 'graphql-ws/use/ws';

const PORT = 4000;


const app = express();
app.use(cors());


const schema = makeExecutableSchema({ typeDefs, resolvers });


const httpServer = http.createServer(app);


const wsServer = new WebSocketServer({
  server: httpServer,
  path: "/graphql",
});


useServer({ schema }, wsServer);


const server = new ApolloServer({
  schema,
});

await server.start();
server.applyMiddleware({ app, path: "/graphql" });


httpServer.listen(PORT, () => {
  console.log(`Server ready at http://localhost:${PORT}/graphql`);
});
