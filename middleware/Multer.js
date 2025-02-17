const multer = require('multer');
const path = require('path');


// Multer configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        console.log("imageeeeeefile-==========",file);
        cb(null, "./uploads");
    },

    filename: (req, file, cb) => {
        random = Date.now();
        cb(null, random + path.extname(file.originalname));
      },
});

exports.upload = multer({
    storage: storage,
    limits: { fileSize: 1000000 }, // 1MB limit
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
}).single('file');

function checkFileType(file, cb) {
    const filetypes = /jpeg|jpg|png|gif|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: Images Only!');
    }
}
