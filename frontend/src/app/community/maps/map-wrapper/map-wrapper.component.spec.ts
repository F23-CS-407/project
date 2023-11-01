import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapWrapperComponent } from './map-wrapper.component';

describe('MapWrapperComponent', () => {
  let component: MapWrapperComponent;
  let fixture: ComponentFixture<MapWrapperComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MapWrapperComponent]
    });
    fixture = TestBed.createComponent(MapWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
