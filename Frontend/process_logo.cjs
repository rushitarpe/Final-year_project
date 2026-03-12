const Jimp = require('jimp');
const path = require('path');

const imgPath = path.join(__dirname, 'public', 'logo.png');

Jimp.read(imgPath)
    .then(image => {
        image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
            const red = this.bitmap.data[idx + 0];
            const green = this.bitmap.data[idx + 1];
            const blue = this.bitmap.data[idx + 2];

            const dist = Math.sqrt(Math.pow(255 - red, 2) + Math.pow(255 - green, 2) + Math.pow(255 - blue, 2));

            if (dist < 40) {
                this.bitmap.data[idx + 3] = 0;
            } else if (dist < 80) {
                this.bitmap.data[idx + 3] = Math.floor((dist / 80) * 255);
            }
        });

        // Resize down if it's huge, to save bandwidth
        if (image.bitmap.width > 800) {
            image.resize(800, Jimp.AUTO);
        }

        return image.writeAsync(imgPath);
    })
    .then(() => {
        console.log("White background removed successfully!");
    })
    .catch(err => {
        console.error("Error processing image:", err);
    });
