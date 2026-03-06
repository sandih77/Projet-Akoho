import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RaceForm } from './race-form';

describe('RaceForm', () => {
  let component: RaceForm;
  let fixture: ComponentFixture<RaceForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RaceForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RaceForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
