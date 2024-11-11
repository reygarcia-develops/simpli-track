import { ApolloServer } from '@apollo/server';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { authenticateToken } from './middleware/auth.js';
import { expressMiddleware } from '@apollo/server/express4';
import { resolvers } from './graphql/resolvers/resolvers.js';
import { typeDefs } from './graphql/schemas/schema.js';
import cors from 'cors';
import db from './database/connection.js';
import dotenv from 'dotenv';
import express from 'express';
import http from 'http';

dotenv.config(); // Load environment variables

const app = express();
const httpServer = http.createServer(app);

const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});

const startApolloServer = async () => {
  await server.start();
  await db();

  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());
  app.use(cors());

  app.use(
    '/graphql', 
    expressMiddleware(server, {
      context: authenticateToken,
    }
  ));

  // if we're in production, serve client/build as static assets
  // if (process.env.NODE_ENV === 'production') {
  //   const __filename = fileURLToPath(import.meta.url);
  //   const __dirname = path.dirname(__filename);
  //   console.log( 'Setting static client files' );
  //   app.use(express.static(path.join(__dirname, '../../client/dist')));
  // }

  const PORT = process.env.PORT || 3001;
  
  httpServer.listen(PORT, () => {
    console.log(`API server running on port ${PORT}!`);
    console.log(`Use GraphQL at http://localhost:${PORT}/graphql`);
  });
};

(async () => {
  await startApolloServer();
})();