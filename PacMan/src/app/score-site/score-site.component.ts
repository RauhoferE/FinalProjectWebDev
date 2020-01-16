import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-score-site',
  templateUrl: './score-site.component.html',
  styleUrls: ['./score-site.component.sass']
})
// The score site component.
export class ScoreSiteComponent implements OnInit {

  // Checks if the welcome message is hidden.
  public isHidden: boolean;

  // The message that will be sent to the score board.
  public message: string;

  // Checks if the score board is hidden.
  public scoreHidden: boolean;

  // The player points.
  public points: number;

  // Initializes the score site.
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

    document.getElementById('send').addEventListener('click', e => {
      this.isHidden = true;
      this.http.post<any>('http://localhost:3000/score', {
        username: localStorage.getItem('name'),
        points: localStorage.getItem('score'),
        message: this.message
      }).subscribe(
        x => {
          this.http.get<any>('http://localhost:3000/score')
            .subscribe(
              x => {
                this.scoreHidden = false;
                x.board.forEach(element => {
                  const para = document.createElement('p');
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

    document.getElementById('newGame').addEventListener('click', e => {
      this.router.navigate(['game']);
    });
  }
}
