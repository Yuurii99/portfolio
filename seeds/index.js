const mongoose = require("mongoose");
const Campground = require("../models/campground");
const { descriptors, places } = require("./seedHelpers");
const cities = require("./cities");

mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp')
    .then(() => {
        console.log("MongoDBコネクションOK");
    })
    .catch(err => {
        console.log("MongoDBコネクションエラー!");
        console.log(err);
    });

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const randomIndex = Math.floor(Math.random() * cities.length);
        const price = Math.floor(Math.random() * 2000) + 1000;
        const camp = new Campground({
            author: "67e44ac7645550c47d1c30f5",
            title: `${sample(descriptors)}・${sample(places)}`,
            location: `${cities[randomIndex].prefecture}${cities[randomIndex].city}`,
            images: [
                {
                  url: 'https://res.cloudinary.com/df9lumcek/image/upload/v1742816655/YelpCamp/w5zlyig4inhxgs6t6xah.jpg',
                  filename: 'YelpCamp/w5zlyig4inhxgs6t6xah',
                },
                {
                  url: 'https://res.cloudinary.com/df9lumcek/image/upload/v1742816656/YelpCamp/wmjpvwypboyueebjoju0.jpg',
                  filename: 'YelpCamp/wmjpvwypboyueebjoju0'
                }
              ],
            geometry: {
                type: "Point",
                coordinates: [
                    cities[randomIndex].longitude,
                    cities[randomIndex].latitude
                ]
            },
            description:`あのイーハトーヴォのすきとおった風、夏でも底に冷たさをもつ青いそら、うつくしい森で飾られたモリーオ市、郊外のぎらぎらひかる草の波。またそのなかでいっしょになったたくさんのひとたち、ファゼーロとロザーロ、羊飼のミーロや、顔の赤いこどもたち、地主のテーモ、山猫博士のボーガント・デストゥパーゴなど、いまこの暗い巨きな石の建物のなかで考えていると、みんなむかし風のなつかしい青い幻燈のように思われます。では`,
            price
        });
        await camp.save();
    }
};

seedDB()
.then(() => {
    mongoose.connection.close();
});