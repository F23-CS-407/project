import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapCanvasComponent } from './map-canvas.component';

describe('MapCanvasComponent', () => {
  let component: MapCanvasComponent;
  let fixture: ComponentFixture<MapCanvasComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MapCanvasComponent]
    });
    fixture = TestBed.createComponent(MapCanvasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
