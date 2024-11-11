# Simpli Track
Full stack application built using Express, MongoDb, Graphql, and Angular to help track user's bills

## Running the application
  Ensure you have MongoDB/Compass installed
1. Create `.env` files where `.env-example` exists.
2. Run `npm install` in root. This installs the server and client dependencies.
3. Run `npm run build` in root. This build the server and client.
4. Run `npm run dev` in root. This uses nodemon to watch the dist/server.js and client build files.

## Adding new Graphql schema and resolvers
1. Run `npm run server:codegen` in root. This will update the generated `graphql.ts`
2. These types should be used within your resolvers. Please refer to `resolvers/auth.ts` for example.
