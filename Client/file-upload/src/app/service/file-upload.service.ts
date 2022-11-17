import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {

  constructor(private http: HttpClient) { }
  uploadFile(data: File) {
    const formData = new FormData();
    formData.append("file", data);
    return this.http.post("http://localhost:3000/upload/no-encryption", formData);
  }
}
