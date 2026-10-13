import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnviarDinero } from './enviar-dinero';

describe('EnviarDinero', () => {
  let component: EnviarDinero;
  let fixture: ComponentFixture<EnviarDinero>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EnviarDinero],
    }).compileComponents();

    fixture = TestBed.createComponent(EnviarDinero);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
