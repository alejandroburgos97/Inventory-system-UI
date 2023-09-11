import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment'; 

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private serviceUrl = environment.serviceUrl;

  constructor(private http: HttpClient) {}

  private handleError(error: any) {
    return throwError(error);
  }

  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.serviceUrl}/users`).pipe(
      catchError(this.handleError)
    );
  }
}


