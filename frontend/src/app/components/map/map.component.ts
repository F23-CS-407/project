import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import * as L from 'leaflet';
import { FileUploadService } from 'src/app/services/file-upload.service';
import { ActivatedRoute } from '@angular/router';

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
  private map: any;
  private currentOverlay: any;
  selectedFile: File | null = null;
  communityId: string | null = null;

  constructor(private fileUploadService: FileUploadService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.initMap();
    this.addClickEventListeners();
    this.getCommunityIdFromUrl();
  }

  private initMap(): void {
    this.map = L.map('leafletMap', {
      crs: L.CRS.Simple,
      minZoom: -5,
    });

    // Add any additional layers or configurations here
  }

  private getCommunityIdFromUrl(): void {
    this.route.queryParams.subscribe(params => {
      this.communityId = params['community'];
    });
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageSrc = e.target?.result as string;
        this.loadImageOverlay(imageSrc);
      };
      reader.readAsDataURL(file);
    }
  }

  uploadMap(): void {
    if (this.selectedFile && this.communityId) {
      this.fileUploadService.uploadCommunityMap(this.selectedFile, this.communityId)
        .subscribe({
          next: (response) => {
            // Handle successful upload
          },
          error: (error) => {
            // Handle error
          }
        });
    } else {
      // Handle case when no file is selected or community ID is not available
    }
  }

  private loadImageOverlay(imageUrl: string): void {
      if (this.currentOverlay) {
        this.currentOverlay.remove();
      }
    
      const containerHeight = 768;
      const containerWidth = 1366;
  
      const rawbounds : L.LatLngTuple[] = [[0, 0], [768, 1366]]
      const bounds = L.latLngBounds(rawbounds);
  
      this.currentOverlay = L.imageOverlay(imageUrl, bounds).addTo(this.map);

      // Does not allow you to drag outside of the max bounds of the map. (To test, zoom in on map and try to drag it offscreen, then let go of the drag)
      this.map.setMaxBounds(bounds);
      this.map.fitBounds(bounds);
  };

  private showPostFormPopup(latLng: L.LatLng): void {
    const popupContent = this.createPostFormHTML();
  
    const popup = L.popup({
      closeButton: true,  // Display close button
    })
      .setLatLng(latLng)
      .setContent(popupContent)
      .openOn(this.map);
  
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

