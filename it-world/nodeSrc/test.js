const {sql} = require('./mySqlClass')

const _sql = new sql('127.0.0.1','root','root','parsedate');


/*
select * from parsedate.course  where parsedate.course.nameCourse regexp 'PHP'
 or parsedate.course.typeCourse regexp 'PHP';

select * from parsedate.datafromitworld  where parsedate.datafromitworld.Title regexp 'apple' or  parsedate.datafromitworld.Content regexp 'apple' ;


 */


async function arra  (str,arr){
    //let a = arr[0];
  // let arr1 =
      return   _sql.sqlQuery(str,arr)
    //let arr2 = _sql.sqlQuery(str,arr)
    //console.log(arr1[0])
    //console.log(arr2[0]);
}
let text = "" + " CREATE PROCEDURE books ()" +
    "  begin" +
    " DECLARE cost INT DEFAULT 45;" +
    "   WHILE cost <= 50 DO" +
    "     " +
    "select cost ,count(*) from coments_data where news_id=cost;" +
    "     SET cost = cost + 1;" +
    "   END WHILE ;" +
    "  " +
    "" +
    "" +
    "CALL books ()"
async function dada (){
       let json_result= await arra('call comments ( 45,50 );')

       // let json_result = JSON.stringify(result[0])
        console.log(typeof  json_result)
        json_result[0].map(data=>{
                if(Array.isArray(data)){
                        console.log(data[0])
                }
        })

}
dada()

//arra("select * from parsedate.datafromitworld  where parsedate.datafromitworld.Title regexp ? or  parsedate.datafromitworld.Content regexp ? ;",['apple','apple'] )
 //   .then(data=>/{
 //       console.log(data[0])
 //   })