const express = require('express');

const cors = require('cors');

const morgan = require('morgan');

const model = require('./models');

const app = express();
const port = 3040;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(morgan('dev'));

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/loaderio-1405adb04de30017e8b7debe43c962c5', (req, res) => {
  console.log('the req', req);
  res.sendFile('loaderio-1405adb04de30017e8b7debe43c962c5.txt');
})

// GET all products
app.get('/products', (req, res) => {
  model.getAllProducts(req.query.page, req.query.count, (err, result) => {
    if (err) {
      console.log('getAllProducts controller error:', err);
      res.status(400).end();
    } else {
      res.send(result);
    }
  });
});

// // GET specific product
app.get('/products/:product_id', (req, res) => {
  model.getOneProduct(req.params.product_id, (err, result) => {
    if (err) {
      console.log('getOneProduct controller error:', err);
      res.status(400).end();
    } else {
      res.send(result);
    }
  });
});

// // GET specific product styles
app.get('/products/:product_id/styles', (req, res) => {
  model.getProductStyles(req.params.product_id, (err, result) => {
    if (err) {
      console.log('getStyles controller error:', err);
      res.status(400).end();
    } else {
      res.send(result);
    }
  });
});
// GET specific product related
app.get('/products/:product_id/related', (req, res) => {
  model.getRelatedProducts(req.params.product_id, (err, result) => {
    if (err) {
      console.log('getRelated controller error:', err);
      res.status(400).end();
    } else {
      res.send(result);
    }
  });
});

app.listen(port, () => {
  console.log(`We are LIVE at http://localhost:${port}`);
});

module.exports = app;
