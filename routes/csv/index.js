const express = require("express"),
    router = express.Router(),
    path = require("path"),
    hat = require("hat"),
    json2csv = require("json2csv"),
    fs = require("fs");

const { pipeline } = require("stream");
const pathToPosts = path.resolve(__dirname, "../../", "posts.json");
const pathToAuthors = path.join(__dirname, "../../", "authors.json");

const getPosts = (cb) => {
    if (!fs.existsSync(pathToPosts)) return cb("Cannot find posts", null);

    const data = fs.readFileSync(pathToPosts, "utf-8");
    const posts = JSON.parse(data);

    return cb(null, posts);
};
const getAuthors = (cb) => {
    if (!fs.existsSync(pathToAuthors)) return cb("Cannot find authors", null);

    const data = fs.readFileSync(pathToAuthors, "utf-8");
    const authors = JSON.parse(data);

    return cb(null, authors);
};

router.get("/authors", (req, res) => {
    getAuthors((err, authors) => {
        if (err) return res.status(500).send({ error: err });
        const opts = { fields: ["name", "surname", "email", "dob"] };

        const parser = new json2csv.Parser(opts);
        const csv = parser.parse(authors);

        res.setHeader(
            "Content-Disposition",
            `attachment; filename=authors_${new Date()
                .toJSON()
                .slice(0, 10)}.csv`
        );
        res.send(csv);
    });
});

router.get("/blogPosts", (req, res) => {
    getPosts((err, posts) => {
        if (err) return res.status(500).send({ error: err });
        const opts = { fields: ["category", "title", "cover", "content"] };

        const parser = new json2csv.Parser(opts);
        const csv = parser.parse(posts);

        res.setHeader(
            "Content-Disposition",
            `attachment; filename=blog_posts_${new Date()
                .toJSON()
                .slice(0, 10)}.csv`
        );
        res.send(csv);
    });
});

module.exports = router;
