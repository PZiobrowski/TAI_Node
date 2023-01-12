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
    fileUploaded$: Observable<boolean> = this.fileService.fileUploaded$;
    loading$: Observable<boolean> = this.fileService.loading$;
    constructor(private fileService: FileUploadService) {}

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

    download() {
      this.fileService.downloadFile();
    }

    encrypt(type: string) {
      if(this._validateFile()) {
        this.fileService.encryptFile(this.file, type);
      }
    }

    decrypt(type: string) {
      if(this._validateFile()) {
        this.fileService.decryptFile(this.file, type);
      }
    }

    streamEncrypt(type: string) {
      if(this._validateFile()) {

      }
    }

    streamDecrypt(type: string) {
      if(this._validateFile()) {

      }
    }

    private _validateFile() {
      if(!this.file) {
        this.fileService.openToast("Brak wybranego pliku!", 3000);
        return false;
      } else {
        return true;
      }
    }
}
