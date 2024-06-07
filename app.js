const express = require('express')
const app = express()
const handlebars = require('express-handlebars').engine
const bodyParser = require('body-parser')
//codigo tirado da documentação do firebase em: https://firebase.google.com/docs/firestore/quickstart?authuser=0&hl=pt#node.js_1
const { initializeApp, applicationDefault, cert } = require('firebase-admin/app')
const { getFirestore, Timestamp, FieldValue, Filter } = require('firebase-admin/firestore')
//colar o codigo baixado anteriormente entre ( )
const serviceAccount = require('desenvwebii-firebase-adminsdk-g4j0t-79110b24fd.json')
// continuação do codigo copiado da documentação
initializeApp({
    credential: cert(serviceAccount)
})

const db = getFirestore()

app.engine('handlebars', handlebars({ defaultLayout: 'main' }))
app.set('view engine', 'handlebars')

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.get('/', function (req, res) {
    res.render('primeira_pagina')
})

app.get('/editar/:id', async function (req, res) {
    try {
        const docRef = db.collection('pessoas').doc(req.params.id);
        const doc = await docRef.get();
        if (!doc.exists) {
            console.log("No such document!")
            res.status(404).send("Documento não encontrado")
        } else {
            res.render("editar", { id: req.params.id, pessoa: doc.data() });
        }
    } catch (error) {
        console.error("Error getting document: ", error);
        res.status(500).send("Erro ao buscar documento")
    }
});

app.post('/atualizar/:id', async function(req, res){
    try{
       
       const edit = db.collection('pessoas').doc(req.params.id);
       await edit.update({
           nome: req.body.nome,
           telefone: req.body.telefone,
           origem: req.body.origem,
           data_contato: req.body.data_contato,
           observacao: req.body.observacao
       });
       console.log('documento atualizado');
       res.redirect('/consulta')
   
    } catch(error){
       console.error("erro", error);
       res.status(500).send("erro ao buscar");
    }
   }
   );

app.post('/cadastrar', function (req, res) {
    var pessoas = db.collection('pessoas').add({
        nome: req.body.nome,
        telefone: req.body.telefone,
        origem: req.body.origem,
        data_contato: req.body.data_contato,
        observacao: req.body.observacao
    }).then(function () {
        console.log('Pessoa cadastrada com sucesso!')
        res.redirect('/')
    })
})

app.get("/consulta", async function (req, res) {
    try {
        const dataSnapshot = await db.collection('pessoas').get();
        const data = [];
        dataSnapshot.forEach((doc) => {
            data.push({
                id: doc.id,
                nome: doc.get('nome'),
                telefone: doc.get('telefone'),
                origem: doc.get('origem'),
                data_contato: doc.get('data_contato'),
                observacao: doc.get('observacao'),
            });
        });

app.get("/excluir/:id", async function (req, res){
    try {
        await db.collection('pessoas').doc(req.params.id).delete();
        console.log('Documento excluido com sucesso!');
        res.redirect('/consulta');
    } catch (error) {
        console.error("Error deleting document: ", error);
        res.status(500).send("Error ao excluir documento");
    }
});

        // Renderiza a página Handlebars e passa os dados
        res.render('consulta', { pessoas: data });
    } catch (error) {
        res.status(500).send('Error retrieving data: ' + error.message);
    }
});


app.listen(8081, function () {
    console.log('Servidor Ativo!')
})