import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RacesManager } from './races-manager';

describe('RacesManager', () => {
  let component: RacesManager;
  let fixture: ComponentFixture<RacesManager>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RacesManager]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RacesManager);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
