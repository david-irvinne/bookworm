import express from "express";
import cloudinary from "../lib/cloudinary.js";
import Book from "../models/Book.js";
import protectRoute from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", protectRoute, async (req, res) => {
  try {
    const {title, caption, rating, image} = req.body;
    if(!image || !title || !caption || !rating){
      return res.status(400).json({message: "please provide all fields"});
    }

    // upload the image to cloudinary
    const uploadResponse = await cloudinary.uploader.upload(image);
    const imageUrl = uploadResponse.secure_url;

    // save to db
    const newBook = new Book({
      title, caption, rating, image: imageUrl, user: req.user._id
    })
    // req.user harus udah diisi lewat middleware

    await newBook.save();
    res.status(201).json(newBook);
  }
  catch (error){
    console.log("error creating book", error);
  }
})

// const response = await fetch("http://localhost:3000/api/books?page=1&limit=5");

// pagination => infinite scrolling
router.get("/", protectRoute, async (req, res) => {
  try {
    const page = req.query.page || 1;
    const limit = req.query.limit || 5;
    const skip = (page -1) * limit ; 

    // const books = await Book.find();
    // sort descending order
    const books = await Book.find().sort({createdAt: -1})
    .skip(skip) // skip the first 'skip' result
    .limit(limit)
    .populate("user", "username profileImage") // grab username and profileImage using user (id)
    // Ganti field user yang tadinya cuma ObjectId menjadi data lengkap.

    const total = await Book.countDocuments(); // how many books are there 
    res.send({
      books,
      currentPage: page,
      totalBooks: total,
      totalPages: Math.ceil(totalBooks / limit)
    });
  }
  catch (error){
    console.log("error in getting books", error);
    res.status(500).json({message: "internal server error"});
  }
})

router.delete("/:id", protectRoute, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if(!book) return res.status(404).json({message: "book not found"});

    // check if user is the author of the book
    if(book.user.toString() !== req.user._id.toString()) return res.status(401).json({message: "Unauthorized"});

    // delete image from cloudinary
    // cek kalau gambar buku ini disimpan di cloudinary, cek link nya
    if(book.image && book.image.includes("cloudinary")) {
      try {
        const publicId = book.image.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(publicId);
      } catch (error) {
        console.log("error deleting image", error);
      }
    }

    // delete book from db
    await book.deleteOne();
    res.json({message: "book deleted successfuly"});
  } catch (error) {
    console.log("error deleting book", error);
    res.status(500).json({message: "internal server error"});
  }
})

// get recommended books by the logged in user
router.get("/user", protectRoute, async (req, res) => {
  try {
    const books = await Book.find( {user: req.user._id}).sort( {createdAt: -1});
    res.json(books);
  } catch (error) {
    console.log("get user books error:", error.message);
    res.status(500).json({message: "server error"});
  }
})

export default router;