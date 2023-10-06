import { Component } from '@angular/core';
import { ColdObservable } from 'rxjs/internal/testing/ColdObservable';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.css']
})
export class PostComponent {
  chip_options: Chip[] = [new Chip("green", "General"), new Chip("yellow", "Question"), new Chip("red", "Clip") ];
}

class Chip {
  color: string = "red";
  text: string = "";
  constructor(color: string, text: string) {
    this.color = color;
    this.text = text;
  }
}
