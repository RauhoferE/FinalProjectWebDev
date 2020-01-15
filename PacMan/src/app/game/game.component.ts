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
  private isHidden: boolean;

  constructor(private http: HttpClient, private router: Router) {
    this.isHidden = false;
    var style = document.createElement('style');
    style.innerHTML = `
    .wall {
      background-color: green;

    }


    .backg {
      background-color: black;
    }


    .pallet {
      background-color: black;
      background-image: url('../../assets/Sprites/pallet.png');
      background-repeat: no-repeat;
    }

    .ghost01 {
      background-color: black;
      background-image: url('../../assets/Sprites/blinky1.png');
      background-repeat: no-repeat;
    }

    .ghost02 {
      background-color: black;
      background-image: url('../../assets/Sprites/blue1.png');
      background-repeat: no-repeat;
    }

    .ghost03 {
      background-color: black;
      background-image: url('../../assets/Sprites/orange1.png');
      background-repeat: no-repeat;
    }

    .ghost04 {
      background-color: black;
      background-image: url('../../assets/Sprites/pinky1.png');
      background-repeat: no-repeat;
    }

    .game {
      justify-content: center;
    }

    .wdiv {
      justify-content: center;
      text-align: center;
      display: flex;
    }
    .player{
      background-color: black;
      background-repeat: no-repeat;
      background-image: url('../../assets/Sprites/pacman1.png');
    }
    .teleporter{
      background-color: black;
      background-repeat: no-repeat;
      background-image: url('../../assets/Sprites/teleport.png');
    }
    .rainbow{
      background-color: black;
      background-repeat: no-repeat;
      background-image: url('../../assets/Sprites/rainbow.png');
    }
    .apple{
      background-color: black;
      background-repeat: no-repeat;
      background-image: url('../../assets/Sprites/apple.png');
    }
    `;
    document.head.appendChild(style);
    this.game = new Game(router);
  }

  ngOnInit() {
    // we don't have information about Auth-Header
    this.http.get<any>('http://localhost:3000/data')
      .subscribe(
        x => {
        },
        error => {
          this.router.navigate(['login']);
        });

    document.getElementById("startbut").addEventListener('click', e => {
      this.isHidden = true;
      this.game.StartGame();
    });
  }

  public get pointCounter(): number {
    return this.game.points;
  }

  public get liveCounter(): number {
    return this.game.lives;
  }

  public get IsHidden(): boolean{
    return this.isHidden;
  }

  public get areDoublePointsHidden(): boolean{
    if (this.game.double <= 0) {
      console.log('hid');
      
      return true;
    } else {
      console.log('show');
      
      return false;
    }
  }
}

class Game {
  private field: number[][];
  private oldField: number[][];
  private width: number;
  private height: number;
  private windowWidth: number;
  private windowHeight: number;
  public lives: number;
  public points: number;
  private direction: number;
  public double: number;
  private ghost01Dir: number;
  private ghost02Dir: number;
  private ghost03Dir: number;
  private ghost04Dir: number;
  private loop: number;
  private coins: boolean[][];
  private audioElement = new Audio('../../assets/Music/theme.mp3');

  constructor(private router: Router) {
    this.width = 15;
    this.height = 30;
    this.windowWidth = 382;
    this.windowHeight = 470;
    this.lives = 3;
    this.points = 0;
    this.double = 0;
    this.direction = 0;
    this.ghost01Dir = 0;
    this.ghost02Dir = 1;
    this.ghost03Dir = 3;
    this.ghost04Dir = 2;
    document.addEventListener('keydown', e => {
      var up;
      var down;
      var left;
      var right;

      for (let index = 0; index < this.field.length; index++) {
        for (let index2 = 0; index2 < this.field[index].length; index2++) {
          if (this.field[index][index2] === 2) {
            up = this.field[index - 1][index2];
            down = this.field[index + 1][index2];
            left = this.field[index][index2 - 1];
            right = this.field[index][index2 + 1];
          }
        }
      }
      if (e.keyCode === 37) {
        if (left === 0) {
          return;
        }
        this.direction = 2;

        e.preventDefault();
      } else if (e.keyCode === 38) {
        if (up === 0) {
          return;
        }
        this.direction = 3;
        e.preventDefault();
      } else if (e.keyCode === 39) {
        if (right === 0) {
          return;
        }
        this.direction = 0;
        e.preventDefault();
      } else if (e.keyCode === 40) {
        if (down === 0) {
          return;
        }
        this.direction = 1;
        e.preventDefault();
      }
      console.log(this.direction);
    });
    this.BuildGame = this.BuildGame.bind(this);
    this.StartGame = this.StartGame.bind(this);
    this.SetCoins = this.SetCoins.bind(this);
    this.CloneArray = this.CloneArray.bind(this);
    this.GameLoop = this.GameLoop.bind(this);
  }

  public StartGame(): void {
    this.BuildGame();
    this.audioElement.play();
    this.loop = window.setInterval(this.GameLoop, 1000);
  }

  public StopGame(): void {
    clearInterval(this.loop);
    this.audioElement.pause();
    localStorage.setItem('score', this.points.toString());
    this.router.navigate(['scoresite']);
  }

  private BuildGame(): void {
    this.field = this.Create2DArray(this.height, this.width);
    const windoWidth = this.windowWidth;
    const windowHeight = this.windowHeight;
    const cellWidth = windoWidth / this.width;
    const container = document.getElementById('game');
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
        if (index === 0 || index === this.height - 1 || j === 0 || j === this.width - 1) {
          this.field[index][j] = 0;
          temp.className = 'wall';
        } else {
          this.field[index][j] = 1;
          temp.className = 'pallet';
        }

        if (j === 6 && index === 16) {
          this.field[index][j] = 2;
          temp.className = 'player';
        } else if (index === 1 && j === 1) {
          this.field[index][j] = 3;
          temp.className = 'ghost01';
        } else if (index === 1 && j === 13) {
          this.field[index][j] = 7;
          temp.className = 'ghost02';
        } else if (index === 28 && j === 1) {
          this.field[index][j] = 8;
          temp.className = 'ghost03';
        } else if (j === 13 && index === 28) {
          this.field[index][j] = 9;
          temp.className = 'ghost04';
        } else if (index === 8 && j === 5 || index === 24 && j === 5) {
          this.field[index][j] = 4;
          temp.className = 'teleporter';
        } else if (index === 8 && j === 9 || index === 24 && j === 9) {
          this.field[index][j] = 5;
          temp.className = 'rainbow';
        } else if (index === 19 && j === 4 || index === 24 && j === 3 || index === 14 && j === 6 || index === 3 && j === 4) {
          this.field[index][j] = 6;
          temp.className = 'apple';
        } else if (index === 2 || index === 18) {
          if (j >= 2 && j <= 4 || j === 6 || j === 12 || j >= 8 && j <= 10 || j === 0 || j === this.width - 1) {
            this.field[index][j] = 0;
            temp.className = 'wall';
          } else {
            this.field[index][j] = 1;
            temp.className = 'pallet';
          }

        } else if (index === 3 || index === 19) {
          if (j === 3 || j === 6 || j === 9 || j === 12 || j === 0 || j === this.width - 1) {
            this.field[index][j] = 0;
            temp.className = 'wall';
          } else {
            this.field[index][j] = 1;
            temp.className = 'pallet';
          }

        } else if (index === 4 || index === 20) {
          if (j === 3 || j >= 5 && j <= 7 || j === 9 || j === 11 || j === 12 || j === 0 || j === this.width - 1) {
            this.field[index][j] = 0;
            temp.className = 'wall';
          } else {
            this.field[index][j] = 1;
            temp.className = 'pallet';
          }

        } else if (index === 6 || index === 22) {
          if (j === 2 || j >= 8 && j <= 10 || j === 12 || j === 0 || j === this.width - 1) {
            this.field[index][j] = 0;
            temp.className = 'wall';
          } else {
            this.field[index][j] = 1;
            temp.className = 'pallet';
          }

        } else if (index === 7 || index === 23) {
          if (j === 2 || j >= 4 && j <= 6 || j === 8 || j === 9 || j === 12 || j === 0 || j === this.width - 1) {
            this.field[index][j] = 0;
            temp.className = 'wall';
          } else {
            this.field[index][j] = 1;
            temp.className = 'pallet';
          }

        } else if (index === 8 || index === 24) {
          if (j === 2 || j === 4 || j === 6 || j === 8 || j === 12 || j === 0 || j === this.width - 1) {
            this.field[index][j] = 0;
            temp.className = 'wall';
          } else if (j === 5) {
            this.field[index][j] = 1;
            temp.className = 'pallet';
          } else {
            this.field[index][j] = 1;
            temp.className = 'pallet';
          }

        } else if (index === 9 || index === 25) {
          if (j >= 2 && j <= 4 || j === 6 || j >= 8 && j <= 10 || j === 12 || j === 0 || j === this.width - 1) {
            this.field[index][j] = 0;
            temp.className = 'wall';
            // temp.style.backgroundColor = this.wallColor;
          } else {
            this.field[index][j] = 1;
            temp.className = 'pallet';
          }

        } else if (index === 12) {
          if (j === 2 || j === 3 || j === 5 || j === 10 || j === 12 || j === 0 || j === this.width - 1) {
            this.field[index][j] = 0;
            temp.className = 'wall';
            // temp.style.backgroundColor = this.wallColor;
          } else {
            this.field[index][j] = 1;
            temp.className = 'pallet';
          }

        } else if (index === 13 || index === 14) {
          if (j === 3 || j === 5 || j === 10 || j === 12 || j === 0 || j === this.width - 1) {
            this.field[index][j] = 0;
            temp.className = 'wall';
            // temp.style.backgroundColor = this.wallColor;
          } else {
            this.field[index][j] = 1;
            temp.className = 'pallet';
          }

        } else if (index === 15) {
          if (j >= 5 && j <= 10 || j === 12 || j === 3 || j === 0 || j === this.width - 1) {
            this.field[index][j] = 0;
            temp.className = 'wall';
            // temp.style.backgroundColor = this.wallColor;
          } else {
            this.field[index][j] = 1;
            temp.className = 'pallet';
          }
        } else if (index === 27) {
          if (j >= 5 && j <= 9 || j === 2 || j === 0 || j === this.width - 1) {
            this.field[index][j] = 0;
            temp.className = 'wall';
            // temp.style.backgroundColor = this.wallColor;
          } else {
            this.field[index][j] = 1;
            temp.className = 'pallet';
          }
        } else if (index === 28) {
          if (j === 0 || j === this.width - 1) {
            this.field[index][j] = 0;
            temp.className = 'wall';
          }
        } else if (index === 16 || index === 17 || index === 10 || index === 11) {
          if (j === 0 || j === this.width - 1 || j === 0 || j === this.width - 1) {
            this.field[index][j] = 99;
            temp.className = 'backg';
            //temp.style.backgroundColor = this.backGround;
          }
          else {
            this.field[index][j] = 1;
            temp.className = 'pallet';
          }
        }

        container.appendChild(temp);
      }
    }

    
    this.SetCoins();
  }

  public GameLoop(): void {
    this.CloneArray();

    // Add player hit detection to ghosts
    for (let index = 0; index < this.oldField.length; index++) {
      for (let index2 = 0; index2 < this.oldField[index].length; index2++) {
                // Player
                if (this.oldField[index][index2] === 2) {
                  if (this.direction === 0) {
                    if (index2 + 1 >= 15) {
                      console.log("Player reached end");
        
                      this.field[index][0] = 2;
                      this.field[index][index2] = 99;
                      document.querySelectorAll(`[posy="${index}"][posx="${0}"]`)[0].className = 'player';
                      document.querySelectorAll(`[posy="${index}"][posx="${index2}"]`)[0].className = 'backg';
                    } else if (this.oldField[index][index2 + 1] === 3 || this.oldField[index][index2 + 1] >= 7 && this.oldField[index][index2 + 1] < 99) {
                      //If hit Change direction
        
                      this.lives = this.lives - 1;
                      this.field[index][index2] = 99;
                      this.field[16][6] = 2;
                      document.querySelectorAll(`[posy="${16}"][posx="${6}"]`)[0].className = 'player';
                      document.querySelectorAll(`[posy="${index}"][posx="${index2}"]`)[0].className = 'backg';
                    } else if (this.oldField[index][index2 + 1] === 1) {
                      console.log("Pallet");
                      if (this.double > 0) {
                        this.points = this.points + 2;
                      } else{
                        this.points++;
                      }
                      
                      this.field[index][index2] = 99;
                      this.field[index][index2 + 1] = 2;
                      this.coins[index][index2 + 1] = false;
        
                      document.querySelectorAll(`[posy="${index}"][posx="${index2 + 1}"]`)[0].className = 'player';
                      document.querySelectorAll(`[posy="${index}"][posx="${index2}"]`)[0].className = 'backg';
                    } else if (this.oldField[index][index2 + 1] === 6) {
                      this.points = this.points + 10;
                      this.field[index][index2] = 99;
                      this.field[index][index2 + 1] = 2;
                      document.querySelectorAll(`[posy="${index}"][posx="${index2 + 1}"]`)[0].className = 'player';
                      document.querySelectorAll(`[posy="${index}"][posx="${index2}"]`)[0].className = 'backg';
                    } else if(this.oldField[index][index2 + 1] === 5){
                      this.double = 21;
                      this.field[index][index2] = 99;
                      this.field[index][index2 + 1] = 2;
                      document.querySelectorAll(`[posy="${index}"][posx="${index2 + 1}"]`)[0].className = 'player';
                      document.querySelectorAll(`[posy="${index}"][posx="${index2}"]`)[0].className = 'backg';
                    } else if (index === 8 && index2 + 1 === 5) {
                      this.field[index][index2] = 99;
                      this.field[25][5] = 2;
                      document.querySelectorAll(`[posy="${index}"][posx="${index2}"]`)[0].className = 'backg';
                      document.querySelectorAll(`[posy="${25}"][posx="${5}"]`)[0].className = 'player';
                    } else if (index === 24 && index2 + 1 === 5) {
                      this.field[index][index2] = 99;
                      this.field[9][5] = 2;
                      document.querySelectorAll(`[posy="${index}"][posx="${index2}"]`)[0].className = 'backg';
                      document.querySelectorAll(`[posy="${9}"][posx="${5}"]`)[0].className = 'player';
                    } else if (this.oldField[index][index2 + 1] !== 0) {
                      console.log("Move normal");
                      console.log(this.oldField[index][index2]);
                      this.field[index][index2 + 1] = 2;
                      this.field[index][index2] = 99;
                      document.querySelectorAll(`[posy="${index}"][posx="${index2 + 1}"]`)[0].className = 'player';
                      document.querySelectorAll(`[posy="${index}"][posx="${index2}"]`)[0].className = 'backg';
                    }
                  } else if (this.direction === 1) {
                    if (index + 1 >= 31) {
                      console.log("Player reached end");
        
                      this.field[0][index2] = 2;
                      this.field[index][index2] = 99;
                      document.querySelectorAll(`[posy="${0}"][posx="${index2}"]`)[0].className = 'player';
                      document.querySelectorAll(`[posy="${index}"][posx="${index2}"]`)[0].className = 'backg';
                    } else if (this.oldField[index + 1][index2] === 3 ||
                      this.oldField[index + 1][index2] >= 7 && this.oldField[index + 1][index2] < 99) {
                      //If hit Change direction
                      this.lives = this.lives - 1;
                      this.field[index][index2] = 99;
                      this.field[16][6] = 2;
                      document.querySelectorAll(`[posy="${16}"][posx="${6}"]`)[0].className = 'player';
                      document.querySelectorAll(`[posy="${index}"][posx="${index2}"]`)[0].className = 'backg';
                    } else if (this.oldField[index + 1][index2] === 1) {
                      console.log("Pallet");
        
                      if (this.double > 0) {
                        this.points = this.points + 2;
                      } else{
                        this.points++;
                      }
                      this.field[index][index2] = 99;
                      this.field[index + 1][index2] = 2;
                      this.coins[index + 1][index2] = false;
        
                      document.querySelectorAll(`[posy="${index + 1}"][posx="${index2}"]`)[0].className = 'player';
                      document.querySelectorAll(`[posy="${index}"][posx="${index2}"]`)[0].className = 'backg';
                    } else if (this.oldField[index + 1][index2] === 6 ) {
                      this.points = this.points + 10;
                      this.field[index][index2] = 99;
                      this.field[index + 1][index2] = 2;
                      document.querySelectorAll(`[posy="${index + 1}"][posx="${index2}"]`)[0].className = 'player';
                      document.querySelectorAll(`[posy="${index}"][posx="${index2}"]`)[0].className = 'backg';
                    } else if(this.oldField[index + 1][index2] === 5){
                      this.double = 21;
                      this.field[index][index2] = 99;
                      this.field[index + 1][index2] = 2;
                      document.querySelectorAll(`[posy="${index + 1}"][posx="${index2}"]`)[0].className = 'player';
                      document.querySelectorAll(`[posy="${index}"][posx="${index2}"]`)[0].className = 'backg';
                    } else if (index + 1 === 8 && index2 === 5) {
                      //Teleport
                      this.field[index][index2] = 99;
                      this.field[25][5] = 2;
                      document.querySelectorAll(`[posy="${index}"][posx="${index2}"]`)[0].className = 'backg';
                      document.querySelectorAll(`[posy="${25}"][posx="${5}"]`)[0].className = 'player';
                    } else if (index + 1 === 24 && index2 === 5) {
                      //Teleport
                      this.field[index][index2] = 99;
                      this.field[9][5] = 2;
                      document.querySelectorAll(`[posy="${index}"][posx="${index2}"]`)[0].className = 'backg';
                      document.querySelectorAll(`[posy="${9}"][posx="${5}"]`)[0].className = 'player';
                    } else if (this.oldField[index + 1][index2] !== 0) {
                      //Move Forward
                      console.log("Move normal");
                      console.log(this.oldField[index][index2]);
                      this.field[index + 1][index2] = 2;
                      this.field[index][index2] = 99;
                      document.querySelectorAll(`[posy="${index + 1}"][posx="${index2}"]`)[0].className = 'player';
                      document.querySelectorAll(`[posy="${index}"][posx="${index2}"]`)[0].className = 'backg';
                    }
        
                  } else if (this.direction === 2) {
                    if (index2 - 1 <= -1) {
                      console.log("Player reached end");
        
                      this.field[index][14] = 2;
                      this.field[index][index2] = 99;
                      document.querySelectorAll(`[posy="${index}"][posx="${14}"]`)[0].className = 'player';
                      document.querySelectorAll(`[posy="${index}"][posx="${index2}"]`)[0].className = 'backg';
                    } else if (this.oldField[index][index2 - 1] === 3 ||
                      this.oldField[index][index2 - 1] >= 7 && this.oldField[index][index2 - 1] < 99) {
                      //If hit Change direction
        
                      this.lives = this.lives - 1;
                      this.field[index][index2] = 99;
                      this.field[16][6] = 2;
                      document.querySelectorAll(`[posy="${16}"][posx="${6}"]`)[0].className = 'player';
                      document.querySelectorAll(`[posy="${index}"][posx="${index2}"]`)[0].className = 'backg';
                    } else if (this.oldField[index][index2 - 1] === 1) {
                      console.log("Pallet");
        
                      if (this.double > 0) {
                        this.points = this.points + 2;
                      } else{
                        this.points++;
                      }
                      this.field[index][index2] = 99;
                      this.field[index][index2 - 1] = 2;
                      this.coins[index][index2 - 1] = false;
        
                      document.querySelectorAll(`[posy="${index}"][posx="${index2 - 1}"]`)[0].className = 'player';
                      document.querySelectorAll(`[posy="${index}"][posx="${index2}"]`)[0].className = 'backg';
                    } else if (this.oldField[index][index2 - 1] === 6) {
                      this.points = this.points + 10;
                      this.field[index][index2] = 99;
                      this.field[index][index2 - 1] = 2;
                      document.querySelectorAll(`[posy="${index}"][posx="${index2 - 1}"]`)[0].className = 'player';
                      document.querySelectorAll(`[posy="${index}"][posx="${index2}"]`)[0].className = 'backg';
                    }else if(this.oldField[index][index2 - 1] === 5){
                      this.double = 21;
                      this.field[index][index2] = 99;
                      this.field[index][index2 - 1] = 2;
                      document.querySelectorAll(`[posy="${index}"][posx="${index2 - 1}"]`)[0].className = 'player';
                      document.querySelectorAll(`[posy="${index}"][posx="${index2}"]`)[0].className = 'backg';
                    } else if (index === 8 && index2 - 1 === 5) {
                      this.field[index][index2] = 99;
                      this.field[25][5] = 2;
                      document.querySelectorAll(`[posy="${index}"][posx="${index2}"]`)[0].className = 'backg';
                      document.querySelectorAll(`[posy="${25}"][posx="${5}"]`)[0].className = 'player';
                    } else if (index === 24 && index2 - 1 === 5) {
                      this.field[index][index2] = 99;
                      this.field[9][5] = 2;
                      document.querySelectorAll(`[posy="${index}"][posx="${index2}"]`)[0].className = 'backg';
                      document.querySelectorAll(`[posy="${9}"][posx="${5}"]`)[0].className = 'player';
                    } else if (this.oldField[index][index2 - 1] !== 0) {
                      //Move Forward
                      console.log("Move normal");
                      console.log(this.oldField[index][index2]);
                      this.field[index][index2 - 1] = 2;
                      this.field[index][index2] = 99;
                      document.querySelectorAll(`[posy="${index}"][posx="${index2 - 1}"]`)[0].className = 'player';
                      document.querySelectorAll(`[posy="${index}"][posx="${index2}"]`)[0].className = 'backg';
                    }
                  } else {
                    if (index - 1 <= -1) {
                      console.log("Player reached end");
        
                      this.field[29][index2] = 2;
                      this.field[index][index2] = 99;
                      document.querySelectorAll(`[posy="${29}"][posx="${index2}"]`)[0].className = 'player';
                      document.querySelectorAll(`[posy="${index}"][posx="${index2}"]`)[0].className = 'backg';
                    } else if (this.oldField[index - 1][index2] === 3 ||
                      this.oldField[index - 1][index2] >= 7 && this.oldField[index - 1][index2] < 99) {
                      //If hit Change direction
                      this.lives = this.lives - 1;
                      this.field[index][index2] = 99;
                      this.field[16][6] = 2;
                      document.querySelectorAll(`[posy="${16}"][posx="${6}"]`)[0].className = 'player';
                      document.querySelectorAll(`[posy="${index}"][posx="${index2}"]`)[0].className = 'backg';
                    } else if (this.oldField[index - 1][index2] === 1) {
                      console.log("Pallet");
        
                      if (this.double > 0) {
                        this.points = this.points + 2;
                      } else{
                        this.points++;
                      }
                      this.field[index][index2] = 99;
                      this.field[index - 1][index2] = 2;
                      this.coins[index - 1][index2] = false;
        
                      document.querySelectorAll(`[posy="${index - 1}"][posx="${index2}"]`)[0].className = 'player';
                      document.querySelectorAll(`[posy="${index}"][posx="${index2}"]`)[0].className = 'backg';
                    } else if (this.oldField[index - 1][index2] === 6) {
                      this.points = this.points + 10;
                      this.field[index][index2] = 99;
                      this.field[index - 1][index2] = 2;
                      document.querySelectorAll(`[posy="${index - 1}"][posx="${index2}"]`)[0].className = 'player';
                      document.querySelectorAll(`[posy="${index}"][posx="${index2}"]`)[0].className = 'backg';
                    } else if(this.oldField[index - 1][index2] === 5){
                      this.double = 21;
                      this.field[index][index2] = 99;
                      this.field[index - 1][index2] = 2;
                      document.querySelectorAll(`[posy="${index - 1}"][posx="${index2}"]`)[0].className = 'player';
                      document.querySelectorAll(`[posy="${index}"][posx="${index2}"]`)[0].className = 'backg';
                    }else if (index - 1 === 8 && index2 === 5) {
                      //Teleport
                      this.field[index][index2] = 99;
                      this.field[25][5] = 2;
                      document.querySelectorAll(`[posy="${index}"][posx="${index2}"]`)[0].className = 'backg';
                      document.querySelectorAll(`[posy="${25}"][posx="${5}"]`)[0].className = 'player';
                    } else if (index - 1 === 24 && index2 === 5) {
                      //Teleport
                      this.field[index][index2] = 99;
                      this.field[9][5] = 2;
                      document.querySelectorAll(`[posy="${index}"][posx="${index2}"]`)[0].className = 'backg';
                      document.querySelectorAll(`[posy="${9}"][posx="${5}"]`)[0].className = 'player';
                    } else if (this.oldField[index - 1][index2] !== 0) {
                      //Move Forward
                      console.log("Move normal");
                      console.log(this.oldField[index][index2]);
                      this.field[index - 1][index2] = 2;
                      this.field[index][index2] = 99;
                      document.querySelectorAll(`[posy="${index - 1}"][posx="${index2}"]`)[0].className = 'player';
                      document.querySelectorAll(`[posy="${index}"][posx="${index2}"]`)[0].className = 'backg';
                    }
                  }
                }
      }
    }

    this.CloneArray();
    for (let index = 0; index < this.oldField.length; index++) {
      for (let index2 = 0; index2 < this.oldField[index].length; index2++) {
                // Ghost01
                if (this.oldField[index][index2] === 3) {
                  // Left
                  if (this.ghost01Dir === 0) {
                    if (this.oldField[index][index2 + 1] === 0 || this.oldField[index][index2 + 1] >= 3 && this.oldField[index][index2 + 1] <= 9) {
                      //If hit Change direction
                      this.ghost01Dir = 1;
                    } else if (this.oldField[index][index2 + 1] === 2) {
                      // ToDo Player detection
                      console.log("Player hit");
        
                      this.lives--;
                      this.field[index][index2] = 99;
                      this.field[16][6] = 2;
                      this.field[index][index2 + 1] = 3;
                      document.querySelectorAll(`[posy="${index}"][posx="${index2 + 1}"]`)[0].className = 'ghost01';
                      document.querySelectorAll(`[posy="${index}"][posx="${index2}"]`)[0].className = 'backg';
                      document.querySelectorAll(`[posy="${16}"][posx="${6}"]`)[0].className = 'player';
                    }
                    else {
                      //Move Forward
                      this.field[index][index2 + 1] = 3;
                      this.field[index][index2] = 99;
                      document.querySelectorAll(`[posy="${index}"][posx="${index2 + 1}"]`)[0].className = 'ghost01';
                      document.querySelectorAll(`[posy="${index}"][posx="${index2}"]`)[0].className = 'backg';
                    }
                  } else if (this.ghost01Dir === 1) {
                    if (this.oldField[index + 1][index2] === 0 || this.oldField[index + 1][index2] >= 3 && this.oldField[index + 1][index2] <= 9) {
                      //If hit Change direction
                      this.ghost01Dir = 2;
                    } else if(this.oldField[index + 1][index2] === 2){
                      // ToDo Player detection
                      console.log("Player hit");
        
                      this.lives--;
                      this.field[index][index2] = 99;
                      this.field[16][6] = 2;
                      this.field[index + 1][index2] = 3;
                      document.querySelectorAll(`[posy="${index + 1}"][posx="${index2}"]`)[0].className = 'ghost01';
                      document.querySelectorAll(`[posy="${index}"][posx="${index2}"]`)[0].className = 'backg';
                      document.querySelectorAll(`[posy="${16}"][posx="${6}"]`)[0].className = 'player';
                    } else {
                      //Move Forward
                      console.log("Move");
                      console.log(this.oldField[index][index2]);
                      this.field[index + 1][index2] = 3;
                      this.field[index][index2] = 99;
                      document.querySelectorAll(`[posy="${index + 1}"][posx="${index2}"]`)[0].className = 'ghost01';
                      document.querySelectorAll(`[posy="${index}"][posx="${index2}"]`)[0].className = 'backg';
                    }
                  } else if (this.ghost01Dir === 2) {
                    if (this.oldField[index][index2 - 1] === 0 || this.oldField[index][index2 - 1] >= 3 && this.oldField[index][index2 - 1] <= 9) {
                      //If hit Change direction
                      this.ghost01Dir = 3;
                    } else if(this.oldField[index][index2 - 1] === 2){
                      // ToDo Player detection
                      console.log("Player hit");
        
                      this.lives--;
                      this.field[index][index2] = 99;
                      this.field[16][6] = 2;
                      this.field[index][index2 - 1] = 3;
                      document.querySelectorAll(`[posy="${index}"][posx="${index2 - 1}"]`)[0].className = 'ghost01';
                      document.querySelectorAll(`[posy="${index}"][posx="${index2}"]`)[0].className = 'backg';
                      document.querySelectorAll(`[posy="${16}"][posx="${6}"]`)[0].className = 'player';
                    } else {
                      //Move Forward
                      this.field[index][index2 - 1] = 3;
                      this.field[index][index2] = 99;
                      document.querySelectorAll(`[posy="${index}"][posx="${index2 - 1}"]`)[0].className = 'ghost01';
                      document.querySelectorAll(`[posy="${index}"][posx="${index2}"]`)[0].className = 'backg';
                    }
                  } else {
                    if (this.oldField[index - 1][index2] === 0 || this.oldField[index - 1][index2] >= 3 && this.oldField[index - 1][index2] <= 9) {
                      //If hit Change direction
                      this.ghost01Dir = 0;
                    } else if(this.oldField[index - 1][index2] === 2){
                      // ToDo Player detection
                      console.log("Player hit");
        
                      this.lives--;
                      this.field[index][index2] = 99;
                      this.field[16][6] = 2;
                      this.field[index - 1][index2] = 3;
                      document.querySelectorAll(`[posy="${index - 1}"][posx="${index2}"]`)[0].className = 'ghost01';
                      document.querySelectorAll(`[posy="${index}"][posx="${index2}"]`)[0].className = 'backg';
                      document.querySelectorAll(`[posy="${16}"][posx="${6}"]`)[0].className = 'player';
                    } else {
                      //Move Forward
                      console.log("Move");
                      console.log(this.oldField[index][index2]);
                      this.field[index - 1][index2] = 3;
                      this.field[index][index2] = 99;
                      document.querySelectorAll(`[posy="${index - 1}"][posx="${index2}"]`)[0].className = 'ghost01';
                      document.querySelectorAll(`[posy="${index}"][posx="${index2}"]`)[0].className = 'backg';
                    }
                  }
                }
      }
    }
    this.CloneArray();
    for (let index = 0; index < this.oldField.length; index++) {
      for (let index2 = 0; index2 < this.oldField[index].length; index2++) {
                // Ghost02
                if (this.oldField[index][index2] === 7) {
                  // Left
                  if (this.ghost02Dir === 0) {
                    if (this.oldField[index][index2 + 1] === 0 || this.oldField[index][index2 + 1] >= 3 && this.oldField[index][index2 + 1] <= 9) {
                      //If hit Change direction
                      this.ghost02Dir = 1;
                    } else if (this.oldField[index][index2 + 1] === 2) {
                      // ToDo Player detection
                      console.log("Player hit");
        
                      this.lives--;
                      this.field[index][index2] = 99;
                      this.field[16][6] = 2;
                      this.field[index][index2 + 1] = 7;
                      document.querySelectorAll(`[posy="${index}"][posx="${index2 + 1}"]`)[0].className = 'ghost02';
                      document.querySelectorAll(`[posy="${index}"][posx="${index2}"]`)[0].className = 'backg';
                      document.querySelectorAll(`[posy="${16}"][posx="${6}"]`)[0].className = 'player';
                    } else {
                      //Move Forward
                      this.field[index][index2 + 1] = 7;
                      this.field[index][index2] = 99;
                      document.querySelectorAll(`[posy="${index}"][posx="${index2 + 1}"]`)[0].className = 'ghost02';
                      document.querySelectorAll(`[posy="${index}"][posx="${index2}"]`)[0].className = 'backg';
                    }
                  } else if (this.ghost02Dir === 1) {
                    if (this.oldField[index + 1][index2] === 0 || this.oldField[index + 1][index2] >= 3 && this.oldField[index + 1][index2] <= 9) {
                      //If hit Change direction
                      this.ghost02Dir = 2;
                    } else if(this.oldField[index + 1][index2] === 2){
                      // ToDo Player detection
                      console.log("Player hit");
        
                      this.lives--;
                      this.field[index][index2] = 99;
                      this.field[16][6] = 2;
                      this.field[index + 1][index2] = 7;
                      document.querySelectorAll(`[posy="${index + 1}"][posx="${index2}"]`)[0].className = 'ghost02';
                      document.querySelectorAll(`[posy="${index}"][posx="${index2}"]`)[0].className = 'backg';
                      document.querySelectorAll(`[posy="${16}"][posx="${6}"]`)[0].className = 'player';
                    }else {
                      //Move Forward
                      console.log("Move");
                      console.log(this.oldField[index][index2]);
                      this.field[index + 1][index2] = 7;
                      this.field[index][index2] = 99;
                      document.querySelectorAll(`[posy="${index + 1}"][posx="${index2}"]`)[0].className = 'ghost02';
                      document.querySelectorAll(`[posy="${index}"][posx="${index2}"]`)[0].className = 'backg';
                    }
                  } else if (this.ghost02Dir === 2) {
                    if (this.oldField[index][index2 - 1] === 0 || this.oldField[index][index2 - 1] >= 3 && this.oldField[index][index2 - 1] <= 9) {
                      //If hit Change direction
                      this.ghost02Dir = 3;
                    } else if(this.oldField[index][index2 - 1] === 2){
                      // ToDo Player detection
                      console.log("Player hit");
        
                      this.lives--;
                      this.field[index][index2] = 99;
                      this.field[16][6] = 2;
                      this.field[index][index2 - 1] = 7;
                      document.querySelectorAll(`[posy="${index}"][posx="${index2 - 1}"]`)[0].className = 'ghost02';
                      document.querySelectorAll(`[posy="${index}"][posx="${index2}"]`)[0].className = 'backg';
                      document.querySelectorAll(`[posy="${16}"][posx="${6}"]`)[0].className = 'player';
                    }else {
                      //Move Forward
                      this.field[index][index2 - 1] = 7;
                      this.field[index][index2] = 99;
                      document.querySelectorAll(`[posy="${index}"][posx="${index2 - 1}"]`)[0].className = 'ghost02';
                      document.querySelectorAll(`[posy="${index}"][posx="${index2}"]`)[0].className = 'backg';
                    }
                  } else {
                    if (this.oldField[index - 1][index2] === 0 || this.oldField[index - 1][index2] >= 3 && this.oldField[index - 1][index2] <= 9) {
                      //If hit Change direction
                      this.ghost02Dir = 0;
                    }else if(this.oldField[index - 1][index2] === 2){
                      // ToDo Player detection
                      console.log("Player hit");
        
                      this.lives--;
                      this.field[index][index2] = 99;
                      this.field[16][6] = 2;
                      this.field[index - 1][index2] = 7;
                      document.querySelectorAll(`[posy="${index - 1}"][posx="${index2}"]`)[0].className = 'ghost02';
                      document.querySelectorAll(`[posy="${index}"][posx="${index2}"]`)[0].className = 'backg';
                      document.querySelectorAll(`[posy="${16}"][posx="${6}"]`)[0].className = 'player';
                    } else {
                      //Move Forward
                      console.log("Move");
                      console.log(this.oldField[index][index2]);
                      this.field[index - 1][index2] = 7;
                      this.field[index][index2] = 99;
                      document.querySelectorAll(`[posy="${index - 1}"][posx="${index2}"]`)[0].className = 'ghost02';
                      document.querySelectorAll(`[posy="${index}"][posx="${index2}"]`)[0].className = 'backg';
                    }
                  }
                }
      }
    }
    this.CloneArray();
    for (let index = 0; index < this.oldField.length; index++) {
      for (let index2 = 0; index2 < this.oldField[index].length; index2++) {
                // Ghost03
                if (this.oldField[index][index2] === 8) {
                  // Left
                  if (this.ghost03Dir === 0) {
                    if (this.oldField[index][index2 + 1] === 0 || this.oldField[index][index2 + 1] >= 3 && this.oldField[index][index2 + 1] <= 9) {
                      //If hit Change direction
                      this.ghost03Dir = 1;
                    } else if (this.oldField[index][index2 + 1] === 2) {
                      // ToDo Player detection
                      console.log("Player hit");
        
                      this.lives--;
                      this.field[index][index2] = 99;
                      this.field[16][6] = 2;
                      this.field[index][index2 + 1] = 8;
                      document.querySelectorAll(`[posy="${index}"][posx="${index2 + 1}"]`)[0].className = 'ghost03';
                      document.querySelectorAll(`[posy="${index}"][posx="${index2}"]`)[0].className = 'backg';
                      document.querySelectorAll(`[posy="${16}"][posx="${6}"]`)[0].className = 'player';
                    }
                    else {
                      //Move Forward
                      this.field[index][index2 + 1] = 8;
                      this.field[index][index2] = 99;
                      document.querySelectorAll(`[posy="${index}"][posx="${index2 + 1}"]`)[0].className = 'ghost03';
                      document.querySelectorAll(`[posy="${index}"][posx="${index2}"]`)[0].className = 'backg';
                    }
                  } else if (this.ghost03Dir === 1) {
                    if (this.oldField[index + 1][index2] === 0 || this.oldField[index + 1][index2] >= 3 && this.oldField[index + 1][index2] <= 9) {
                      //If hit Change direction
                      this.ghost03Dir = 2;
                    } else if(this.oldField[index + 1][index2] === 2){
                      // ToDo Player detection
                      console.log("Player hit");
        
                      this.lives--;
                      this.field[index][index2] = 99;
                      this.field[16][6] = 2;
                      this.field[index + 1][index2] = 8;
                      document.querySelectorAll(`[posy="${index + 1}"][posx="${index2}"]`)[0].className = 'ghost03';
                      document.querySelectorAll(`[posy="${index}"][posx="${index2}"]`)[0].className = 'backg';
                      document.querySelectorAll(`[posy="${16}"][posx="${6}"]`)[0].className = 'player';
                    }else {
                      //Move Forward
                      console.log("Move");
                      console.log(this.oldField[index][index2]);
                      this.field[index + 1][index2] = 8;
                      this.field[index][index2] = 99;
                      document.querySelectorAll(`[posy="${index + 1}"][posx="${index2}"]`)[0].className = 'ghost03';
                      document.querySelectorAll(`[posy="${index}"][posx="${index2}"]`)[0].className = 'backg';
                    }
                  } else if (this.ghost03Dir === 2) {
                    if (this.oldField[index][index2 - 1] === 0 || this.oldField[index][index2 - 1] >= 3 && this.oldField[index][index2 - 1] <= 9) {
                      //If hit Change direction
                      this.ghost03Dir = 3;
                    } else if(this.oldField[index][index2 - 1] === 2){
                      // ToDo Player detection
                      console.log("Player hit");
        
                      this.lives--;
                      this.field[index][index2] = 99;
                      this.field[16][6] = 2;
                      this.field[index][index2 - 1] = 8;
                      document.querySelectorAll(`[posy="${index}"][posx="${index2 - 1}"]`)[0].className = 'ghost03';
                      document.querySelectorAll(`[posy="${index}"][posx="${index2}"]`)[0].className = 'backg';
                      document.querySelectorAll(`[posy="${16}"][posx="${6}"]`)[0].className = 'player';
                    }else {
                      //Move Forward
                      this.field[index][index2 - 1] = 8;
                      this.field[index][index2] = 99;
                      document.querySelectorAll(`[posy="${index}"][posx="${index2 - 1}"]`)[0].className = 'ghost03';
                      document.querySelectorAll(`[posy="${index}"][posx="${index2}"]`)[0].className = 'backg';
                    }
                  } else {
                    if (this.oldField[index - 1][index2] === 0 || this.oldField[index - 1][index2] >= 3 && this.oldField[index - 1][index2] <= 9) {
                      //If hit Change direction
                      this.ghost03Dir = 0;
                    } 	else if(this.oldField[index - 1][index2] === 2){
                      // ToDo Player detection
                      console.log("Player hit");
        
                      this.lives--;
                      this.field[index][index2] = 99;
                      this.field[16][6] = 2;
                      this.field[index - 1][index2] = 8;
                      document.querySelectorAll(`[posy="${index - 1}"][posx="${index2}"]`)[0].className = 'ghost03';
                      document.querySelectorAll(`[posy="${index}"][posx="${index2}"]`)[0].className = 'backg';
                      document.querySelectorAll(`[posy="${16}"][posx="${6}"]`)[0].className = 'player';
                    }else {
                      //Move Forward
                      console.log("Move");
                      console.log(this.oldField[index][index2]);
                      this.field[index - 1][index2] = 8;
                      this.field[index][index2] = 99;
                      document.querySelectorAll(`[posy="${index - 1}"][posx="${index2}"]`)[0].className = 'ghost03';
                      document.querySelectorAll(`[posy="${index}"][posx="${index2}"]`)[0].className = 'backg';
                    }
                  }
                }
      }
    }
    this.CloneArray();
    for (let index = 0; index < this.oldField.length; index++) {
      for (let index2 = 0; index2 < this.oldField[index].length; index2++) {

                // Ghost04
                if (this.oldField[index][index2] === 9) {
                  // Left
                  if (this.ghost04Dir === 0) {
                    if (this.oldField[index][index2 + 1] === 0 || this.oldField[index][index2 + 1] >= 3 && this.oldField[index][index2 + 1] <= 9) {
                      //If hit Change direction
                      this.ghost04Dir = 1;
                    } else if (this.oldField[index][index2 + 1] === 2) {
                      // ToDo Player detection
                      console.log("Player hit");
        
                      this.lives--;
                      this.field[index][index2] = 99;
                      this.field[16][6] = 2;
                      this.field[index][index2 + 1] = 9;
                      document.querySelectorAll(`[posy="${index}"][posx="${index2 + 1}"]`)[0].className = 'ghost04';
                      document.querySelectorAll(`[posy="${index}"][posx="${index2}"]`)[0].className = 'backg';
                      document.querySelectorAll(`[posy="${16}"][posx="${6}"]`)[0].className = 'player';
                    }
                    else {
                      //Move Forward
                      this.field[index][index2 + 1] = 9;
                      this.field[index][index2] = 99;
                      document.querySelectorAll(`[posy="${index}"][posx="${index2 + 1}"]`)[0].className = 'ghost04';
                      document.querySelectorAll(`[posy="${index}"][posx="${index2}"]`)[0].className = 'backg';
                    }
                  } else if (this.ghost04Dir === 1) {
                    if (this.oldField[index + 1][index2] === 0 || this.oldField[index + 1][index2] >= 3 && this.oldField[index + 1][index2] <= 9) {
                      //If hit Change direction
                      this.ghost04Dir = 2;
                    } else if(this.oldField[index + 1][index2] === 2){
                      // ToDo Player detection
                      console.log("Player hit");
        
                      this.lives--;
                      this.field[index][index2] = 99;
                      this.field[16][6] = 2;
                      this.field[index + 1][index2] = 9;
                      document.querySelectorAll(`[posy="${index + 1}"][posx="${index2}"]`)[0].className = 'ghost04';
                      document.querySelectorAll(`[posy="${index}"][posx="${index2}"]`)[0].className = 'backg';
                      document.querySelectorAll(`[posy="${16}"][posx="${6}"]`)[0].className = 'player';
                    }else {
                      //Move Forward
                      console.log("Move");
                      console.log(this.oldField[index][index2]);
                      this.field[index + 1][index2] = 9;
                      this.field[index][index2] = 99;
                      document.querySelectorAll(`[posy="${index + 1}"][posx="${index2}"]`)[0].className = 'ghost04';
                      document.querySelectorAll(`[posy="${index}"][posx="${index2}"]`)[0].className = 'backg';
                    }
                  } else if (this.ghost04Dir === 2) {
                    if (this.oldField[index][index2 - 1] === 0 || this.oldField[index][index2 - 1] >= 3 && this.oldField[index][index2 - 1] <= 9) {
                      //If hit Change direction
                      this.ghost04Dir = 3;
                    } else if(this.oldField[index][index2 - 1] === 2){
                      // ToDo Player detection
                      console.log("Player hit");
        
                      this.lives--;
                      this.field[index][index2] = 99;
                      this.field[16][6] = 2;
                      this.field[index][index2 - 1] = 9;
                      document.querySelectorAll(`[posy="${index}"][posx="${index2 - 1}"]`)[0].className = 'ghost04';
                      document.querySelectorAll(`[posy="${index}"][posx="${index2}"]`)[0].className = 'backg';
                      document.querySelectorAll(`[posy="${16}"][posx="${6}"]`)[0].className = 'player';
                    }else {
                      //Move Forward
                      this.field[index][index2 - 1] = 9;
                      this.field[index][index2] = 99;
                      document.querySelectorAll(`[posy="${index}"][posx="${index2 - 1}"]`)[0].className = 'ghost04';
                      document.querySelectorAll(`[posy="${index}"][posx="${index2}"]`)[0].className = 'backg';
                    }
                  } else {
                    if (this.oldField[index - 1][index2] === 0 || this.oldField[index - 1][index2] >= 3 && this.oldField[index - 1][index2] <= 9) {
                      //If hit Change direction
                      this.ghost04Dir = 0;
                    } 	else if(this.oldField[index - 1][index2] === 2){
                      // ToDo Player detection
                      console.log("Player hit");
        
                      this.lives--;
                      this.field[index][index2] = 99;
                      this.field[16][6] = 2;
                      this.field[index - 1][index2] = 9;
                      document.querySelectorAll(`[posy="${index - 1}"][posx="${index2}"]`)[0].className = 'ghost04';
                      document.querySelectorAll(`[posy="${index}"][posx="${index2}"]`)[0].className = 'backg';
                      document.querySelectorAll(`[posy="${16}"][posx="${6}"]`)[0].className = 'player';
                    }else {
                      //Move Forward
                      console.log("Move");
                      console.log(this.oldField[index][index2]);
                      this.field[index - 1][index2] = 9;
                      this.field[index][index2] = 99;
                      document.querySelectorAll(`[posy="${index - 1}"][posx="${index2}"]`)[0].className = 'ghost04';
                      document.querySelectorAll(`[posy="${index}"][posx="${index2}"]`)[0].className = 'backg';
                    }
                  }
                }
      }
    }


    this.double--;



    
    for (let index = 0; index < this.coins.length; index++) {
      for (let index2 = 0; index2 < this.coins[index].length; index2++) {
        if (this.coins[index][index2] === true && this.field[index][index2] === 99) {
          this.field[index][index2] = 1;
          document.querySelectorAll(`[posy="${index}"][posx="${index2}"]`)[0].className = 'pallet';
        }
      }
    }

    let areCoinsThere = false;
    for (let index = 0; index < this.coins.length; index++) {
      for (let index2 = 0; index2 < this.coins[index].length; index2++) {
        if (this.coins[index][index2] === true) {
          areCoinsThere = true;
        }
      }
    }

    if (this.lives === 0 || areCoinsThere === false) {
      this.StopGame();
    }
  }


  private CloneArray(): void {
    this.oldField = this.Create2DArray(this.height, this.width);
    for (let index = 0; index < this.field.length; index++) {
      for (let index2 = 0; index2 < this.field[index].length; index2++) {
        this.oldField[index][index2] = this.field[index][index2];
      }
    }
  }

  private SetCoins(): void {
    this.coins = [[false, false, false, false, false, false, false, false, false, false, false, false, false, false, false],
    [false, false, true, true, true, true, true, true, true, true, true, true, true, false, false],
    [false, true, false, false, false, true, false, true, false, false, false, true, false, true, false],
    [false, true, true, false, false, true, false, true, true, false, true, true, false, true, false],
    [false, true, true, false, true, false, false, false, true, false, true, false, false, true, false],
    [false, true, true, true, true, true, true, true, true, true, true, true, true, true, false],
    [false, true, false, true, true, true, true, true, false, false, false, true, false, true, false],
    [false, true, false, true, false, false, false, true, false, false, true, true, false, true, false],
    [false, true, false, true, false, false, false, true, false, false, true, true, false, true, false],
    [false, true, false, false, false, true, false, true, false, false, false, true, false, true, false],
    [false, true, true, true, true, true, true, true, true, true, true, true, true, true, false],
    [false, true, true, true, true, true, true, true, true, true, true, true, true, true, false],
    [false, true, false, false, true, false, true, true, true, true, false, true, false, true, false],
    [false, true, true, false, true, false, true, true, true, true, false, true, false, true, false],
    [false, true, true, false, true, false, false, true, true, true, false, true, false, true, false],
    [false, true, true, false, true, false, false, false, false, false, false, true, false, true, false],
    [false, true, true, true, true, true, false, true, true, true, true, true, true, true, false],
    [false, true, true, true, true, true, true, true, true, true, true, true, true, true, false],
    [false, true, false, false, false, true, false, true, false, false, false, true, false, true, false],
    [false, true, true, false, false, true, false, true, true, false, true, true, false, true, false],
    [false, true, true, false, true, false, false, false, true, false, true, false, false, true, false],
    [false, true, true, true, true, true, true, true, true, true, true, true, true, true, false],
    [false, true, false, true, true, true, true, true, false, false, false, true, false, true, false],
    [false, true, false, true, false, false, false, true, false, false, true, true, false, true, false],
    [false, true, false, false, false, false, false, true, false, false, true, true, false, true, false],
    [false, true, false, false, false, true, false, true, false, false, false, true, false, true, false],
    [false, true, true, true, true, true, true, true, true, true, true, true, true, true, false],
    [false, true, false, true, true, false, false, false, false, false, true, true, true, true, false],
    [false, false, true, true, true, true, true, true, true, true, true, false, true, false, false],
    [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false]];
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
