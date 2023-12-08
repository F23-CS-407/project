import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import * as L from 'leaflet';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
})

//TODO: General todos here are that we need to iterate through posts of this community, find the ones with location data, and save them into a local variable
//that, when updated, will create markers that can be clicked on to show the contents of the posts.

//For sprint 6, filtering tags, we can probably have a text area that lets you edit the query such that only posts with the given tags are populated. Then, would likely
//need to redraw the map (or hold information on all the created markers, but the former sounds faster to implement) and create the markers again.

//There is an accessibility feature that allows screen readers to read alt text from the created markers as well, seems pretty simple to implement and can probably be included
//based on the post information or perhaps adding an alt-text field to the post creation.

//This branch does not have map image uploading set up. ITA I will try to add it before review. We also need a way to navigate to maps that are created through the board
//creation page. I have a component like that in the map-features branch, which was used last sprint, but am concerned that the new frontend routing may not mesh well with it.
//(For testing purposes, I've been navigating to this test map via the link /hubit/map, which I set up in the hubit-routing.module.ts file)

export class MapComponent implements OnInit {
  @ViewChild('leafletMapContainer', { static: true }) mapContainer!: ElementRef;
  
  private map: any;
  private currentOverlay: any;

  constructor() {}

  ngOnInit(): void {
    this.initMap();
    this.addClickEventListeners();
  }

  private initMap(): void {
    this.map = L.map('leafletMap').setView([0, 0], 2);

    // Add any additional layers or configurations here
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageSrc = e.target?.result as string;
        this.loadImageOverlay(imageSrc);
      };
      reader.readAsDataURL(file);
    }
  }

  private loadImageOverlay(imageUrl: string): void {
    if (this.currentOverlay) {
      this.currentOverlay.remove();
    }
    
    const containerHeight = 768;
    const containerWidth = 1366;
  
    const image = new Image();
    image.src = imageUrl;
  
    image.onload = () => {
      const imageAspectRatio = image.width / image.height;
  
      let overlayWidth, overlayHeight, bounds;
  

      //This is the best way I could figure to adjust the aspect ratio of the image.
      //Could not make this perfect, still stretches images in bizarre ways but it doesn't horribly skew it like before.

      if (imageAspectRatio > 1) {
        // Image is wider than tall (landscape)
        overlayWidth = containerWidth;
        overlayHeight = containerWidth / imageAspectRatio;
        bounds = L.latLngBounds([
          [-overlayHeight / 2, -overlayWidth / 2],   // Southwest corner
          [overlayHeight / 2, overlayWidth / 2]     // Northeast corner
        ]);
      } else {
        // Image is taller than wide (portrait)
        overlayHeight = containerHeight;
        overlayWidth = containerHeight * imageAspectRatio;
        bounds = L.latLngBounds([
          [-overlayHeight / 2, -overlayWidth / 2],   // Southwest corner
          [overlayHeight / 2, overlayWidth / 2]     // Northeast corner
        ]);
      }
  
      this.currentOverlay = L.imageOverlay(imageUrl, bounds).addTo(this.map);

      // Does not allow you to drag outside of the max bounds of the map. (To test, zoom in on map and try to drag it offscreen, then let go of the drag)
      this.map.setMaxBounds(bounds);

      //This was an attempt to fix the default zoom. It doesn't seem to work.
      const maxZoom = this.map.getBoundsZoom(bounds, false);
      this.map.setView(this.map.getCenter(), maxZoom);
      this.map.fitBounds(bounds, {
        animate: false,
      });
    };
  }

  private showPostFormPopup(latLng: L.LatLng): void {
    const popupContent = this.createPostFormHTML();
  
    const popup = L.popup({
      closeButton: true,  // Display close button
    })
      .setLatLng(latLng)
      .setContent(popupContent)
      .openOn(this.map);
  
    // Optionally, you can add event listeners to handle form submission
    const submitButton = document.getElementById('submitPostButton');
    if (submitButton) {
      submitButton.addEventListener('click', () => {
        this.handlePostSubmission(popup, latLng);
      });
    }
  
    // Close the popup when clicking outside the popup
    this.map.on('click', () => {
      popup.remove();
    });
  }

  //Quick and dirty form for post submision. Did it this way since I was working with a javascript library.
  private createPostFormHTML(): string {
    return `
      <div>
        <label for="postContent">Post Content:</label>
        <input type="text" id="postContent" placeholder="Enter post content" required>
  
        <br>
  
        <label for="tag">Tag (Optional):</label>
        <input type="text" id="tag" placeholder="Enter tag">
  
        <br>
  
        <button id="submitPostButton">Submit</button>
      </div>
    `;
  }

  private addClickEventListeners(): void {
    this.map.on('click', (event: L.LeafletMouseEvent) => {
      const latLng = event.latlng;
      this.showPostFormPopup(latLng);
    });
  }

  private handlePostSubmission(popup: L.Popup, latLng: L.LatLng): void {
    const postContentInput = document.getElementById('postContent') as HTMLInputElement;
    const tagInput = document.getElementById('tag') as HTMLInputElement;
  
    const postContent = postContentInput.value;
    const tag = tagInput.value;
  
    //TODO: Given these values, send post request to community to create new post.
    //Will also need to send longitude and latitude. This means when routing.
    //During routing, need to know the community ID. Should be able to get the user ID of the logged in user for a new post.
    //Easiest way might be to edit the schema for posts to have lng and latitude data. 
    
    let lat = latLng.lat;
    let lng = latLng.lng; //Location data

    //Creates a marker where you clicked.
    const marker = L.marker(latLng).addTo(this.map);

    // Sets the marker's popup with post information. Could be made into a component that shows more detailed information.
    marker.bindPopup(`
      <strong>Post Content:</strong> ${postContent}<br>
      <strong>Tag:</strong> ${tag || 'No tag provided'}
    `).openPopup();
  
    popup.remove();
  }
  
}

