import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { CommunityInterface } from '../interfaces/community'; 

@Injectable({
  providedIn: 'root',
})
export class CommunityService {
  private communitySubject = new BehaviorSubject<CommunityInterface>({} as CommunityInterface);
  public community = this.communitySubject.asObservable();
  private backend_addr: string = '/api';
  private loadingSubject = new BehaviorSubject<boolean>(true);
  public loading = this.loadingSubject.asObservable();

  constructor(private http: HttpClient) {}

  fetchCommunity(communityId: string): void {
    this.loadingSubject.next(true); // Indicate that loading has started
    this.http
      .get<CommunityInterface>(`${this.backend_addr}/community?id=${communityId}`)
      .pipe(catchError(this.handleError))
      .subscribe({
        next: (communityData) => {
          if (communityData) {
            this.communitySubject.next(communityData);
          } else {
            this.communitySubject.next({} as CommunityInterface);
          }
          this.loadingSubject.next(false); // Indicate that loading has finished
        },
        error: (error) => {
          console.error('Error fetching community:', error);
          this.communitySubject.next({} as CommunityInterface);
          this.loadingSubject.next(false); // Indicate that loading has finished
        },
      });
  }

  // other methods for community interactions still need to be tested
  createCommunity(name: string, description: string, mods: string[]): Observable<any> {
    const body = { name, description, mods };
    return this.http.post<any>(`${this.backend_addr}/create_community`, body)
      .pipe(catchError(this.handleError));
  }

  deleteCommunity(communityId: string): Observable<any> {
    const body = { community: communityId };
    return this.http.delete<any>(`${this.backend_addr}/community`, { body })
      .pipe(catchError(this.handleError));
  }

  searchCommunities(name: string): Observable<CommunityInterface[]> {
    return this.http.get<CommunityInterface[]>(`${this.backend_addr}/search_communities?name=${name}`)
      .pipe(catchError(this.handleError));
  }

  followCommunity(communityId: string): Observable<any> {
    const body = { id: communityId };
    return this.http.post<any>(`${this.backend_addr}/user/follow_community`, body)
      .pipe(catchError(this.handleError));
  }

  unfollowCommunity(communityId: string): Observable<any> {
    const body = { id: communityId };
    return this.http.post<any>(`${this.backend_addr}/user/unfollow_community`, body)
      .pipe(catchError(this.handleError));
  }

  isFollowingCommunity(communityId: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.backend_addr}/user/is_following_community?id=${communityId}`)
      .pipe(catchError(this.handleError));
  }

  getFollowedCommunities(userId: string): Observable<CommunityInterface[]> {
    return this.http.get<CommunityInterface[]>(`${this.backend_addr}/user/followed_communities?id=${userId}`)
      .pipe(catchError(this.handleError));
  }

  getCommunityBoards(communityId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.backend_addr}/community/boards?id=${communityId}`)
      .pipe(catchError(this.handleError));
  }

  getCommunityPosts(communityId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.backend_addr}/community/posts?community=${communityId}`)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      console.error('An error occurred:', error.error.message);
    } else {
      console.error(`Backend returned code ${error.status}, body was: ${error.error}`);
    }
    return throwError('Something bad happened; please try again later.');
  }
}
