import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { FileUploadService } from './service/file-upload.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
    fileName = '';
    file: File | null = null;

    uploadLoading$: Observable<boolean>;

    encryptRSALoading$: Observable<boolean>;
    streamRSALoading$: Observable<boolean>;

    encryptAESLoading$: Observable<boolean>;
    streamAESLoading$: Observable<boolean>;
    constructor(private fileService: FileUploadService) {
      this.uploadLoading$ = this.fileService.uploadLoading;

      this.encryptRSALoading$ = this.fileService.encryptRSALoading;
      this.streamRSALoading$ = this.fileService.streamRSALoading;

      this.encryptAESLoading$ = this.fileService.encryptAESLoading;
      this.streamAESLoading$ = this.fileService.streamAESLoading;
    }

    onDeleteFile() {
      this.file = null;
      this.fileName = '';
    }

    onFileSelected(event: any) {
      const uploadedFile: File = event.target.files[0]
      if (uploadedFile) {
          this.file = uploadedFile;
          this.fileName = uploadedFile.name;
      }
    }

    upload() {
      if(this._validateFile()) {
        this.fileService.uploadFile(this.file)
      }
    }

    encryptRSA() {
      if(this._validateFile()) {

      }
    }

    streamRSA() {
      if(this._validateFile()) {

      }
    }

    encryptAES() {
      if(this._validateFile()) {
        this.fileService.encryptFileAES(this.file)
      }
    }

    streamAES() {
      if(this._validateFile()) {

      }
    }

    private _validateFile() {
      if(!this.file) {
        this.fileService.openToast("Brak wybranego pliku!");
        return false;
      } else {
        return true;
      }
    }
}
