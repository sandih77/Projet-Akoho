import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LotsForm } from './lots-form';

describe('LotsForm', () => {
  let component: LotsForm;
  let fixture: ComponentFixture<LotsForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LotsForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LotsForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
