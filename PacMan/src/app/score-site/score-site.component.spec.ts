import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScoreSiteComponent } from './score-site.component';

describe('ScoreSiteComponent', () => {
  let component: ScoreSiteComponent;
  let fixture: ComponentFixture<ScoreSiteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScoreSiteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScoreSiteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
