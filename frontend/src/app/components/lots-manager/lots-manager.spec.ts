import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LotsManager } from './lots-manager';

describe('LotsManager', () => {
  let component: LotsManager;
  let fixture: ComponentFixture<LotsManager>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LotsManager]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LotsManager);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
