const got = require('got');
const url = require('url');

const sharp = require('sharp');
const sizeOf = require('image-size');

module.exports = async (req, res) => {
    const { query } = url.parse(req.url, true);

    const finalBuffer = await getFromAzureStorage(query)
    res.statusCode = 200;
    res.setHeader('Content-Type', 'image/png');
    res.send(finalBuffer);
}

const MAX_DIMENSION = 1000
getDirectionDimension = (queryDimension, imageDimension) => {
    const d = queryDimension <= 0 || queryDimension == undefined ? imageDimension : queryDimension;
    return imageDimension > MAX_DIMENSION ? MAX_DIMENSION : imageDimension;
}

getFromAzureStorage = async (query) => {
    // https://stuffonharoldimages.blob.core.windows.net/harold-images?restype=container&comp=list returns results in xml format
    const images = ['2015-02-19_13-08-25_754.jpg',
        '2015-02-20_15-33-02_526.jpg',
        '2015-02-20_21-11-30_023.jpg',
        '2015-02-20_21-11-50_174.jpg',
        '2015-02-20_21-15-49_580.jpg',
        '2015-02-21_12-47-51_131.jpg',
        '2015-02-21_12-47-57_188.jpg',
        '2015-02-21_23-00-08_428.jpg',
        '2015-02-23_20-07-53_172.jpg',
        '2015-02-27 11.12.24.jpg',
        '2017-01-16_22-11-13_530.jpg',
        'IMG_1170.jpg'];

    const randomImage = Math.floor(Math.random() * images.length);
    const imageUrl = 'https://stuffonharoldimages.blob.core.windows.net/harold-images/' + images[randomImage];
    const imageBuffer = await got(imageUrl, { responseType: 'buffer', resolveBodyOnly: true });

    const imageDimensions = sizeOf(imageBuffer);
    const ratio = imageDimensions.width / imageDimensions.height;
    const width = getDirectionDimension(query.width, imageDimensions.width);
    const height = getDirectionDimension(query.height, imageDimensions.height);

    const percentage = width / height > ratio
        ? height / imageDimensions.height
        : width / imageDimensions.width;

    return await sharp(imageBuffer)
        .rotate()
        .resize(Math.floor(imageDimensions.width * percentage), Math.floor(imageDimensions.height * percentage))
        .png()
        .toBuffer();
}

getFromGithubStorage = async (query) => {
    const images = ['2015-02-19_13-08-25_754.jpg',
        '2015-02-21_12-47-51_131.jpg',
        '2015-02-27 11.12.24.jpg',
        '2017-01-16_22-11-13_530.jpg'];

    const randomImage = Math.floor(Math.random() * images.length);
    const imageUrl = 'https://raw.githubusercontent.com/jason-dees/stuffonharold-images/main/' + images[randomImage];
    const imageBuffer = await got(imageUrl, { responseType: 'buffer', resolveBodyOnly: true });

    const imageDimensions = sizeOf(imageBuffer);
    const ratio = imageDimensions.width / imageDimensions.height;
    const width = query.width <= 0 || query.width == undefined ? imageDimensions.width : query.width;
    const height = query.height <= 0 || query.height == undefined ? imageDimensions.height : query.height;
    const percentage = width / height > ratio
        ? height / imageDimensions.height
        : width / imageDimensions.width;

    return await sharp(imageBuffer)
        .rotate()
        .resize(Math.floor(imageDimensions.width * percentage), Math.floor(imageDimensions.height * percentage))
        .png()
        .toBuffer();
}

getFromAmazonStorage = async (query) => {
    const width = query.width <= 0 || query.width == undefined ? 1000 : query.width;
    const height = query.height <= 0 || query.height == undefined ? 1000 : query.height
    const images = ['MKh7c_RjSOWZNf1j5ghAZw',
        'BB5moT82QtyKshR6GKfy8g',
        'kRl6PyP9RXq3xbpXrjo9qw',
        'KM_85Ge6SfS4R4sVR3NhvA'];
    const randomImage = Math.floor(Math.random() * images.length);
    const viewBoxStr = width + ',' + height
    const imageUrl = 'https://thumbnails-photos.amazon.com/v1/thumbnail/' + images[randomImage] + '?viewBox=' + viewBoxStr;
    console.log(imageUrl)
    const imageBuffer = await got(imageUrl, { responseType: 'buffer', resolveBodyOnly: true });
    const resizedBuffer = await sharp(imageBuffer)
        .rotate()
        .resize(Math.floor(imageDimensions.width * percentage), Math.floor(imageDimensions.height * percentage))
        .png()
        .toBuffer();

    return imageBuffer
}