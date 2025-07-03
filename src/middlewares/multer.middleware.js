// import multer from "multer";

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, '../public/temp')
//   },
//   filename: function (req, file, cb) {
//     // const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
//     // cb(null, file.fieldname + '-' + uniqueSuffix)

//     cb(null, file.originalname) // localFilePath = file.originalnam
//   }
// })

// export const upload = multer({ storage: storage })


import multer from "multer";
import path from "path";
import fs from "fs";

// Resolve the path to /public/temp safely
const tempDir = path.resolve("public", "temp");

// Ensure folder exists
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, tempDir);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // still use original name if you want
  },
});

export const upload = multer({ storage });
