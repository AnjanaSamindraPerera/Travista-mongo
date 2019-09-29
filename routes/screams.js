const router = require("express").Router();
const checkAuth = require("../util/check-auth");
let Scream = require("../models/scream");

router.get("/", (req, res) => {
  Scream.find()
    .then(screams => res.json(screams))
    .catch(err => res.status(400).json("Error:" + err));
});

router.post("/add", (req, res) => {
  const userHandle = req.body.userHandle;
  const body = req.body.body;
  const createdAt = new Date().toISOString();

  const newScream = new Scream({ userHandle, body, createdAt });

  newScream
    .save()
    .then(() => res.json("user scream added"))
    .catch(err => res.status(400).json("Error:" + err));
});

module.exports = router;
