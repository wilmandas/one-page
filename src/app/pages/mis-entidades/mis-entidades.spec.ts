import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MisEntidades } from './mis-entidades';

describe('MisEntidades', () => {
  let component: MisEntidades;
  let fixture: ComponentFixture<MisEntidades>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MisEntidades],
    }).compileComponents();

    fixture = TestBed.createComponent(MisEntidades);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
