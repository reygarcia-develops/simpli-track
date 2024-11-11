import gql from "graphql-tag";

const authSchema = gql`
  "A type that describes the User returned in the Auth response"
  type UserResponse {
    id: ID!
    username: String
    email: String
  }

  "Returns the JWT token and the User type"
  type AuthResponse {
    token: ID!
    user: UserResponse
  }

  "A input for required info for logging in a user"
  input LoginUser {
    email: String!
    password: String!
  }

  "A input for registering a new user to the Simpli Track"
  input RegisterUser {
    username: String!
    email: String!
    password: String!
  }

  type Query {
    hello(name: String!): String
  }

  type Mutation {
    "Logs in the user via their email and password. Returns an Auth"
    loginUser(input: LoginUser!): AuthResponse
    
    "Registers a user. Returns an Auth"
    registerUser(input: RegisterUser!): AuthResponse
  }
`;

export default authSchema;
