import { Injectable } from '@angular/core';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';

@Injectable()
export class DatabaseProvider {

  readonly databaseName: string = 'galary.db';
  readonly imagesTable: string = 'images';

  constructor(private sqlite: SQLite) {}

    // Create DB if not there
    createDB() {
      return new Promise((resolve: any, reject: any)=>{
        this.sqlite.create({
          name: this.databaseName,
          location: 'default'
        }).then((db: SQLiteObject) => {
            resolve(db);
        }).catch(err => {
            reject(err);
        });
      })
    }

  // Create table
  async createGalaryTable(db: SQLiteObject, tableName: string) {
    await db.executeSql(`CREATE TABLE IF NOT EXISTS ${tableName} (pid INTEGER PRIMARY KEY, image TEXT, caption VARCHAR(255), added_at TIMESTAMP)`,[]).then(() => {}).catch(e => {alert("error " + JSON.stringify(e))});
  }

  // delete data by id
  async deleteById(db:SQLiteObject, tableName:string, id){
    await db.executeSql(`DELETE FROM ${tableName} WHERE pid = ${id}`, [])
    .then((res) => {
      alert("Row Deleted!");
    }).catch(err => {
      alert("error " + JSON.stringify(err));
    });
  }

}
