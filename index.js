const express = require('express')
const app = express()
const port = 3000

app.get('/', (req, res) => {
  res.send('Backend loding...')
})


//Users management API

app.get('/users/:id', (req, res) => {
  res.send(req.params)
})

app.get('/users', (req, res) => {
  res.send('Get all users')
})

app.post('/users', (req, res) => {
  res.send('Post users')
})

app.put('/users', (req, res) => {
  res.send(`Update users`)
})

app.delete('/users', (req, res) => {
  res.send(`Delete users`)
})



//Products management API
app.get('/products', (req, res) => {
  res.send('Get all products')
})

app.post('/products', (req, res) => {
  res.send('Post products') 
})

app.put('/products', (req, res) => {
  res.send(`Update products`)
})

app.delete('/products', (req, res) => {
  res.send(`Delete products `)
})


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

