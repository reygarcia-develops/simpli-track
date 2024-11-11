import { gql } from 'graphql-tag';
import authSchema from './auth.js';

export const typeDefs = gql`
  ${authSchema}
`;