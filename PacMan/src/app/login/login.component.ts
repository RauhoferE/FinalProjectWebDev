import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.sass']
})
// The login component.
export class LoginComponent implements OnInit {
  // The username.
  public username: string;

  // The password.
  public password: string;

  // Initializes the login component.
  constructor(private http: HttpClient, private auth: AuthService) { }

  ngOnInit() {
  }

  // This method sends the credentials to the server.
  login(): void {
    this.http.post<any>('http://localhost:3000/signin', {
      username: this.username,
      password: this.password
    }).subscribe(
      x => {
        localStorage.setItem('name', this.username);
        console.log(x);
        this.auth.token = x.token;
      },
      error => { console.error(error); alert('Error wrong username or password!'); });
  }

  // This method checks if the login button should be disabled.
  getLoginButton(): boolean {
    if (this.password === null || this.username === null || this.auth.token !== '') {
      return true;
    } else {
      return false;
    }
  }

  // This method checks if the logout button should be disabled.
  getLogoutButton(): boolean {
    if (this.auth.token === '') {
      return true;
    } else {
      return false;
    }
  }

  // This method checks if the register button should be disabled.
  getRegisterLink(): boolean {
    if (this.auth.token === '') {
      return false;
    } else {
      return true;
    }
  }

  // This method logsout the user.
  logout() {
    this.auth.token = '';
  }

}
