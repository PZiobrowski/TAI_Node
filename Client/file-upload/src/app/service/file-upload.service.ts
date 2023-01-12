import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject, finalize } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {

  fileUploaded$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  loading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient, private _snackBar: MatSnackBar) { }

  uploadFile(data: File | null) {
    const file = (data == null) ? null : this._prepareData(data);
    this.http.post("http://localhost:3000/upload/no-encryption", file)
    .pipe()
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
    const file = (data == null) ? null : this._prepareData(data);
    this.http.post("http://localhost:3000/upload/encryption", file)
    .pipe()
    .subscribe({
      next: ((response) => {this.openToast("Udało się!")}),
      error: ((error) => {this.openToast("Wystąpił błąd!")})
    });
  }

  streamFileAES(data: File) {

  }


  openToast(message: string, duration?: number) {
    this._snackBar.open(message, 'Zamknij', {
      horizontalPosition: "right",
      verticalPosition: "top",
      duration: duration
    })
  }

  updateFileState(value: boolean) {
    this.fileUploaded$.next(value);
  }


  private _prepareData(data: File) {
    const formData = new FormData();
    formData.append("file", data);
    return formData
  }
}
