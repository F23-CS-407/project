import { Input, Component, ViewChild, ElementRef, AfterViewInit, HostListener } from '@angular/core';


@Component({
  selector: 'app-map-canvas',
  templateUrl: './map-canvas.component.html',
  styleUrls: ['./map-canvas.component.css']
})

export class MapCanvasComponent implements AfterViewInit {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  @HostListener('window:keydown.enter', ['$event'])

  @Input() edit : boolean = false;
  @Input() image! : HTMLImageElement;

  //Unnecessary this sprint, but including for the purposes of testing.
  @Input() gridSizeX : number = 0;
  @Input() gridSizeY : number = 0;

  //ViewChild depends on this
  ngAfterViewInit() {
    if(this.image) this.loadImage();
    else console.log("No image to load, need upload!");
  }

  test(){
    console.log("Edit called");
  }

  changeKeyboardPosition(event: KeyboardEvent)  {
    this.test(); // Call the test function
  }

  loadImage() {
  
    const canvas = this.canvasRef.nativeElement;
    const context = canvas.getContext('2d');

    const image = this.image;

    image.onload = () => {
      // Set canvas size to match image dimensions
      canvas.width = image.width;
      canvas.height = image.height;

      this.gridSizeX = image.width / 10;
      this.gridSizeY = image.height / 10;

      // Draw the image on the canvas
      if(context) {
        context.drawImage(image, 0, 0);

        //TODO: Draw images for posts on map. Show preview on hover,
        //Show posts on click. (Technically none of this is due this sprint)

        //Placeholder for handling basic edit features.
        if(this.edit) {
          this.drawGrid(context);
          canvas.addEventListener('click', (event)=>{
            const gridClick = this.getGridPosition(event);
            console.log(`Clicked on grid cell (${gridClick.gridX}, ${gridClick.gridY})`);
          });
        }
      }

      canvas.focus();
    };
  }

  //Draws the grid. Mostly for edit mode, but might be useful otherwise.
  drawGrid(context: CanvasRenderingContext2D){
    context.strokeStyle = 'rgba(0, 0, 0, 0.5)';
    context.lineWidth = 1;

    for (let x = 0; x < context.canvas.width; x += this.gridSizeX) {
      context.beginPath();
      context.moveTo(x, 0);
      context.lineTo(x, context.canvas.height);
      context.stroke();
    }

    for (let y = 0; y < context.canvas.height; y += this.gridSizeY) {
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(context.canvas.width, y);
      context.stroke();
    }
  }

  //Tells us which grid element was clicked on. Will be used with location editor.
  getGridPosition(event: MouseEvent){
    const { offsetX, offsetY } = event;
    const gridX = Math.floor(offsetX / this.gridSizeX);
    const gridY = Math.floor(offsetY / this.gridSizeY);
    return {gridX, gridY};
  }
}