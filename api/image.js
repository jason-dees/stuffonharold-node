const got = require('got');
const url = require('url');

const sharp = require('sharp');
const sizeOf = require('image-size');

module.exports = async (req, res) => {
    const images = ['2015-02-19_13-08-25_754.jpg',
                '2015-02-21_12-47-51_131.jpg',
                '2015-02-27 11.12.24.jpg',
                '2017-01-16_22-11-13_530.jpg'];
    const { query } = url.parse(req.url, true);

    const randomImage = Math.floor(Math.random()*images.length);
    const imageUrl = 'https://raw.githubusercontent.com/jason-dees/stuffonharold-images/main/' + images[randomImage];
    const imageBuffer = await got(imageUrl, {responseType: 'buffer', resolveBodyOnly: true});
    
    const imageDimensions = sizeOf(imageBuffer);
    const ratio = imageDimensions.width / imageDimensions.height;
    const width = query.width <= 0 || query.width == undefined ? imageDimensions.width : query.width;
	const height = query.height <= 0 || query.width == undefined ? imageDimensions.height : query.height;
    const percentage = width / height > ratio
					? height / imageDimensions.height
                    : width / imageDimensions.width;
                    console.log(percentage);

    const resizedBuffer = await sharp(imageBuffer)
        .rotate()
        .resize(Math.floor(imageDimensions.width * percentage), Math.floor(imageDimensions.height * percentage))
        .png()
        .toBuffer();
    res.statusCode = 200;
    res.setHeader('Content-Type', 'image/png');
    res.send(resizedBuffer);
}