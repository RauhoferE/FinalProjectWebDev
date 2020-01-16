import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.sass']
})
// The register component.
export class RegisterComponent implements OnInit {

  // The username.
  public username: string;

  // The password.
  public password: string;

  // Initializes the register component.
  constructor(private http: HttpClient, private auth: AuthService, private router: Router) { }

  ngOnInit() {
    this.username = null;
    this.password = null;
  }

  // This method sends the credentials to the server.
  register(): void {
    this.http.post<any>('http://localhost:3000/credentials', {
      username: this.username,
      password: this.password
    }).subscribe(
      x => {
        alert('Successfully registered.');
        this.router.navigate(['login']);
      },
      error => {
        alert('Username has already been taken. Choose antother');
      });
  }

  // This method checks if the username is valid.
  public getRegButton(): boolean {
    if (this.username === null || this.password === null) {
      return true;
    } else {
      if (this.username.trim().length === 0) {
        return true;
      }
      return false;
    }
  }
}
