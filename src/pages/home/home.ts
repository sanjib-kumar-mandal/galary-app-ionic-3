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
  filter: any = {
    filterView: false,
    filters: {
      text: '',
      sort: 'date',
      order: 'asc'
    }
  }
  filteredImages: any[] = [];
  allImages: any[] = [
    {
      pid: 1,
      image: 'https://picsum.photos/id/237/536/354',
      caption: 'here I Am',
      added_at: '2020-10-08T21:47:00+05:30'
    },
    {
      pid: 2,
      image: 'https://www.talkwalker.com/images/2020/blog-headers/image-analysis.png',
      caption: 'Seperate me',
      added_at: '2020-09-08T21:47:00+05:30'
    },
    {
      pid: 3,
      image: 'https://www.publicdomainpictures.net/pictures/320000/nahled/background-image.png',
      caption: 'collection added',
      added_at: '2020-11-08T21:47:00+05:30'
    },
    {
      pid: 4,
      image: 'https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885__340.jpg',
      caption: 'freak show',
      added_at: '2020-07-08T21:47:00+05:30'
    },
  ];

  constructor(private navCtrl: NavController,private db: DatabaseProvider, private alertCtrl: AlertController) {}

  async ngOnInit(){
    await this.getAllImages();
    this.filterInstade();
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
      let alert = this.alertCtrl.create({title: 'Could not find place',subTitle: 'Could not find any place.',buttons: ['Dismiss']});
      alert.present();
    })
  }

  // filter here
  filterInstade(){
    // when no data found
    if(this.allImages.length == 0){
      return;
    }
    let filteredData = [];
    // filter by text
    let searchText = this.filter.filters.text.toLowerCase();
    filteredData = searchText ? this.allImages.filter(function(cations) {return cations.caption.toLowerCase().includes(searchText);}) : this.allImages;
    // sorting
    let sortBy = this.filter.filters.sort; // which field is sorting
    let orderBy = this.filter.filters.order; // in which order
    switch (orderBy){
      case 'asc':
        this.filteredImages = filteredData.sort((a, b) => (a[sortBy] > b[sortBy]) ? 1 : -1);
        break;
      case 'desc':
        this.filteredImages = filteredData.sort((a, b) => (a[sortBy] > b[sortBy]) ? -1 : 1);
        break;
      default:
        this.filteredImages = filteredData;
        break;
    }
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
  // when pull refresh cals
  doRefresh(refresher) {
    this.getAllImages();
    setTimeout(() => {
      refresher.complete();
    }, 2000);
  }
  // page targettings
  toAddImage(){
    this.navCtrl.parent.select(1).then(()=>{
      this.navCtrl.parent.getSelected().push(AboutPage);
    });
  }
}
