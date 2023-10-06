import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HubitComponent } from './hubit.component';

describe('HubitComponent', () => {
  let component: HubitComponent;
  let fixture: ComponentFixture<HubitComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HubitComponent]
    });
    fixture = TestBed.createComponent(HubitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
