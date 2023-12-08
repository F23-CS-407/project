import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewDirectMessagesComponent } from './view-direct-messages.component';

describe('ViewDirectMessagesComponent', () => {
  let component: ViewDirectMessagesComponent;
  let fixture: ComponentFixture<ViewDirectMessagesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ViewDirectMessagesComponent]
    });
    fixture = TestBed.createComponent(ViewDirectMessagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
