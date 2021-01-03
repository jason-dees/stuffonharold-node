const url = require('url');

module.exports = async (req, res) => {
    let images = ['2015-02-19_13-08-25_754.jpg',
                '2015-02-21_12-47-51_131.jpg',
                '2015-02-27 11.12.24.jpg',
                '2017-01-16_22-11-13_530.jpg'];
    const { query } = url.parse(req.url, true);

    let randomImage = Math.floor(Math.random()*images.length);
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/json');
    res.send("https://raw.githubusercontent.com/jason-dees/stuffonharold-images/main/" + images[randomImage] + query.width);
}