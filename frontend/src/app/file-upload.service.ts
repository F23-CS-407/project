import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {
  // https://www.geeksforgeeks.org/angular-file-upload/#:~:text=Open%20src/app/file%2Dupload/%20and%20start%20editing%20file%2Dupload.service.ts%20file
  constructor(private http : HttpClient) { }

  // Returns an observable object from HttpClient.post
  upload(file: File) : Observable<any> {
    // Create for data
    const formData = new FormData();

    // Storm form name as "file" with file data
    formData.append("file", file, file.name);

    // Send to backend (TODO: Update endpoint when created)
    return this.http.post("/api/profile_pic", formData);
  }

}
