import { Component } from '@angular/core';
import { FileUploadService } from './service/file-upload.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
    fileName = '';
    file: File | null = null;
    constructor(private fileService: FileUploadService) {}

    onFileSelected(event: any) {
      const uploadedFile: File = event.target.files[0]
      if (uploadedFile) {
          this.file = uploadedFile;
          this.fileName = uploadedFile.name;
          this.fileService.uploadFile(this.file).subscribe((res) => console.log(res));
      }
    }
}
