import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-score-site',
  templateUrl: './score-site.component.html',
  styleUrls: ['./score-site.component.sass']
})
export class ScoreSiteComponent implements OnInit {

  public isHidden: boolean;
  public message: string;
  public scoreHidden: boolean;
  public points: number;

  constructor(private http: HttpClient, private router: Router) {
    this.isHidden = false;
    this.scoreHidden = true;
    this.points = +localStorage.getItem('score');
    this.message = '';
  }

  ngOnInit() {
    this.http.get<any>('http://localhost:3000/data')
      .subscribe(
        x => {
        },
        error => {
          this.router.navigate(['login']);
        });

    document.getElementById("send").addEventListener('click', e => {
      this.isHidden = true;
      console.log(this.message),
      this.http.post<any>('http://localhost:3000/score', {
        username: localStorage.getItem('name'),
        points: localStorage.getItem('score'),
        message: this.message
      }).subscribe(
          x => {
            this.http.get<any>('http://localhost:3000/score')
            .subscribe(
              x => {
                console.log(x.board);

                this.scoreHidden = false;
                x.board.forEach(element => {
                  const para = document.createElement("p");
                  para.innerHTML = element[0] + ' got ' + element[1] + ' points. Message: ' + element[2] + '\n';
                  document.getElementById('scoreL').appendChild(para);
                });
              },
              error => {
                this.router.navigate(['login']);
              });
          },
          error => {
            alert('Ooops couldnt send the score to the server.');
          });
    });

    document.getElementById("newGame").addEventListener('click', e => {
      this.router.navigate(['game']);
    });
  }



}
