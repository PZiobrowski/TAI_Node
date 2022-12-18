import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject, finalize } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {

  uploadLoading: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  encryptAESLoading: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  streamAESLoading: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  encryptRSALoading: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  streamRSALoading: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient, private _snackBar: MatSnackBar) { }

  uploadFile(data: File | null) {
    this.uploadLoading.next(true);
    const file = (data == null) ? null : this._prepareData(data);
    this.http.post("http://localhost:3000/upload/no-encryption", file)
    .pipe(finalize(() => this.uploadLoading.next(false)))
    .subscribe({
      next: ((response) => {this.openToast("Udało się!")}),
      error: ((error) => {this.openToast("Wystąpił błąd!")})
    });
  }

  encryptFileRSA(data: File) {

  }

  streamFileRSA(data: File) {

  }


  encryptFileAES(data: File | null) {
    this.uploadLoading.next(true);
    const file = (data == null) ? null : this._prepareData(data);
    this.http.post("http://localhost:3000/upload/encryption", file)
    .pipe(finalize(() => this.uploadLoading.next(false)))
    .subscribe({
      next: ((response) => {this.openToast("Udało się!")}),
      error: ((error) => {this.openToast("Wystąpił błąd!")})
    });
  }

  streamFileAES(data: File) {

  }


  openToast(message: string) {
    this._snackBar.open(message, 'Zamknij', {
      horizontalPosition: "right",
      verticalPosition: "top",
      duration: 3000
    })
  }


  private _prepareData(data: File) {
    const formData = new FormData();
    formData.append("file", data);
    return formData
  }
}
