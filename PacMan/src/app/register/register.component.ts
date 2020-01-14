import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.sass']
})
export class RegisterComponent implements OnInit {

  public username: string;
  public password: string;
  constructor(private http: HttpClient, private auth: AuthService, private router: Router) { }

  ngOnInit() {
    this.username = null;
    this.password = null;
  }

  register(): void {
    this.http.post<any>('http://localhost:3000/credentials', {
        username: this.username,
        password: this.password
    }).subscribe(
        x => {
            console.log(x);
            alert("Successfully registered.");
            this.router.navigate(['login']);
        },
        error => { 
          console.error(error); 
          alert("Username has already been taken. Choose antother");
        });
}

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
