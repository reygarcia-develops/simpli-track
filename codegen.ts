
import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  schema: 'http://localhost:3001/graphql',
  generates: {
    "./server/src/generated/graphql.ts": {
      plugins: ["typescript", "typescript-resolvers"],
      overwrite: true,
      config: {
        useIndexSignature: true
      }
    },
    "./server/graphql.schema.json": {
      plugins: ["introspection"]
    },
    "./client/src/app/generated/graphql.ts": {
      plugins: ["typescript", "typescript-resolvers"],
      overwrite: true,
      config: {
        useIndexSignature: true
      }
    },
  }
};

export default config;
