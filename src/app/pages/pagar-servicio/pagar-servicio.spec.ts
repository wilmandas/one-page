import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PagarServicio } from './pagar-servicio';

describe('PagarServicio', () => {
  let component: PagarServicio;
  let fixture: ComponentFixture<PagarServicio>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PagarServicio],
    }).compileComponents();

    fixture = TestBed.createComponent(PagarServicio);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
