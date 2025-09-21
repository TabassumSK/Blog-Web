const express = require('express');
const app = express();
const path = require('path');
const Post = require('./models/database.js');
const port = 1080;
const methodOverride = require('method-override');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, "public")));

//database connection
const mongoose = require('mongoose');
main()
.then(() => {
    console.log("Databse Connected");
})
.catch((err) => {
    console.log(err);
});

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/BlogWeb');
}


app.get("/", (req, res) => {
    res.send("server working");
});

//1st data insert
app.get("/1stPost", async(req, res) => {
    const post = new Post({
        title: "Wild Animal",
        author: "Sona",
        content: "Wildest Ever Been Seen",
    });
    await post.save();
    res.send("Data is Saved");
});

//show route
app.get("/posts", async (req, res) => {
    const posts = await Post.find({});
    res.render('home.ejs', {posts});
});

//search route
app.get("/posts/search", async (req, res) => {
    const { q } = req.query;
    let posts = [];

    if (q && q.trim()) {
        // Search in title and content using regex (case-insensitive)
        posts = await Post.find({
            $or: [
                { title: { $regex: q, $options: 'i' } },
                { content: { $regex: q, $options: 'i' } },
                { author: { $regex: q, $options: 'i' } }
            ]
        }).sort({ date: -1 }); // Sort by newest first
    }

    res.render('search.ejs', { posts, searchQuery: q });
});

//view page
app.get('/posts/:id/views', async (req, res) => {
    let {id} = req.params;
    const post = await Post.findById(id);
    const otherPosts = await Post.find({_id: {$ne: id}}).limit(5);
    res.render("view.ejs", {post, otherPosts});
});

//new post route
app.get('/posts/new', (req, res) => {
    res.render('new.ejs');
});

//create post route
app.post('/posts', async (req, res) => {
    const post = new Post(req.body);
    await post.save();  
    res.redirect("/posts");
});

//edit route
app.get("/posts/:id/edit", async(req, res) => {
    const {id} = req.params;
    const post = await Post.findById(id);
    res.render("edit.ejs", {post});
});

//update
app.put("/posts/:id", async (req, res) => {
    const {id} = req.params;
    await Post.findByIdAndUpdate(id, {...req.body});
    res.redirect("/posts");
});

//delete route
app.delete("/posts/:id", async (req, res) => {
    let {id} = req.params;
    await Post.findByIdAndDelete(id);
    res.redirect("/posts");
});

//contact
app.get("/contact", (req, res) => {
    res.render("contact");
});

//about
app.get("/about", (req, res) => {
    res.render("about");
})

app.listen(1080, () => {
    console.log(`Server are listening at ${port}`);
});