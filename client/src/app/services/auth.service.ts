import { inject, Injectable } from '@angular/core';
import { Apollo, gql, MutationResult } from 'apollo-angular';
import { AuthResponse, MutationLoginUserArgs, MutationRegisterUserArgs } from '../generated/graphql';
import { Observable } from 'rxjs';

type LoginResponse = {
  loginUser: AuthResponse
}

type RegisterResponse = {
  registerUser: AuthResponse
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
`

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
`

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apollo = inject(Apollo);
  private tokenKey: string = 'jwt';

  public login(email: string, password: string): Observable<MutationResult<LoginResponse>> {
    const payload = {email, password};
    return this.apollo.mutate<LoginResponse>({
      mutation: LOGIN_MUTATION,
      variables: {input: payload},
    });
  }

  public register(username: string, email: string, password: string): Observable<MutationResult<RegisterResponse>> {
    const payload = {email, username, password};
    return this.apollo.mutate<RegisterResponse>({
      mutation: REGISTER_MUTATION,
      variables: {input: payload},
    });
  }
  
  public storeToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  public getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  public clearToken(): void {
    localStorage.removeItem(this.tokenKey);
  }

  public isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) {
      return true;
    }

    const { exp } = this.decodeToken(token);
    return Date.now() >= exp * 1000;
  }

  private decodeToken(token: string): {exp: number} {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  }
}
