import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { UserInterface } from '../interfaces/user';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private userSubject = new BehaviorSubject<UserInterface>({} as UserInterface);
  public user = this.userSubject.asObservable();

  constructor(private http: HttpClient) {}

  fetchUserProfile(): void {
    this.http.get<UserInterface>('/api/user_info').subscribe({
      next: (userData) => {
        this.updateUser(userData);
      },
      error: (error) => {
        console.error('Error fetching user profile:', error);
      }
    });
  }

  updateUser(userData: Partial<UserInterface>): void {
    const currentUserData = this.userSubject.getValue();
    const updatedUserData = { ...currentUserData, ...userData };
    this.userSubject.next(updatedUserData);
  }
}
