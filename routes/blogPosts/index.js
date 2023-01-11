const express = require("express"),
    router = express.Router(),
    path = require("path"),
    hat = require("hat"),
    fs = require("fs");

const pathToPosts = path.resolve(__dirname, "../../", "posts.json");
const pathToAuthors = path.join(__dirname, "../../", "authors.json");

const getPosts = (cb) => {
    if (!fs.existsSync(pathToPosts)) return cb("Cannot find posts", null);

    const data = fs.readFileSync(pathToPosts, "utf-8");
    const posts = JSON.parse(data);

    return cb(null, posts);
};

const savePosts = (newArr, cb) => {
    if (!fs.existsSync(pathToPosts)) return cb("Cannot find posts", null);

    fs.writeFileSync(pathToPosts, JSON.stringify(newArr, null, 4), "utf-8");

    cb(null, newArr);
};

router.get("/", (req, res) => {
    getPosts((err, posts) => {
        if (err)
            return res.status(500).send({
                error: err,
            });

        return res.send(posts);
    });
});

router.get("/:blog_id", (req, res) => {
    getPosts((err, posts) => {
        if (err)
            return res.status(500).send({
                error: err,
            });

        const post = posts.find((post) => post._id === req.params.blog_id);

        if (!post)
            return res.status(404).send({
                error: "Could not find blog post",
            });

        return res.send(post);
    });
});

router.post("/", (req, res) => {
    let { category, title, cover, author_id, content } = req.body;

    if (!category) {
        category = "NEWS";
    }
    if (!title || !cover || !author_id || !content)
        return res.status(400).send({
            error: "Must include required fields (title, cover, author, content)",
        });

    const authors = JSON.parse(fs.readFileSync(pathToAuthors, "utf-8"));

    const author = authors.find((a) => a.id === author_id);
    if (!author)
        return res.status(404).send({
            error: "Author not found",
        });

    const newPost = {
        _id: hat(),
        category,
        title,
        cover,
        author,
        content,
        createdAt: new Date(),
    };

    getPosts((err, posts) => {
        if (err) return res.status(500).send({ error: err });

        let newPosts = [...posts, newPost];

        savePosts(newPosts, (err, posts) => {
            if (err) return res.status(500).send({ error: err });

            return res.send(newPost);
        });
    });
});

router.put("/:blog_id", (req, res) => {
    const { blog_id } = req.params;
    const { title, cover, content, category } = req.body;

    getPosts((err, posts) => {
        if (err) return res.status(500).send({ error: err });

        const post = posts.find((p) => p._id === blog_id);

        if (!post) return res.status(404).send({ error: "Post not found" });
        if (title) {
            post.title = title;
        }
        if (cover) {
            post.cover = cover;
        }
        if (content) {
            post.content = content;
        }
        if (category) {
            post.category = category;
        }

        savePosts(posts, (err, posts) => {
            if (err) return res.status(500).send({ error: err });

            res.send(post);
        });
    });
});

router.delete("/:blog_id", (req, res) => {
    const { blog_id } = req.params;

    getPosts((err, posts) => {
        if (err) return res.status(500).send({ error: err });

        const post = posts.find((p) => p._id === blog_id);
        if (!post) return res.status(404).send({ error: "Post not found" });

        let newPosts = posts.filter((p) => p._id !== blog_id);

        savePosts(newPosts, (err, posts) => {
            if (err) return res.status(500).send({ error: err });

            res.send({ message: "OK" });
        });
    });
});

module.exports = router;
