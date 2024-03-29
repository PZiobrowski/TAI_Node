import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject, finalize } from 'rxjs';
import { saveAs } from 'file-saver';

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {

  fileUploaded$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  uploadedFileName$: BehaviorSubject<string> = new BehaviorSubject<string>("");
  loading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient, private _snackBar: MatSnackBar) { }

  uploadFile(data: File | null) {
    this.loading$.next(true);
    const file = (data == null) ? null : this._prepareData(data);
    this.http.post("http://localhost:3000/upload/no-encryption", file)
    .pipe(finalize(() => this.loading$.next(false)))
    .subscribe({
      next: ((response: any) => {
        this.openToast(`Udało się! Czas - ${response.data.time}ms`);
        this.fileUploaded$.next(true);
        this.uploadedFileName$.next(response.data.name);
      }),
      error: ((error) => {this.openToast("Wystąpił błąd!")})
    });
  }

  downloadFile() {
    this.loading$.next(true);
    const formData = new FormData();
    formData.append("fileName", this.uploadedFileName$.getValue());
    this.http.post("http://localhost:3000/download", formData, {responseType: "blob"})
    .pipe(finalize(() => this.loading$.next(false)))
    .subscribe({
      next: ((response: any) => {
        this.openToast('Udało się!');
        saveAs(response, this.uploadedFileName$.getValue());
      }),
      error: ((error) => {this.openToast("Wystąpił błąd!")})
    });
  }

  encryptFile(data: File | null, type: string) {
    this.loading$.next(true);
    const file = (data == null) ? null : this._prepareData(data, type);
    this.http.post("http://localhost:3000/upload/encryption", file)
    .pipe(finalize(() => this.loading$.next(false)))
    .subscribe({
      next: ((response: any) => {
        this.openToast(`Udało się! Czas - ${response.data.time}ms`);
        this.fileUploaded$.next(true);
        this.uploadedFileName$.next(response.data.name);
      }),
      error: ((error) => {this.openToast("Wystąpił błąd!")})
    });
  }

  decryptFile(data: File | null, type: string) {
    this.loading$.next(true);
    const file = (data == null) ? null : this._prepareData(data, type);
    this.http.post("http://localhost:3000/upload/decryption", file)
    .pipe(finalize(() => this.loading$.next(false)))
    .subscribe({
      next: ((response: any) => {
        this.openToast(`Udało się! Czas - ${response.data.time}ms`);
      }),
      error: ((error) => {this.openToast("Wystąpił błąd!")})
    });
  }

  encryptStream(data: File | null, type: string) {
    this.loading$.next(true);
    const file = (data == null) ? null : this._prepareData(data, type);
    this.http.post("http://localhost:3000/upload/encryption-stream", file)
    .pipe(finalize(() => this.loading$.next(false)))
    .subscribe({
      next: ((response: any) => {
        this.openToast(`Udało się! Czas - ${response.data.time}ms`);
        this.fileUploaded$.next(true);
        this.uploadedFileName$.next(response.data.name);
      }),
      error: ((error) => {this.openToast("Wystąpił błąd!")})
    });
  }

  decryptStream(data: File | null, type: string) {
    this.loading$.next(true);
    const file = (data == null) ? null : this._prepareData(data, type);
    this.http.post("http://localhost:3000/upload/decryption-stream", file)
    .pipe(finalize(() => this.loading$.next(false)))
    .subscribe({
      next: ((response: any) => {
        this.openToast(`Udało się! Czas - ${response.data.time}ms`);
      }),
      error: ((error) => {this.openToast("Wystąpił błąd!")})
    });
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

  private _prepareData(data: File, type?: string) {
    const formData = new FormData();
    formData.append("file", data);
    if(type) {
      formData.append('algorithm', type);
    }
    return formData
  }
}
