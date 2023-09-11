import { HttpClient, HttpParams } from '@angular/common/http';
import { Product } from 'src/domain/product';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment'; // Import the environment

@Injectable({
  providedIn: 'root',
})
export class ProductService {
    private serviceUrl = environment.serviceUrl;

  constructor(private http: HttpClient) {}

  private handleError(error: any) {
    return throwError(error);
  }

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.serviceUrl}/products`).pipe(
      catchError(this.handleError)
    );
  }

  getProductsFiltered(name: string, userEntered: string, dateEntered: Date): Observable<Product[]> {
    let params = new HttpParams();

    if (name) {
      params = params.set('name', name);
    }
    if (userEntered) {
      params = params.set('userEntered', userEntered);
    }
    if (dateEntered) {
      params = params.set('dateEntered', dateEntered.toISOString());
    }

    return this.http
      .get<Product[]>(`${this.serviceUrl}/products`, { params })
      .pipe(catchError(this.handleError));
  }

  addProduct(product: Product): Observable<Product> {
    return this.http.post<Product>(`${this.serviceUrl}/products`, product).pipe(
      catchError(this.handleError)
    );
  }

  updateProduct(product: Product): Observable<Product> {
    return this.http.put<Product>(`${this.serviceUrl}/products/${product.id}`, product).pipe(
      catchError(this.handleError)
    );
  }

  deleteProduct(productId: number, userId: string): Observable<void> {
    const url = `${this.serviceUrl}/products/${productId}?userId=${userId}`;
    return this.http.delete<void>(url).pipe(catchError(this.handleError));
  }
}
