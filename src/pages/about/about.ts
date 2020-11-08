import { Component } from '@angular/core';
import { AlertController, NavController } from 'ionic-angular';
import { Camera, PictureSourceType} from '@ionic-native/camera';
import { DatabaseProvider } from '../../providers/database/database';
import { HomePage } from '../home/home';
import moment from 'moment';

@Component({
  selector: 'page-about',
  templateUrl: 'about.html'
})
export class AboutPage {

  recentlyAdded: any[] = [];
  databaseObj: any;

  validateThese: any = {
    base64Image: '',
    caption: ''
  }

  constructor(private alertCtrl: AlertController, public navCtrl: NavController, public camera: Camera, private db: DatabaseProvider) {

  }
  ngOnInit(){
    this.db.createDB().then((res: any)=>{
      this.databaseObj = res;
    }).catch(err =>{
      console.log(err);
    })
  }

  getPicture(sourceType: PictureSourceType) {
    this.camera.getPicture({
      quality: 5,
      destinationType: this.camera.DestinationType.DATA_URL,
      sourceType: sourceType,
      allowEdit: true,
      saveToPhotoAlbum: false,
      correctOrientation: true
    }).then((imageData) => {
      this.validateThese.base64Image = `data:image/jpeg;base64,${imageData}`;
    });
  }

  // when user doesnot want to upload
  cancelUpload(){
    this.navCtrl.parent.select(0).then(()=>{
      this.navCtrl.parent.getSelected().push(HomePage);
    });
  }

  // reset all fields
  resetFiles(){
    this.validateThese.base64Image = '';
    this.validateThese.caption = '';
  }

  // custom file upload
  // using file reader
  // in case user system not getting cordova

  //<!------------- Why this metod is not working -------------------->

  /* fileDirectUpload(e) {
      if (e.target.files && e.target.files[0]) {
        let file = e.target.files[0];
        var reader = new FileReader();
        reader.readAsDataURL(file); // read file as data url
        reader.onload = (event) => { // called once readAsDataURL is completed
          this.validateThese.base64Image = event.target.result;
        }
      }else{
        return;
      }
  } */

  // save new upload
  async validate(){
    if(this.validateThese.base64Image && this.validateThese.caption){
      // capation and image both are present
      // no problem just add
      this.saveData();
    }else if(this.validateThese.base64Image && !this.validateThese.caption){
      // image added but caption not added
      let alert = this.alertCtrl.create({
        title: 'No caption !!!', // we are trying to add caption
        message: 'Are you sure you don`t want to add a caption?',
        buttons: [
          {text: 'Cancel',role: 'cancel',handler: () => { console.log('Cancel clicked'); }},
          {text: 'Yes',handler: () => { this.saveData(); }}
        ]
      });
      alert.present();
    }else if(!this.validateThese.base64Image && !this.validateThese.caption){
      // no image and no caption
      let alert = this.alertCtrl.create({title: 'Nothing to save',subTitle: 'You need to add image and caption to save.',buttons: ['Dismiss']});
      alert.present();
    }else{
      // other cases 
      // in case failed
      let alert = this.alertCtrl.create({title: 'Something went wrong',subTitle: "I don't understand what you are trying to accomplish.",buttons: ['Dismiss']});
      alert.present();
    }
  }

  // after validating save the data
  saveData(){
    if(this.databaseObj){
      let time = moment().format();
      this.db.createGalaryTable(this.databaseObj, this.db.imagesTable).then((res: any)=>{
        this.databaseObj.executeSql(`
        INSERT INTO ${this.db.imagesTable} (image, caption, added_at) VALUES ('${this.validateThese.base64Image}', '${this.validateThese.caption}', '${time}')
      `, [])
        .then(() => {
          // save it in the array
          this.recentlyAdded.push({
            image: this.validateThese.base64Image,
            caption: this.validateThese.caption,
            time: time
          });
          // reset the view port
          this.resetFiles();
        })
        .catch(e => {
          let alert = this.alertCtrl.create({title: 'Could not save',subTitle: "Could not prepare a place to save images. Please retry later.",buttons: ['Dismiss']});
          alert.present();
        });
      })
    }else{
      let alert = this.alertCtrl.create({title: 'Could not save',subTitle: "Could not prepare a place to save images. Please retry later.",buttons: ['Dismiss']});
      alert.present();
    }
  }

  // format the date 
  // here will be the format you want 
  dateFormater(time, format){
    return moment(time).format(format);
  }

}
