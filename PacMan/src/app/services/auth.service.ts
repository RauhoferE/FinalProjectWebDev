import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
// The authentification service.
export class AuthService {
  // The token of the user.
  public token = '';
  constructor() { }
}
