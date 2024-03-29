import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { GameComponent } from './game/game.component';
import { ScoreSiteComponent } from './score-site/score-site.component';


const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login', },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent},
  {path: 'game', component: GameComponent},
  {path: 'scoresite', component: ScoreSiteComponent},
  { path: '**', component: LoginComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: true})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
