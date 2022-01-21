const { Pool } = require('pg');

const pool = new Pool({
  database: 'productsapi',
});
module.exports = {

  getAllProducts: (page, count, callback) => {
    if (page !== '0') {
      pool.query(`SELECT * FROM products ORDER BY id LIMIT ${count} OFFSET ${(page * count) - count}`, (err, result) => {
        if (err) {
          console.log('get all Products Error:', err);
        }
        callback(null, result.rows);
      });
    } else {
      pool.query(`SELECT * FROM products ORDER BY id LIMIT ${count}`, (err, result) => {
        if (err) {
          console.log('get all Products Error:', err);
        }
        callback(null, result.rows);
      });
    }
  },
  getOneProduct: (product_id, callback) => {
    let productObj = {};
    pool.query(`SELECT * FROM products WHERE id =${product_id}`)
      .then((result) => {
        productObj = result.rows[0];
      })
      .catch((error) => {
        console.log('get One Product Error:', error);
      });
    pool.query(`SELECT feature, value FROM product_features INNER JOIN values on product_features.value_id=values.id INNER JOIN features on values.feature_id=features.feature_id WHERE product_id=${product_id}`)
      .then((result) => {
        productObj.features = result.rows;
      })
      .then(() => {
        callback(null, productObj);
      })
      .catch((error) => {
        console.log('get One Product features Error:', error);
      });
  },
  getProductStyles: (product_id, callback) => {
    let styleObj = {
      product_id: `${product_id}`,
    };
    pool.query(`SELECT * FROM styles WHERE product_id=${Number(styleObj.product_id)}`)
      .then((result) => {
        styleObj.results = result.rows;
      })
      .then(() => {
        for (let i = 0; i < styleObj.results.length; i += 1) {
          if (styleObj.results[i].sale_price === 'null') {
            styleObj.results[i].sale_price = '0';
          }

          pool.query(`SELECT * FROM skus WHERE style_id=${styleObj.results[i].style_id}`)
            .then((result) => {
              styleObj.results[i].skus = {};
              result.rows.forEach((row) => {
                styleObj.results[i].skus[row.sku_id] = {
                  quantity: row.quantity,
                  size: row.size,
                };
              });
            })
            .then(() => {
              pool.query(`SELECT thumbnail_url, url FROM photos WHERE style_id=${styleObj.results[i].style_id}`)
                .then((result) => {
                  styleObj.results[i].photos = result.rows;
                })
                .then(() => {
                  if (i === styleObj.results.length - 1) {
                    callback(null, styleObj);
                  }
                })
                .catch((error) => {
                  console.log('get photos Error:', error);
                });
            })
            .catch((error) => {
              console.log('get Skus Error:', error);
            });
        }
      })
      .catch((error) => {
        console.log('get Styles error:', error);
      });
  },
  getRelatedProducts: (product_id, callback) => {
    pool.query(`SELECT related_product_id FROM related WHERE current_product_id=${product_id}`, (err, result) => {
      if (err) {
        console.log('get Related Error:', err);
      }
      console.log('this is our result!', result.rows);
      const relatedArray = [];
      result.rows.forEach((row) => {
        relatedArray.push(row.related_product_id);
      });
      callback(null, relatedArray);
    });
  },

};
