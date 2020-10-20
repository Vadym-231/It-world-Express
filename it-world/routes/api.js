const express = require('express');
const router = express.Router();
const {fileGetter} = require('../nodeSrc/file_geter')
const fetch = require('node-fetch')
const path = require('path')
const cookie = require('cookie')
const {sql} = require('../nodeSrc/mySqlClass')
const _sql = new sql('127.0.0.1','root','root','parsedate');

function nextGetter(req,res){
  if(Number(req.params.IdNext)){
    if(req.params.typeOfData==='news'){
      dataGetter((Number(req.params.IdNext)-4),Number(req.params.IdNext),req,res,req.params.typeOfData);
    }
    if(req.params.typeOfData==='courses'){
      dataGetter((Number(req.params.IdNext)-4),Number(req.params.IdNext),req,res,req.params.typeOfData);
    }
  }
}

async function searchFunction(req,res,str){
  let result=[];
  console.log(str);
  let a = await _sql.sqlQuery("select * from parsedate.course  where parsedate.course.nameCourse regexp ? or parsedate.course.typeCourse regexp ? ;",[str,str] );
  let b = await _sql.sqlQuery("select * from parsedate.datafromitworld  where parsedate.datafromitworld.Title regexp ? or  parsedate.datafromitworld.Content regexp ? ;",[str,str] )

  result=a[0].concat(b[0])
  result.sort(() => Math.random() - 0.5);
  res.send(JSON.stringify(result))
  //shuffle
  //console.log(a)


  //console.log(a[0])

}
function processing_array_of_news_data(arrBlock,  arrayComments){
  try {
    for (let i = 0; i < arrBlock.length; i++) {
      arrayComments.map(data => {
        if (data.cost === arrBlock[i].id) {
          arrBlock[i].comments = data["count(*)"]
        }
      })
    }
    return arrBlock;
  }catch (err) {
    console.log(err)
  }

}
async function dataGetter(numbFirs=0,numbEnd=0,req,res,type=''){
  try {
    let sql_result, str, maxIdResult, typeOfData = "",comments_arr;
    switch (type) {
      case "news":
        typeOfData = " parsedate.datafromitworld ";
        break;
      case "courses":
        typeOfData = " parsedate.course ";
        break;
      default:
        res.send(JSON.stringify([]))
        return;
    }
    if (numbFirs === 0 && numbEnd === 0) {
      maxIdResult = await _sql.sqlQuery("select max(id) from " + typeOfData + ";")
      str = "select * from " + typeOfData + " where id between " + (Number(maxIdResult[0][0]['max(id)']) - 5) + " and " + maxIdResult[0][0]['max(id)'] + ";";
      comments_arr= await get_number_of_comments((Number(maxIdResult[0][0]['max(id)']) - 5),maxIdResult[0][0]['max(id)'] ).catch(err=>{
        console.log(err)
      })
    } else {
      if(numbFirs >=0 && numbEnd >= 0){
        str = "select * from " + typeOfData + " where id between " + numbFirs + " and " + numbEnd + ";";
        comments_arr = await get_number_of_comments(numbFirs,numbEnd).catch(err=>{
          console.log(err)
        });
      }else {
        res.send(JSON.stringify([]))
        return;
      }
    }
    sql_result = await _sql.sqlQuery(str);
    res.send(JSON.stringify(processing_array_of_news_data(sql_result[0],comments_arr)))
  }catch (error) {
    console.log(error)
  }
}
async function get_number_of_comments(firs,last){
  if(firs<last) {
    let result_arr = [], comment_data = await _sql.sqlQuery('call comments ( ?,? );', [firs, last]);
    comment_data[0].map(data => {
      if (Array.isArray(data)) {
        result_arr.push(data[0])
      }
    })
    return result_arr;
  }
  else {
    new Error('Last<First or anything is "undefined" type')
  }
}
async function commenting_anything(req,res,json){
  try {
    //console.log(JSON.parse(json))
    json =JSON.parse(json)

    console.log(typeof json.user_id+' '+' '+typeof json.token)
    if (typeof json.user_id !== 'undefined'  && json.token.length > 0 && typeof json.token !== 'undefined') {
      let result_check_token = await fetch('https://graph.facebook.com/' + json.user_id + '/permissions?access_token=' + json.token).then(data => {
        console.log(data)
        if (data.ok) {
          return data.json()
        }
      })
     // console.log(  result_check_token)
      if (typeof result_check_token !== 'undefined' && typeof json.id !== 'undefined' && typeof json.comment !== 'undefined' && typeof json.user !== 'undefined'
          && typeof json.img_src !== 'undefined'
      ) {
        
        try {

          let sqlQuery = await _sql.sqlQuery('insert into parsedate.coments_data(news_id,coment_data,name_comenter,src_on_facebook,img_src) values(?,?,?,?,?);',
              [json.id, json.comment, json.user, 'https://www.facebook.com/' + json.user_id, json.img_src])

        }catch (err){
          res.statusCode=404;
          res.end()
          console.log(err)
        }

      } else {
        console.log('Invalid token')
         new Error('Invalid token')
      }
    } else {
      console.log('Bad data')
       new Error('Bad data')
    }
  }catch (err){
    res.statusCode=404;
    res.end()
    console.log(err)
  }

}
async function auth_checker(req,res,data){
  let result_check_token = await fetch('https://graph.facebook.com/'+data.id+'/permissions?access_token='+data.accessToken).then(data,err=>{if(data.ok){
    return data.json()
  }})
  if(typeof result_check_token!=='undefined') {
    console.log(data.picture.data.url)
    res.setHeader('Set-Cookie', cookie.serialize('Auth', {
      username:data.name,
      token:data.accessToken,
      user_id: data.id,
      src_header_img:data.picture.data.url
    }), {
      httpOnly: true,
      secure: false,
      maxAge: 60 * 60 * 24  // 1 week
    });
    res.statusCode = 302;
    res.setHeader('Location', req.headers.referer || '/');
    res.end();
    let result = await _sql.sqlQuery('select * from  parsedate.user_data  where name =?;', [data.name])
    if (result[0].length === 0) {
        _sql.sqlQuery('insert into parsedate.user_data (name,family,acces_token,src_facebook_img,src_facebook_account) values(?,?,?,?,?);',
            [data.name, data.name, data.accessToken, data.picture.data.url, 'https://www.facebook.com/id=' + data.id])
    }
  }else {
    res.statusCode(404)
  }
}
async function get_comments(req,res,id){
  try {
    if(Number(id)) {
      let result = await _sql.sqlQuery('select * from parsedate.coments_data where news_id = ?;', [Number(id)])
      res.send(JSON.stringify(result[0]))
    }else {
      new Error('ID is not number')
    }
  }catch (e) {
    console.log(e)
  }
}
/* GET users listing. */
router.get('/home/:typeOfData/:page',(req,res)=>  {

  if(Number(req.params.page)){
    if(req.params.typeOfData==='news'){
      dataGetter(0,0,req,res,req.params.typeOfData).catch(err=>{
        console.log(err)
      });
    }
    if(req.params.typeOfData==='courses'){
      dataGetter(0,0,req,res,req.params.typeOfData).catch(err=>{
        console.log(err)
      });
    }
  }
})
router.use((req, res, next) => {
  //console.log(req.session)
  next()
})
router.get('/search/search=:searchStr',    (req,res)=>{
  searchFunction(req,res,req.params.searchStr).catch(err=>{
    console.log(err)
  })
})
router.get(RegExp('/logo$'),(req,res)=>{
  fileGetter(res,path.join(__dirname,'../public/images/logo.png'),'img');
})
router.get('/giveMeStyle',(req,res)=>{
  fileGetter(res,path.join(__dirname,'../public/stylesheets/style.css'),'text/css').pipe(res);
})
router.get('/next/:typeOfData/:IdNext',(req, res) => {
  nextGetter(req,res)
})
router.get('/block/next/:typeOfData/:IdNext',(req, res) => {
  nextGetter(req,res)
})
router.post('/authorize',(req,res)=>{
  auth_checker(req,res,req.body).catch(err=>{
    console.log(err)
  })
})
router.get('/comments/:ID_BLOCK',(req, res) => {
  get_comments(req,res,Number(req.params.ID_BLOCK))
})
router.get('/username',(req, res) => {
  try {
    const cookies = cookie.parse(req.headers.cookie || '');
    let error_messenge =JSON.stringify({code:403,userName:''})
    if((typeof cookies !== 'undefined')&&(typeof  cookies.Auth!=='undefined')){
      console.log(cookies.Auth)
      const Auth = JSON.parse(cookies.Auth)
      if(Auth.token.length>50&&typeof Auth.token !=="undefined"&&Auth.username.length>10&&typeof Auth.username!=="undefined"){
       res.send(JSON.stringify({code:200,userName:Auth.username,src_head:Auth.src_header_img}))
      }else {
        res.send(error_messenge)
      }
    }else {
      res.send(error_messenge)
    }
  }catch (err){
    console.log(err)
  }
})
router.post('/commenting',(req, res) => {
  const cookies = cookie.parse(req.headers.cookie || '');
  try {
    if (typeof cookies !== 'undefined') {
      const Auth = JSON.parse(cookies.Auth)
      if (typeof Auth !== 'undefined') {
        commenting_anything(req, res,
            JSON.stringify({
              id: req.body.idNews,
              comment: req.body.commentData,
              user: Auth.username,
              token: Auth.token,
              user_id: Auth.user_id,
              img_src: Auth.src_header_img
            }))
      } else {
        console.log('Bad cookies')
        new Error('Bad cookies')
      }
    } else {
      console.log('Haven`t cookies')
      new Error('Haven`t cookies')
    }
  }catch (err) {
    res.statusCode=404;
    res.end()
    console.log(err)
  }
})
router.get('/searchIco',(req,res)=>{
  fileGetter(res,path.join(__dirname,'../public/images/search.png'),'img')
})
router.get('/bundle.js',(req,res)=>{
  fileGetter(res,path.join('C:\\Users\\Вадим\\WebstormProjects\\FilmSile\\dist\\bundle.js'),'text/javascript').pipe(res)
})
//__dirname,'../nodeSrc/bundle.js'
//'C:\\Users\\Вадим\\WebstormProjects\\FilmSile\\dist\\bundle.js'

module.exports = router;
