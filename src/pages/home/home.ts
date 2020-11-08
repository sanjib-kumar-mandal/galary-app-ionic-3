import { Component } from '@angular/core';
import { SQLiteObject } from '@ionic-native/sqlite';
import { AlertController, NavController } from 'ionic-angular';
import moment from 'moment';
import { DatabaseProvider } from '../../providers/database/database';
import { AboutPage } from '../about/about';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  viewMode: string = 'grid';
  dbObject: SQLiteObject;
  allImages: any[] = [];

  constructor(private navCtrl: NavController,private db: DatabaseProvider, private alertCtrl: AlertController) {}

  ngOnInit(){
    this.getAllImages();
  }

  // get all images that are saved
  async getAllImages(){
    this.db.createDB().then(async (db: SQLiteObject)=>{
      this.dbObject = db;
      await this.db.createGalaryTable(db, this.db.imagesTable);
      db.executeSql(`SELECT * FROM '${this.db.imagesTable}' ORDER BY 'added_at' DESC`, []).then((res: any)=>{
        if (res.rows.length > 0) {
          for (var i = 0; i < res.rows.length; i++) {
            this.allImages.push(res.rows.item(i));
          }
        }
      }).catch(err =>{
        let alert = this.alertCtrl.create({title: 'Something went wrong',subTitle: 'We couldn`t understand what went wrong. Please retry.',buttons: ['Dismiss']});
        alert.present();
      })
    }).catch(() =>{
      let alert = this.alertCtrl.create({title: 'Could not find place',subTitle: 'Could not find any place where we saved the images.',buttons: ['Dismiss']});
      alert.present();
    })
  }
  // delete selected image
  deleteImage(index){
    let imageId = this.allImages[index].pid;
    this.db.deleteById(this.dbObject, this.db.imagesTable, imageId).then((res: any)=>{
      // deleted successfully
      this.allImages.slice(index, 1); // delete from array
    }).catch(err =>{
      // deleting error
      let alert = this.alertCtrl.create({title: 'Something went wrong',subTitle: "Couldn`t delete there was an error deleting the image.",buttons: ['Dismiss']});
      alert.present();
    })
  }
  // format date
  dateFormater(date, format){
    return moment(date).format(format);
  }
  // page targettings
  toAddImage(){
    this.navCtrl.parent.select(1).then(()=>{
      this.navCtrl.parent.getSelected().push(AboutPage);
    });
  }
}
