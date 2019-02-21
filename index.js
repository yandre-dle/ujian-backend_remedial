const express = require('express');
var bodyParser = require('body-parser');
const mysql = require('mysql');
const crypto = require('crypto')
const cors = require('cors');

const app = express();
const port = 1984;

const conn = mysql.createConnection({
    host : 'localhost',
    user : 'dle',
    password : 'abc12345',
    database : 'hotelbertasbih',
    port: 3306
});

app.use(cors())
app.use(bodyParser.json())


app.get('/', (req,res) => {
    res.send('<h1>Selamat Datang di API / Ujian Backend Remedial JC07  / { Yandri Reuter } </h1>')
})

//User Login, berdasarkan email dan password
app.get('/users', function(req,res){
    const cipher = crypto.createHmac("sha256", "okeh !!!")
    .update(req.query.password)
    .digest("hex");
    console.log(cipher)

    sql = `SELECT id, username, email, role FROM tableuser WHERE email = "${req.query.email}" AND password = "${cipher}"`
    conn.query(sql, (err,results)=>{
        if(err) throw err;
        console.log(results[0])
        if(results.length === 0){
            res.send({error: "E-mail tidak ada || password salah"})
        }
        else{
            res.send({...results[0], status:"Login berhasil bro"})
        }
    })
})

//Keep login check from cookies
app.get('/keeplogin', function(req,res){
    sql = `SELECT id, username, email, role FROM tableuser WHERE email = "${req.query.email}"`
    conn.query(sql, (err,results)=>{
        if(err) throw err;
        console.log(results[0])
        res.send({...results[0], status:"Keep Login Successful"})
    })
})

//Register new user
app.post('/users', function(req,res){
    const cipher = crypto.createHmac("sha256", secret)
    .update(req.body.password) 
    .digest("hex");

    var data = {
        username : req.body.username,
        email : req.body.email,
        password : cipher,
        role : req.body.role
    }

    sql = `SELECT * FROM tableuser WHERE username = '${data.username}' OR email = '${data.email}'` //check for existing username or email
    sql1 = `INSERT INTO tableuser SET ?` 
    conn.query(sql, (err,results)=>{
        if(err) throw err
        console.log(results.length)
        if(results.length == 0){
            conn.query(sql1, data, (err1,results1)=>{
                if(err1) throw err1;
                console.log(results1)
                res.send({id: results1.insertId, username: req.body.username, email: req.body.email, role: req.body.role, status:"Registration Succesful"})
            })
        }
        else{
            res.send({error:"username/email already exists"})
        }
    })
})

//Get list kamar, bisa filter berdasarkan category
app.get('/kamar', function(req,res){

    if(req.query.categoryid === undefined || req.query.categoryid === ""){
        sql = `SELECT * FROM tablekamar`
    }
    else{
        sql = `SELECT * FROM tablekamar WHERE categoryid=${req.query.categoryid}`
    }
    
    conn.query(sql, (err,results)=>{
        if(err) throw err;
        console.log(results)
        res.send(results)
    })
})

//membuat kamar//
app.post('/kamar', function(req,res){
    data = {
        nomorkamar: req.body.nomorkamar,
        categoryid: req.body.categoryid,
        harga: req.body.harga
    }
    sql = `INSERT INTO tablekamar SET ?`
    conn.query(sql, data, (err,results)=>{
        if(err) throw err;
        console.log(results)
        res.send({status:"Create kamar success", insertId: results.insertId, nomorkamar: req.body.nomorkamar, categoryid:req.body.categoryid, harga:req.body.harga})
    })
})

//Update data kamar berdasarkan id
app.put('/kamar/:id', function(req,res){  
    sql = `UPDATE tablekamar SET ? WHERE id=${req.params.id}`
    conn.query(sql, req.body, (err,results)=>{
        if(err) throw err;
        console.log(results)
        res.send({status:"Update kamar sukses", id: req.params.id, updatedRows:results.changedRows})
    })
})

//Delete kamar berdasarkan id
app.delete('/kamar/:id', function(req,res){

    sql = `DELETE FROM tablekamar WHERE id=${req.params.id}`
    conn.query(sql, (err,results)=>{
        if(err) throw err;
        console.log(results)
        if(results.affectedRows == 0){
            res.send({error:"ID kamar tidak ada"})
        }
        else{
            res.send({status:"Delete kamar success", id: req.params.id, updatedRows:results.changedRows})
        } 
    })
})

//Get List Category
app.get('/category', function(req,res){
    sql = `SELECT * FROM tablecategory`  
    conn.query(sql, (err,results)=>{
        if(err) throw err;
        console.log(results)
        res.send(results)
    })
})

//Create category
app.post('/category', function(req,res){
    data = {
        namacategory: req.body.namacategory
    }
    sql = `INSERT INTO tablecategory SET ?`
    conn.query(sql, data, (err,results)=>{
        if(err) throw err;
        console.log(results)
        res.send({status:"Create category success", insertId: results.insertId, namacategory: req.body.namacategory})
    })
})

//Update category berdasarkan id
app.put('/category/:id', function(req,res){
    data = {
        namacategory: req.body.namacategory
    }
    sql = `UPDATE tablecategory SET ? WHERE id=${req.params.id}`
    conn.query(sql, data, (err,results)=>{
        if(err) throw err;
        console.log(results)
        res.send({status:"Update category success", id: req.params.id, updatedRows:results.changedRows})
    })
})

//Delete category berdasarkan id, dan semua kamar yang memiliki categoryid yang sama
app.delete('/category/:id', function(req,res){

    sql = `DELETE FROM tablecategory WHERE id=${req.params.id}`
    sql1 = `DELETE FROM tablekamar WHERE categoryid=${req.params.id}`
    conn.query(sql, (err,results)=>{
        if(err) throw err;
        console.log(results)
        if(results.affectedRows == 0){
            res.send({error:"Category ID does not exist"})
        }
        conn.query(sql1, (err1,results1)=>{
            if(err1) throw err1;
            console.log(results1)
            res.send({status:"Delete category success", categoryId: req.params.id, jumlahDeleteKamar: results1.affectedRows})
        })
    })
})


app.listen(port, () => console.log('API aktif di port ' + port))