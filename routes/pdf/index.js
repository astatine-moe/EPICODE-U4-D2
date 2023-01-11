const express = require("express"),
    router = express.Router(),
    path = require("path"),
    PdfPrinter = require("pdfmake"),
    hat = require("hat"),
    fs = require("fs");

const { pipeline } = require("stream");

const printer = new PdfPrinter({
    Roboto: {
        normal: "Helvetica",
        bold: "Helvetica",
    },
});

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

router.get("/export/:post_id", async (req, res) => {
    const { error, message, posts } = await new Promise((resolve) => {
        getPosts((err, posts) => {
            if (err)
                return resolve({
                    error: true,
                    message: "Cannot find posts",
                    authors: [],
                    posts: [],
                });

            return resolve({
                error: false,
                message: "OK",
                posts,
            });
        });
    });

    if (error) return res.status(500).send({ error: message });

    const post = posts.find((p) => p._id === req.params.post_id);

    if (!post) return res.status(404).send({ error: "Post not found" });

    const dd = {
        content: [
            {
                image: post.cover,
                margin: [0, 20],
            },
            {
                text: post.title,
                style: "header",
            },
            post.content,
        ],
        styles: {
            header: {
                fontSize: 18,
                bold: true,
            },
            subheader: {
                fontSize: 15,
                bold: true,
            },
            quote: {
                italics: true,
            },
            small: {
                fontSize: 8,
            },
        },
    };

    var pdfDoc = printer.createPdfKitDocument(dd, {});
    pdfDoc.pipe(fs.createWriteStream("document.pdf"));
    pdfDoc.end();

    res.setHeader("Content-Disposition", "attachment; filename=test.pdf");

    pipeline(pdfDoc, res, (err) => {
        if (err) {
            console.log(err);
        }
    });
});

module.exports = router;
