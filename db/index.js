const { Pool } = require('pg');
const readline = require('readline');
// pools will use environment variables
// for connection information
const pool = new Pool({
  database: 'productsapi',
});
const fs = require('fs');

// Skus CSV Handler

const skusFilename = './server/skus.csv';

const skusReader = fs.createReadStream(skusFilename);
const skusRl = readline.createInterface({
  input: skusReader,
  crlfdelay: Infinity,
});
skusRl.on('line', (line) => {
  handleSkusLine(line);
});
let querySkusString = '';
let countSkus = 0;

let handleSkusLine = (line) => {
  line = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
  for (let j = 0; j < line.length; j += 1) {
    if (line[j][0] === '"') {
      line[j] = line[j].substr(1);
    }
    if (line[j][line[j].length - 1] === '"') {
      line[j] = line[j].substr(0, line[j].length - 1);
    }
    line[j] = line[j].replaceAll("'", "''");
  }

  querySkusString += `('${line[0]}', '${line[1]}', '${line[2]}', '${line[3]}'), `;
  countSkus += 1;
  if (countSkus === 1000) {
    querySkusString = querySkusString.substring(0, querySkusString.length - 2);

    pool.query(
      `INSERT INTO skus(sku_id, style_id, size, quantity) VALUES ${querySkusString}`,
      (skusErr, skusResult) => {
        if (skusErr) {
          console.error('Error executing query', skusErr.stack);
        }
        return skusResult;
      }
    );
    querySkusString = '';
    countSkus = 0;
  }
};
skusRl.on('close', () => {
  const extraSkusQuery = querySkusString.substring(0, querySkusString.length - 2);
  pool.query(
    `INSERT INTO skus(sku_id, style_id, size, quantity) VALUES ${extraSkusQuery}`,
    (err, result) => {
      if (err) {
        console.error('Error executing extra query', err.stack);
      }

      return result;
    }
  );
});

// Photo CSV Handler

const photosFilename = './server/photos.csv';

const photosReader = fs.createReadStream(photosFilename);
const photosRl = readline.createInterface({
  input: photosReader,
  crlfdelay: Infinity,
});
photosRl.on('line', (line) => {
  handlePhotosLine(line);
});
let queryPhotosString = '';
let countPhotos = 0;

const queryPhotosObj = {};
let handlePhotosLine = (line) => {
  line = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
  for (let j = 0; j < line.length; j += 1) {
    if (line[j][0] === '"') {
      line[j] = line[j].substr(1);
    }
    if (line[j][line[j].length - 1] === '"') {
      line[j] = line[j].substr(0, line[j].length - 1);
    }
    line[j] = line[j].replaceAll("'", "''");
  }

  if (queryPhotosObj[line[0]] === undefined) {
    queryPhotosString += `('${line[0]}', '${line[1]}', '${line[2]}', '${line[3]}'), `;
    countPhotos += 1;
    queryPhotosObj[line[0]] = 1;
  }

  if (countPhotos === 1000) {
    queryPhotosString = queryPhotosString.substring(
      0,
      queryPhotosString.length - 2
    );

    pool.query(
      `INSERT INTO photos(id, style_id, url, thumbnail_url) VALUES ${queryPhotosString}`,
      (photoErr, photoResult) => {
        if (photoErr) {
          console.error('Error executing first photos query', photoErr.stack);
        }
        return photoResult;
      }
    );
    queryPhotosString = '';
    countPhotos = 0;
  }
};
photosRl.on('close', () => {
  const extraPhotosQuery = queryPhotosString.substring(0, queryPhotosString.length - 2);
  if (extraPhotosQuery.length > 0) {
    pool.query(
      `INSERT INTO photos(id, style_id, url, thumbnail_url) VALUES ${extraPhotosQuery}`,
      (err, result) => {
        if (err) {
          console.error('Error executing extra photos query', err.stack);
        }

        return result;
      }
    );
  }
});

// Styles CSV Handler

const stylesFilename = './server/styles.csv';

const stylesReader = fs.createReadStream(stylesFilename);
const stylesRl = readline.createInterface({
  input: stylesReader,
  crlfdelay: Infinity,
});
stylesRl.on('line', (line) => {
  handleStylesLine(line);
});
let queryStylesString = '';
let countStyles = 0;

let handleStylesLine = (line) => {
  line = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
  for (let j = 0; j < line.length; j += 1) {
    if (line[j][0] === '"') {
      line[j] = line[j].substr(1);
    }
    if (line[j][line[j].length - 1] === '"') {
      line[j] = line[j].substr(0, line[j].length - 1);
    }
    line[j] = line[j].replaceAll("'", "''");
    if (line[j] === null) {
      line[j] = 'null';
    }
  }
  if (line[5] === 1) {
    line[5] = true;
  } else {
    line[5] = false;
  }

  queryStylesString += `('${line[0]}', '${line[1]}', '${line[2]}', '${line[3]}', '${line[4]}', '${line[5]}'), `;
  countStyles += 1;

  if (countStyles === 1000) {
    queryStylesString = queryStylesString.substring(0, queryStylesString.length - 2);
    pool.query(
      `INSERT INTO styles(style_id, product_id, name, sale_price, original_price, defaultstyle) VALUES ${queryStylesString}`,
      (stylesErr, stylesResult) => {
        if (stylesErr) {
          console.error("Error executing styles query", stylesErr.stack);
        }
        return stylesResult;
      }
    );
    queryStylesString = '';
    countStyles = 0;
  }
};
skusRl.on('close', () => {
  const extraStylesQuery = queryStylesString.substring(0, queryStylesString.length - 2);
  pool.query(
    `INSERT INTO styles(style_id, product_id, name, sale_price, original_price, defaultstyle) VALUES ${extraStylesQuery}`,
    (err, result) => {
      if (err) {
        console.error('Error executing extra query', err.stack);
      }

      return result;
    }
  );
});

// Feature CSV Handler
const featurePort = () => {
  const features = [];
  const values = [];
  let productFeaturesString = '';
  const productFeaturesArray = [];
  let countProductFeatures = 0;
  const featuresFilename = './server/features.csv';

  const featuresReader = fs.createReadStream(featuresFilename);
  const featuresRl = readline.createInterface({
    input: featuresReader,
    crlfdelay: Infinity,
  });
  featuresRl.on('line', (line) => {
    handleFeaturesLine(line);
  });

  let handleFeaturesLine = (line) => {
    line = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
    for (let j = 0; j < line.length; j += 1) {
      if (line[j][0] === '"') {
        line[j] = line[j].substr(1);
      }
      if (line[j][line[j].length - 1] === '"') {
        line[j] = line[j].substr(0, line[j].length - 1);
      }
      if (line.length === 3) {
        line.push('null');
      }
    }

    if (features.indexOf(line[2]) < 0) {
      features.push(line[2]);
    }
    if (values.indexOf(`'${line[3]}', (SELECT feature_id from features WHERE name= '${line[2]}') `) < 0 && line[3] !== 'null') {
      values.push(`'${line[3]}', (SELECT feature_id from features WHERE name= '${line[2]}') `);
    }
    if (line[3] !== 'null') {
      productFeaturesString += `('${line[1]}', (SELECT id from values WHERE value='${line[3]}' AND feature_id=(SELECT feature_id from features WHERE name= '${line[2]}')) ), `;
      countProductFeatures += 1;
    }
    if (countProductFeatures === 1000) {
      productFeaturesArray.push(productFeaturesString);
      productFeaturesString = '';
      countProductFeatures = 0;
    }
  };
  featuresRl.on('close', () => {
    const featureString = ` ('${features.join("'), ('")}')`;
    pool.query(
      `INSERT INTO features(name) VALUES ${featureString}`,
      (err, result) => {
        if (err) {
          console.error('Error executing query', err.stack);
        }
        let valueString = ` (${values.join("), (")})`;
        return pool.query(
          `INSERT INTO values(value, feature_id) VALUES ${valueString}`,
          (err, result) => {
            if (err) {
              console.error('Error executing query', err.stack);
            }
            for (let f = 0; f < productFeaturesArray.length; f += 1) {
              let productFeaturesQuery = productFeaturesArray[f].substring(0, productFeaturesArray[f].length - 2);
              pool.query(
                `INSERT INTO product_features(product_id, value_id) VALUES ${productFeaturesQuery}`,
                (err, result) => {
                  if (err) {
                    console.error('Error executing product features query', err.stack);
                  }

                  return result;
                }
              );
            }
            const extraProductFeaturesQuery = productFeaturesString.substring(0, productFeaturesString.length - 2);
            pool.query(
              `INSERT INTO product_features(product_id, value_id) VALUES ${extraProductFeaturesQuery}`,
              (err, result) => {
                if (err) {
                  console.error('Error executing extra product features query', err.stack);
                }

                return result;
              }
            );
            return result;
          }
        );
      }
    );
  });
};

// // Product CSV Handler
const categories = [];
const productFilename = './server/product.csv';

const productReader = fs.createReadStream(productFilename);
const productRl = readline.createInterface({
  input: productReader,
  crlfdelay: Infinity,
});
productRl.on('line', (line) => {
  handleProductLine(line);
});
let queryProductString = '';
let countProduct = 0;

const queryProductArray = [];
let handleProductLine = (line) => {
  line = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
  for (let j = 0; j < line.length; j += 1) {
    if (line[j][0] === '"') {
      line[j] = line[j].substr(1);
    }
    if (line[j][line[j].length - 1] === '"') {
      line[j] = line[j].substr(0, line[j].length - 1);
    }
    line[j] = line[j].replaceAll("'", "''");
  }

  if (categories.indexOf(line[4]) < 0) {
    categories.push(line[4]);
  }
  queryProductString += `('${line[0]}', '${line[1]}', '${line[2]}', '${line[3]}', (SELECT id from categories WHERE category_name= '${line[4]}'), '${line[5]}'), `;
  countProduct += 1;
  if (countProduct === 1000) {
    queryProductArray.push(queryProductString);
    queryProductString = '';
    countProduct = 0;
  }
};
productRl.on('close', () => {
  const categoryString = ` ('${categories.join("'), ('")}')`;

  pool.query(
    `INSERT INTO categories(category_name) VALUES ${categoryString}`,
    (err, result) => {
      if (err) {
        console.error('Error executing query', err.stack);
      }

      for (let i = 0; i < queryProductArray.length; i += 1) {
        const productString = queryProductArray[i].substring(0, queryProductArray[i].length - 2);
        pool.query(
          `INSERT INTO products(id, name, slogan, description, category_id, default_price) VALUES ${productString}`,
          (productErr, productResult) => {
            if (productErr) {
              console.error('Error executing query', productErr.stack);
            }
            return productResult;
          }
        );
      }
      const extraProductQuery = queryProductString.substring(0, queryProductString.length - 2);
      pool.query(
        `INSERT INTO products(id, name, slogan, description, category_id, default_price) VALUES ${extraProductQuery}`,
        (err, result) => {
          if (err) {
            console.error('Error executing extra query', err.stack);
          }
          featurePort();
          return result;
        }
      );
    }
  );
});

// Related CSV Handler
let relatedFilename = "./server/related.csv";

// Use fs.createReadStream() method
// to read the file

let relatedReader = fs.createReadStream(relatedFilename);
let relatedRl = readline.createInterface({
  input: relatedReader,
  crlfdelay: Infinity,
});
relatedRl.on("line", function (line) {
  handleRelatedLine(line);
});
let queryRelatedString = "";
let countRelated = 0;

let queryRelatedArray = [];
let handleRelatedLine = (line) => {
  line = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
  for (let j = 0; j < line.length; j += 1) {
    if (line[j][0] === '"') {
      line[j] = line[j].substr(1);
    }
    if (line[j][line[j].length - 1] === '"') {
      line[j] = line[j].substr(0, line[j].length - 1);
    }
  }
  queryRelatedString += `('${line[1]}', '${line[2]}'), `;
  countRelated += 1;
  if (countRelated === 1000) {
    // querySkusArray.push(querySkusString);
    queryRelatedString = queryRelatedString.substring(0, queryRelatedString.length - 2);
    // console.log('skusString:', querySkusString);
    pool.query(
      `INSERT INTO related(current_product_id, related_product_id) VALUES ${queryRelatedString}`,
      (nextErr, nextResult) => {
        if (nextErr) {
          console.error("Error executing query", nextErr.stack);
        }
      }
    );
    queryRelatedString = "";
    countRelated = 0;
  }
};
relatedRl.on('close', () => {
  const extraRelatedQuery = queryRelatedString.substring(0, queryRelatedString.length - 2);
  pool.query(
    `INSERT INTO related(current_product_id, related_product_id) VALUES ${extraRelatedQuery}`,
    (err, result) => {
      if (err) {
        console.error('Error executing extra query', err.stack);
      }

      return result;
    }
  );
});
