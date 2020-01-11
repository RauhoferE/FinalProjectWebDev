import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.sass']
})
export class LoginComponent implements OnInit {

  public username: string;
  public password: string;
  constructor(private http: HttpClient, private auth: AuthService) { }

  ngOnInit() {
  }

  login(): void {
    this.http.post<any>('http://localhost:3000/signin', {
        username: this.username,
        password: this.password
    }).subscribe(
        x => {
            console.log(x);
            this.auth.token = x.token;
        },
        error => { console.error(error); });
}

logout() {
    this.auth.token = '';
}

}
