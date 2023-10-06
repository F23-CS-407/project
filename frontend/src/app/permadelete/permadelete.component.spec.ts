import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PermadeleteComponent } from './permadelete.component';

describe('PermadeleteComponent', () => {
  let component: PermadeleteComponent;
  let fixture: ComponentFixture<PermadeleteComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PermadeleteComponent]
    });
    fixture = TestBed.createComponent(PermadeleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
