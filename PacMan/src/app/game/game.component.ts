import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.sass']
})
export class GameComponent implements OnInit {

  public isDisabled : boolean;
  constructor(private http: HttpClient, private router: Router) { }

  ngOnInit() {
            // we don't have information about Auth-Header
            this.http.get<any>('http://localhost:3000/data')
            .subscribe(
                x => {
                    console.log("Login for game ok");
                    
                },
                error => {
                  alert("you have to login first.");
                  this.router.navigate(['login']);
                });
  }

}
