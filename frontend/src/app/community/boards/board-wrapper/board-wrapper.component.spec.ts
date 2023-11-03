import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoardWrapperComponent } from './board-wrapper.component';

describe('BoardWrapperComponent', () => {
  let component: BoardWrapperComponent;
  let fixture: ComponentFixture<BoardWrapperComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BoardWrapperComponent]
    });
    fixture = TestBed.createComponent(BoardWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
