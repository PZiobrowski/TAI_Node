import { HttpClient, HttpEventType } from '@angular/common/http';
import { Component, Input } from '@angular/core';
import { Subscription, finalize } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  @Input() requiredFileType:string = 'txt';

    fileName = '';
    uploadProgress:number = 0;
    uploadSub: Subscription = new Subscription;

    constructor(private http: HttpClient) {}

    onFileSelected(event: any) {
        const file:File = event.target.files[0];
        console.log(file);
        if (file) {
            this.fileName = file.name;
            const formData = new FormData();
            formData.append("thumbnail", file);

            const upload$ = this.http.post("/api/thumbnail-upload", formData, {
                reportProgress: true,
                observe: 'events'
            })
            .pipe(
                finalize(() => this.reset())
            );
          
            this.uploadSub = upload$.subscribe(event => {
              if (event.type == HttpEventType.UploadProgress) {
                if(event.total)
                this.uploadProgress = Math.round(100 * (event.loaded / event.total));
              }
            })
        }
    }

  cancelUpload() {
    this.uploadSub.unsubscribe();
    this.reset();
  }

  reset() {
    this.uploadProgress = 0;
    //this.uploadSub = null;
  }
}
