import multer from "multer"

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      console.log("I have reached here")

      cb(null, 'src/uploads/')
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, file.fieldname + '-' + uniqueSuffix)
    }

  })
  
 export  const upload = multer({ storage: storage })