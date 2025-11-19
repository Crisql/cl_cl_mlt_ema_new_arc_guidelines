import { Injectable } from "@angular/core";
import { Camera } from "@ionic-native/camera/ngx";

@Injectable({
  providedIn: "root",
})
export class CameraService {
  constructor(private camera: Camera) {}

  async TakePhoto() {
    return this.camera
      .getPicture({
        quality: 60,
        destinationType: this.camera.DestinationType.DATA_URL,
        encodingType: this.camera.EncodingType.JPEG,
        mediaType: this.camera.MediaType.PICTURE,
      })
      .then(
        (imageData) => {
          // let base64Image = "data:image/jpeg;base64," + imageData;
          return imageData;
        },
        (err) => {
          console.log(err);
          return null;
        }
      );
  }
}
