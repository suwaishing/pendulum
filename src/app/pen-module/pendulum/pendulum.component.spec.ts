import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PendulumComponent } from './pendulum.component';

describe('PendulumComponent', () => {
  let component: PendulumComponent;
  let fixture: ComponentFixture<PendulumComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PendulumComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PendulumComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
