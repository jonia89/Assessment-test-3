//Aloitetaan 'npm init' komennolla
//Asennetaan npm-paketit ja määritetään ne + muut asetukset
const express = require("express");
const app = express();
const AWS = require("aws-sdk");
AWS.config.update({
  region: "eu-north-1",
});
const port = 3000; 

const client = new AWS.DynamoDB.DocumentClient();

const { v4: uuidv4 } = require("uuid");
const tableName = "joniAssessmentTest2Uusinta-joniDynamoDBTable-16BABZN7BOH0T";
//Kun GET-pyynnön lähettää polkuun
//Ainoastaan palauttaa
app.get("/shopping-cart", (req, res) => {
  const params = {
    TableName: tableName,
  };
//Käytetään SCAN, joka lukee kaikki tietokannan rivit (toimii paremmin tarkoitukseen kun luetaan kaikki)
  client.scan(params, (err, data) => {
    if (err) {
      console.log(err);
    } else {
      const items = [];
      for (const i in data.Items) items.push(data.Items[i]["Bewerage"]);
//Käy jokaisen läpi ja PUSHaa ne ARRAYhin
      res.contentType = "application/json";
      res.send(items); //Tulostaa kaikki arvot "Bewerage" avaimen alta
    }
  });
});
//Haetaan tietty tuote määritetyllä IDllä
//Vaatii syötteen ja palauttaa
app.get("/shopping-cart/:searchTerm", (req, res) => {
  const body = req.body;
  const params = {
    TableName: tableName,
    Key: {
      id: body.id
    },
  };
//QUERY sopii paremmin kun haetaan tietyllä avaimen arvolla, tässä tapauksessa ID-arvolla
  client.query(params, (err, data) => {
    if (err) {
      console.log(err);
    } else {
      res.contentType = "application/json";
      res.send(req.params.id); //Palauttaa tuotteen IDn mukaan
    }
  });
});

// POST vaatii syötteen
app.post("/shopping-cart", (req, res) => {
  const body = req.body;
  const params = {
    TableName: tableName,
    Item: {
      id: uuidv4(), //ID tulee automaattisesti jottei tule päällekkäisiä arvoja

      Bewerage: body["bewerage"], //"Bewerage" avain, mutta DynamoDB ottaa myös muita avaimia ja niille arvoja
    },
  };
 //Tietojen lisääminen tapahtuu DynamoDBssä POSTin sijann PUTilla
  client.put(params, (err, data) => {
    if (err) {
      console.error("Unable to add item.");
      console.error("Error JSON:", JSON.stringify(err, null, 2));
    } else {
      console.log("Added item:", JSON.stringify(data, null, 2));
    }
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

//Myös logitus hyvä olla, jotta näkee infoa tapahtumista esimerkiksi jos jotain menee pieleen
//Tärkeätä laittaa applikaatio kuuntelemaan porttia, jonka kautta tieto kulkee
//Käynnistys 'npm start' komennolla (.js tiedoston täytyy olla nimeltään 'server.js')