import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export class User {
  private static backend_addr: string = 'http://localhost:8080/api';
  private static http: HttpClient;

  private id: string = '-1';
  private username?: string = undefined;
  private email: string = '';
  private profile_pic: string = ''; // This will need to be type upload
  private bio: string = 'No Bio Yet';

  constructor(id: string) {
    this.id = id;
  }

  public get_id(): string {
    return this.id;
  }

  public get_username() {
    return this.username;
  }

  public set_username(new_username: string) {
    this.username = new_username;
  }

  public get_bio(): string {
    return this.bio;
  }

  private set_bio(new_bio: string) {
    this.bio = new_bio;
  }

  public static async get_current_user_data(): Promise<User> {
    const options = { withCredentials: true };

    await User.http
      .get<any>(User.backend_addr + '/user_info', options)
      .subscribe({
        next: (info_response) => {
          // On success
          let user: User = new User(info_response._id);
          user.set_username(info_response.username);

          return user;
        },
        error: (error) => {
          // On fail
          console.log('No session: ');
          console.log(error);
          return new User('-1');
        },
      });

    return new User('-2');
  }
}
