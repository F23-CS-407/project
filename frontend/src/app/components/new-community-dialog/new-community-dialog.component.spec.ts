import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewCommunityDialogComponent } from './new-community-dialog.component';

describe('NewCommunityDialogComponent', () => {
  let component: NewCommunityDialogComponent;
  let fixture: ComponentFixture<NewCommunityDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NewCommunityDialogComponent],
    });
    fixture = TestBed.createComponent(NewCommunityDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
