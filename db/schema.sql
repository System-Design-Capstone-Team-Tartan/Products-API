DROP DATABASE  IF EXISTS  productsapi;

CREATE DATABASE productsapi;

\c productsapi;

DROP TABLE IF EXISTS features CASCADE;
CREATE TABLE IF NOT EXISTS features (
	feature_id serial PRIMARY KEY NOT NULL,
	feature VARCHAR ( 50 ) UNIQUE NOT NULL
);

DROP TABLE IF EXISTS values CASCADE;
CREATE TABLE IF NOT EXISTS values (
  id serial PRIMARY KEY NOT NULL,
  value VARCHAR ( 50 )  NOT NULL,
  feature_id INT NOT NULL,
  FOREIGN KEY (feature_id)
	  REFERENCES features (feature_id)
);



DROP TABLE IF EXISTS categories CASCADE;
CREATE TABLE IF NOT EXISTS categories (
	id serial PRIMARY KEY NOT NULL,
	category_name VARCHAR ( 50 ) UNIQUE NOT NULL
);

DROP TABLE IF EXISTS products CASCADE;
CREATE TABLE IF NOT EXISTS products (
  id INT NOT NULL,
  name VARCHAR ( 50 )  NOT NULL,
  slogan VARCHAR ( 1000 )  NOT NULL,
  description VARCHAR ( 1000 )  NOT NULL,
  category VARCHAR ( 50 ) NOT NULL,
  default_price VARCHAR ( 50 )  NOT NULL,
  PRIMARY KEY (id)
);

DROP TABLE IF EXISTS product_features CASCADE;
CREATE TABLE IF NOT EXISTS product_features (
	product_id INT NOT NULL REFERENCES products (id),
  value_id INT NOT NULL REFERENCES values (id)
);

DROP TABLE IF EXISTS styles CASCADE;
CREATE TABLE IF NOT EXISTS styles (
  style_id INT NOT NULL,
  product_id INT NOT NULL,
  name VARCHAR ( 50 ) NOT NULL,
  sale_price VARCHAR ( 50 ),
  original_price VARCHAR ( 50 ) NOT NULL,
  defaultstyle boolean NOT NULL,
  PRIMARY KEY (style_id)
);


DROP TABLE IF EXISTS photos CASCADE;
CREATE TABLE IF NOT EXISTS photos (
  id INT PRIMARY KEY NOT NULL,
  style_id INT NOT NULL,
  url TEXT NOT NULL,
  thumbnail_url TEXT NOT NULL

);

DROP TABLE IF EXISTS skus CASCADE;
CREATE TABLE IF NOT EXISTS skus (
  sku_id INT PRIMARY KEY NOT NULL,
  style_id INT NOT NULL,
  size VARCHAR ( 50 )  NOT NULL,
  quantity INT NOT NULL

);
DROP TABLE IF EXISTS related CASCADE;
CREATE TABLE IF NOT EXISTS related (
  current_product_id INT  NOT NULL,
  related_product_id INT NOT NULL
);
