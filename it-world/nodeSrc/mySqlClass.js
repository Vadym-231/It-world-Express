const mySql = require('mysql2/promise');
//import sanitizer from 'node-mysql'
const  sanitizer = require('sanitizer');
class sql{
    conn;
    constructor(host,pass,name,db) {
        this.conn=mySql.createPool({
            host:host,
            user:name,
            database:db,
            password:pass,
            waitForConnections:true,
            connectionLimit:10,
            queueLimit:0
        });
    }
     sqlQuery(str,arr=[]){

        let strResult = sanitizer.sanitize(str);
        if(arr.length>0){
            for(let i=0;i<arr.length;i++){
                arr[i]=sanitizer.sanitize(arr[i]);
            }
            return this.conn.query(strResult,arr)
        }
        return this.conn.query(strResult);
    }
}
module.exports= {sql};