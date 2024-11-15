
import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  schema: 'http://localhost:3001/graphql',
  generates: {
    "./src/generated/graphql.ts": {
      plugins: ["typescript", "typescript-resolvers",],
      overwrite: true,
      config: {
        useIndexSignature: true
      }
    },
    "./graphql.schema.json": {
      plugins: ["introspection"]
    }
  }
};

export default config;
