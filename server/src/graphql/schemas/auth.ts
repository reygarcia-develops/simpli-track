import gql from "graphql-tag";

const authSchema = gql`
  """
  Represents the user information that is returned as part of the authentication response.
  This type is used in the AuthResponse to provide details about the logged-in or newly registered user.
  """
  type UserResponse {
    "Unique identifier for the user (ID)"
    id: ID!
    
    "Username chosen by the user. This is a unique identifier within the system."
    username: String
    
    "Email address associated with the user's account. Used for login and communication."
    email: String
  }

  """
  Represents the authentication response returned after a successful login or user registration.
  It contains the authentication token and the user details.
  """
  type AuthResponse {
    "The authentication token that can be used for subsequent requests to access protected resources."
    token: ID!
    
    "The user object returned after login or registration, containing essential user details."
    user: UserResponse
  }

  """
  Input type for logging in a user.
  This type requires the email and password of the user in order to authenticate them.
  """
  input LoginUser {
    "The email address associated with the user's account. Used for login."
    email: String!
    
    "The password associated with the user's account. Used for authentication."
    password: String!
  }

  """
  Input type for registering a new user.
  This type contains the necessary information (username, email, password) to create a new user account.
  """
  input RegisterUser {
    "A unique username chosen by the user for their account."
    username: String!
    
    "The email address the user wants to associate with their account. This will be used for login and notifications."
    email: String!
    
    "The password that will be associated with the user's account. Should meet security requirements."
    password: String!
  }

  type Query {
    """
    A simple query that returns a greeting message for the provided name.
    Useful for testing the GraphQL API.
    """
    hello(name: String!): String
  }

  type Mutation {
    """
    Logs in the user using their email and password. 
    Returns an AuthResponse containing the authentication token and user details.
    """
    loginUser(input: LoginUser!): AuthResponse
    
    """
    Registers a new user by providing their username, email, and password.
    Returns an AuthResponse containing the authentication token and the newly created user details.
    """
    registerUser(input: RegisterUser!): AuthResponse
  }
`;

export default authSchema;
