import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.sass']
})
export class GameComponent implements OnInit {

  public isDisabled: boolean;
  private game: Game;

  constructor(private http: HttpClient, private router: Router) {
    var style = document.createElement('style');
    style.innerHTML = `
    .wall {
      background-color: green;
    }


    .backg {
      background-color: black;
    }


    .pallet {
      background-color: yellow;
    }

    .ghost01 {
      background-color: blue;
    }

    .ghost02 {
      background-color: blue;
    }

    .ghost03 {
      background-color: blue;
    }

    .ghost04 {
      background-color: blue;
    }

    .game {
      justify-content: center;
    }

    .wdiv {
      justify-content: center;
      text-align: center;
      display: flex;
    }
    `;
    document.head.appendChild(style);
    this.game = new Game();
  }

  ngOnInit() {
    // we don't have information about Auth-Header
    this.http.get<any>('http://localhost:3000/data')
      .subscribe(
        x => {
          console.log("Login for game ok");
          this.game.StartGame();
        },
        error => {
          this.router.navigate(['login']);
        });
  }


}

class Game {

  private field: number[][];
  private width: number;
  private height: number;
  private palletPNG: string;
  private packmanPNG: string;
  private wallColor: string;
  private ghostPNG: string;
  private backGround: string;
  private windowWidth: number;
  private windowHeight: number;
  private lives: number;
  private points: number;

  constructor() {
    this.width = 15;
    this.height = 30;
    this.windowWidth = 382;
    this.windowHeight = 470;
    this.lives = 3;
    this.points = 0;
    this.backGround = 'black';
    this.wallColor = 'green';
    this.BuildGame = this.BuildGame.bind(this);
    this.StartGame = this.StartGame.bind(this);
  }

  public StartGame(): void {
    this.BuildGame();
  }

  private BuildGame(): void {
    this.field = this.Create2DArray(this.height, this.width);
    const windoWidth = this.windowWidth;
    const windowHeight = this.windowHeight ;
    const cellWidth = windoWidth / this.width;
    var container = document.getElementById('game');
    container.style.display = 'grid';
    container.style.gridTemplateColumns = `repeat(${this.width}, ${cellWidth}px)`;
    container.style.gridTemplateRows = `repeat(${this.height}, ${cellWidth}px)`;
    container.style.width = windoWidth.toString() + "px";
    container.style.width = windowHeight.toString() + "px";

    while (container.firstChild != null) {
      container.removeChild(container.firstChild);
    }

    for (let index = 0; index < this.height; index++) {
      for (let j = 0; j < this.width; j++) {
        const temp = document.createElement("div");
        temp.style.width = "100%";
        temp.style.height = "100%";
        temp.setAttribute("PosY", index.toString());
        temp.setAttribute("PosX", j.toString());
        if (index === 0 || index === this.height - 1 || j === 0 || j === this.width - 1 ) {
          this.field[index][j] = 0;
          temp.className = 'wall';
        } else {
          this.field[index][j] = 99;
          temp.className = 'backg';
        }

        if (index === 2 || index === 18) {
          if (j >= 2 && j <=4 || j===6 || j===12 || j >=8 && j <= 10 || j === 0 || j === this.width - 1 ) {
            this.field[index][j] = 0;
            temp.className = 'wall';
          } else {
            this.field[index][j] = 99;
            temp.className = 'backg';
          }
          
        } else if (index === 3 || index === 19) {
          if (j === 3 || j === 6 || j === 9 ||j === 12 || j === 0 || j === this.width -1 ) {
            this.field[index][j] = 0;
            temp.className = 'wall';
          } else {
            this.field[index][j] = 99;
            temp.className = 'backg';
          }
          
        } else if (index === 4 || index === 20) {
          if (j === 3 || j >= 5 && j <= 7 || j === 9 || j===11 || j === 12 || j === 0 || j === this.width -1 ) {
            this.field[index][j] = 0;
            temp.className = 'wall';
          } else {
            this.field[index][j] = 99;
            temp.className = 'backg';
          }
          
        }else if (index === 6 || index === 22) {
          if (j === 2 || j >= 8 && j <= 10 || j === 12 || j === 0 || j === this.width -1 ) {
            this.field[index][j] = 0;
            temp.className = 'wall';
          } else {
            this.field[index][j] = 99;
            temp.className = 'backg';
          }
          
        } else if (index === 7 || index === 23) {
          if (j === 2 || j >= 4 && j <= 6 || j === 8 || j === 9 || j === 12 || j === 0 || j === this.width -1 ) {
            this.field[index][j] = 0;
            temp.className = 'wall';
          } else {
            this.field[index][j] = 99;
            temp.className = 'backg';
          }
          
        } else if (index === 8 || index === 24) {
          if (j === 2 || j === 4 || j === 6 || j === 8 || j === 12 || j === 0 || j === this.width -1 ) {
            this.field[index][j] = 0;
            temp.className = 'wall';
            // temp.style.backgroundColor = this.wallColor;
          } else {
            this.field[index][j] = 99;
            temp.className = 'backg';
          }
          
        } else if (index === 9 || index === 25) {
          if (j >= 2 && j <= 4 ||  j === 6 || j >= 8 && j <= 10 || j === 12 || j === 0 || j === this.width -1 ) {
            this.field[index][j] = 0;
            temp.className = 'wall';
            // temp.style.backgroundColor = this.wallColor;
          } else {
            this.field[index][j] = 99;
            temp.className = 'backg';
          }
          
        } else if (index === 12) {
          if (j === 2 || j === 3 ||  j === 5 || j === 10 || j === 12 || j === 0 || j === this.width -1 ) {
            this.field[index][j] = 0;
            temp.className = 'wall';
            // temp.style.backgroundColor = this.wallColor;
          } else {
            this.field[index][j] = 99;
            temp.className = 'backg';
          }
          
        } else if (index === 13 || index === 14) {
          if ( j === 3 ||  j === 5 || j === 10 || j === 12 || j === 0 || j === this.width -1 ) {
            this.field[index][j] = 0;
            temp.className = 'wall';
            // temp.style.backgroundColor = this.wallColor;
          } else {
            this.field[index][j] = 99;
            temp.className = 'backg';
          }
          
        } else if (index === 15) {
          if ( j >= 5 && j <= 10 || j === 12 || j === 3 || j === 0 || j === this.width -1 ) {
            this.field[index][j] = 0;
            temp.className = 'wall';
            // temp.style.backgroundColor = this.wallColor;
          } else {
            this.field[index][j] = 99;
            temp.className = 'backg';
          }
        } else if (index === 27) {
          if ( j >= 5 && j <= 9 || j === 2 || j === 0 || j === this.width -1 ) {
            this.field[index][j] = 0;
            temp.className = 'wall';
            // temp.style.backgroundColor = this.wallColor;
          } else {
            this.field[index][j] = 99;
            temp.className = 'backg';
          }
        } else if (index === 28) {
          if ( j === 11 || j === 0 || j === this.width -1 ) {
            this.field[index][j] = 0;
            temp.className = 'wall';
            // temp.style.backgroundColor = this.wallColor;
          } else {
            this.field[index][j] = 99;
            temp.className = 'backg';
          }
        } else if (index === 16 || index === 17 || index === 10 || index === 11) {
          if ( j === 0 || j === this.width - 1 || j === 0 || j === this.width -1 ) {
            this.field[index][j] = 99;
            temp.className = 'backg';
            //temp.style.backgroundColor = this.backGround;
          } else {
            this.field[index][j] = 99;
            temp.className = 'backg';
          }
        } 

        //TODO: Add Enemys, Player, Pallets, And Game Feature
        container.appendChild(temp);
      }
    }
  }

  private GameLoop() : void {
    
  }



  // This method creates a 2d number array.
  private Create2DArray(height: number, width: number): number[][] {
    const arr = new Array(height);

    for (let i = 0; i < height; i++) {
      arr[i] = new Array(width);
    }

    return arr;
  }

}
