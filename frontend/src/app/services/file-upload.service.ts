import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {
  private backend_addr: string = '/api';
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading = this.loadingSubject.asObservable();

  constructor(private http: HttpClient) { }

  getFileByName(fileName: string): Observable<Blob> {
    console.log("Getting file by name: " + fileName);
    return this.http.get(`${this.backend_addr}/upload/${fileName}`, { responseType: 'blob' });
  }

  getUserUploads(userId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.backend_addr}/user/uploads?id=${userId}`);
  }

  uploadFile(file: File): Observable<any> {
    return this.upload(file, '/upload');
  }

  uploadClip(file: File, captions: File): Observable<any> {
    return this.upload(file, '/upload/clip', captions);
  }

  uploadProfilePic(file: File): Observable<any> {
    return this.upload(file, '/upload/profile_pic');
  }

  uploadCommunityBanner(file: File, communityId: string): Observable<any> {
    return this.upload(file, `/upload/community_banner?id=${communityId}`);
  }

  uploadCommunityMap(file: File, communityId: string): Observable<any> {
    return this.upload(file, `/upload/map?id=${communityId}`);
  }

  private upload(file: File, endpoint: string, captions?: File): Observable<any> {
    this.loadingSubject.next(true);
    const formData = new FormData();
    formData.append("file", file, file.name);
    
    if (captions) {
      formData.append("captions", captions, captions.name);
    }

    return this.http.post(`${this.backend_addr}${endpoint}`, formData, { withCredentials: true })
      .pipe(
        catchError(this.handleError),
        finalize(() => this.loadingSubject.next(false))
      );
  }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      console.error('An error occurred:', error.error.message);
    } else {
      console.error(`Backend returned code ${error.status}, body was: ${error.error}`);
    }
    return throwError('Unable to upload file, please try again later.');
  }
}
