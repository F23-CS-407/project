import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BugReportComponent } from './bug_report.component';

describe('BugReportComponent', () => {
  let component:BugReportComponent;
  let fixture: ComponentFixture<BugReportComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BugReportComponent]
    });
    fixture = TestBed.createComponent(BugReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
