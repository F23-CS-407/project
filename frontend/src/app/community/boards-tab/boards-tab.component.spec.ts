import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoardsTabComponent } from './boards-tab.component';

describe('BoardsTabComponent', () => {
  let component: BoardsTabComponent;
  let fixture: ComponentFixture<BoardsTabComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BoardsTabComponent]
    });
    fixture = TestBed.createComponent(BoardsTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
