import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewPostComponent } from './new_post.component';

describe('PostComponent', () => {
  let component: NewPostComponent;
  let fixture: ComponentFixture<NewPostComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NewPostComponent]
    });
    fixture = TestBed.createComponent(NewPostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
