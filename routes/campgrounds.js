const express = require("express");
const router = express.Router();
const campgrounds = require("../controllers/campgrounds");
const catchAsync = require("../utils/catchAsync");
const { isLoggedIn, isAuthor, validateCampground, loggedReqest } = require("../middleware");

const multer  = require('multer')
const { storage } = require("../cloudinary");
const upload = multer({
    storage,
    limits: {
        fileSize: 1048567,
    }
});

router.route("/")
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn, upload.array("image"), validateCampground , catchAsync(campgrounds.createCampground));

router.get("/new", isLoggedIn, campgrounds.renderNewForm);

router.route("/:id")
    .get(catchAsync(campgrounds.showCampground))
    .put(isLoggedIn , isAuthor , upload.array("image"), validateCampground, catchAsync(campgrounds.updateCampground))
    .delete(isLoggedIn , isAuthor , catchAsync(campgrounds.deleteCampground));

router.get("/:id/edit", isLoggedIn , isAuthor , catchAsync(campgrounds.renderEditForm));

module.exports = router;