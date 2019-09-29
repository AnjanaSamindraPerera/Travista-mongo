const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const checkAuth = require("../util/check-auth");

//image uploading
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "./uploads"); //storage strategy
  },
  filename: function(req, file, cb) {
    cb(null, new Date().toISOString().replace(/:/g, "-") + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg"
  ) {
    cb(null, true);
  } //accept incoming fie
  else {
    cb(null, false); //reject  incoming fie
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5 //upto 5mb
  },
  fileFilter: fileFilter
});

//validaters
const { validateSignupData, validateLoginData } = require("../util/validators");

//signup route
router.post("/signup", (req, res, next) => {
  const user = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    handle: req.body.handle,
    category: req.body.category
  };

  const { valid, errors } = validateSignupData(user);

  if (!valid) return res.status(400).json(errors);

  User.find({ email: req.body.email })
    .exec() //give promise
    .then(acc => {
      if (acc.length >= 1) {
        return res.status(400).json({ email: "email should be unique" });
      } else {
        bcrypt.hash(req.body.password, 10, (err, hash) => {
          if (err) {
            return res.status(500).json({
              error: err
            });
          } else {
            const user = new User({
              _id: new mongoose.Types.ObjectId(),
              email: req.body.email,
              password: hash,
              handle: req.body.handle,
              category: req.body.category,
              createdAt: new Date().toISOString()
            });
            user
              .save() //save in database
              .then(result => {
                const token = jwt.sign(
                  {
                    email: user.email,
                    userID: user._id //jwt token
                  },
                  process.env.JWT_KEY,
                  {
                    expiresIn: "1h"
                  }
                );

                console.log(result);
                res.status(201).json({
                  token: token,
                  message: "user created"
                });
              })
              .catch(err => {
                console.log(err);

                res.status(500).json(err);
              });
          }
        });
      }
    });
});

//deleting a user
router.delete("/:userId", (req, res, next) => {
  User.remove({ _id: req.params.userId })
    .exec()
    .then(result => {
      res.status(200).json({
        message: "user deleted"
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});

//getting user data
router.get("/", checkAuth, (req, res) => {
  User.find({ _id: req.user.userID })
    .exec()
    .then(user => res.json(user))
    .catch(err => res.status(400).json("Error:" + err));
});

//login route
router.post("/login", (req, res, next) => {
  const user = {
    email: req.body.email,
    password: req.body.password
  };

  //destructuring

  const { valid, errors } = validateLoginData(user);

  if (!valid) return res.status(400).json(errors);

  User.find({ email: req.body.email })
    .exec()
    .then(user => {
      if (user.length < 1) {
        return res.status(401).json({
          general: "Wrong credentials.Please try again" //401 authentication error
        });
      }

      bcrypt.compare(req.body.password, user[0].password, (err, result) => {
        if (err) {
          return res.status(401).json({
            general: "Wrong credentials.Please try again"
          });
        }
        if (result) {
          const token = jwt.sign(
            {
              email: user[0].email,
              userID: user[0]._id //jwt token
            },
            process.env.JWT_KEY,
            {
              expiresIn: "1h"
            }
          );
          return res.status(200).json({
            message: "Auth succesful",
            token: token
          });
        }
        return res.status(401).json({
          general: "Wrong credentials.Please try again"
        });
      });
    })
    .catch(err => {
      console.log(err);

      res.status(500).json({
        general: "Auth failed"
      });
    });
});

router.post("/image", checkAuth, upload.single("image"), (req, res) => {
  console.log(req.file.path);

  let query = { _id: req.user.userID };

  let user = {};

  user.imageUrl = req.file.path;

  User.updateOne(query, user, function(err) {
    if (err) {
      console.log(err);
      return res.status(500).json({
        error: err
      });
    } else return res.json("user image added");
  });
});

module.exports = router;
