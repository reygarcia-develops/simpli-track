import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { Apollo, gql, MutationResult } from 'apollo-angular';
import { Observable } from 'rxjs';

import {
  AuthResponse,
  MutationLoginUserArgs,
  MutationRegisterUserArgs,
} from '../generated/graphql';

type LoginResponse = {
  loginUser: AuthResponse;
};

type RegisterResponse = {
  registerUser: AuthResponse;
};

const LOGIN_MUTATION = gql<LoginResponse, MutationLoginUserArgs>`
  mutation Login($input: LoginUser!) {
    loginUser(input: $input) {
      token
      user {
        username
        email
      }
    }
  }
`;

const REGISTER_MUTATION = gql<Response, MutationRegisterUserArgs>`
  mutation Register($input: RegisterUser!) {
    registerUser(input: $input) {
      token
      user {
        username
        email
      }
    }
  }
`;

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apollo = inject(Apollo);
  private tokenKey: string = 'jwt';
  private isLoggedInSignal: WritableSignal<boolean> = signal(
    !this.isTokenExpired()
  );

  public readonly isLoggedIn = this.isLoggedInSignal.asReadonly();

  /**
   * Logs in a user by sending a GraphQL mutation with the provided email and password.
   * @param {string} email - The email of the user.
   * @param {string} password - The password of the user.
   * @returns {Observable<MutationResult<LoginResponse>>} - An observable emitting the result of the login mutation.
   */
  public login(
    email: string,
    password: string
  ): Observable<MutationResult<LoginResponse>> {
    const payload = { email, password };
    return this.apollo.mutate<LoginResponse>({
      mutation: LOGIN_MUTATION,
      variables: { input: payload },
    });
  }

  /**
   * Registers a new user by sending a GraphQL mutation with the provided username, email, and password.
   * @param {string} username - The username of the new user.
   * @param {string} email - The email of the new user.
   * @param {string} password - The password of the new user.
   * @returns {Observable<MutationResult<RegisterResponse>>} - An observable emitting the result of the register mutation.
   */
  public register(
    username: string,
    email: string,
    password: string
  ): Observable<MutationResult<RegisterResponse>> {
    const payload = { email, username, password };
    return this.apollo.mutate<RegisterResponse>({
      mutation: REGISTER_MUTATION,
      variables: { input: payload },
    });
  }

  /**
   * Stores a token in localStorage and updates the logged-in state.
   * @param {string} token - The JWT token to be stored.
   * @returns {void}
   */
  public storeToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
    this.isLoggedInSignal.set(true);
  }

  /**
   * Retrieves the JWT token from localStorage.
   * @returns {string | null} - The JWT token if it exists, or null otherwise.
   */
  public getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  /**
   * Clears the JWT token from localStorage and updates the logged-in state.
   * @returns {void}
   */
  public clearToken(): void {
    localStorage.removeItem(this.tokenKey);
    this.isLoggedInSignal.set(false);
  }

  /**
   * Checks if the stored JWT token is expired.
   * @returns {boolean} - True if the token is expired or doesn't exist, false otherwise.
   */
  public isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) {
      return true;
    }

    const { exp } = this.decodeToken(token);
    return Date.now() >= exp * 1000;
  }

  /**
   * Decodes a JWT token to extract its payload.
   * @private
   * @param {string} token - The JWT token to decode.
   * @returns {{ exp: number }} - The decoded payload containing the expiration timestamp.
   */
  private decodeToken(token: string): { exp: number } {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  }
}
