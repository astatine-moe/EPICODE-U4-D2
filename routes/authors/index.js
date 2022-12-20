const express = require("express"),
    router = express.Router(),
    path = require("path"),
    hat = require("hat"),
    fs = require("fs");

const authorsPath = path.join(__dirname, "../../", "authors.json");

router.get("/", (req, res) => {
    const authors = JSON.parse(fs.readFileSync(authorsPath, "utf-8"));

    res.json(authors);
});

router.get("/:author_id", (req, res) => {
    const { author_id } = req.params;

    if (!author_id)
        return res
            .status(400)
            .json({ error: "Bad request, must include /authors/:author_id" });

    const authors = JSON.parse(fs.readFileSync(authorsPath, "utf-8"));

    const author = authors.find((a) => a.id === author_id);

    if (!author) return res.status(404).json({ error: "Author not found" });

    res.json(author);
});

const generateAvatar = (f, s) => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
        `${f} ${s}`
    )}`;
};

router.post("/", (req, res) => {
    const { name, surname, email, dob } = req.body;

    if (!name || !surname || !email || !dob)
        return res.status(400).json({
            error: "Missing one of the required fields (name, surname, email, dob)",
        });

    const authors = JSON.parse(fs.readFileSync(authorsPath, "utf-8"));
    //check if email exists
    const emailFound = authors.find((a) => a.email === email);

    if (emailFound)
        return res.status(400).json({
            error: "Email already exists",
        });

    const avatar = generateAvatar(name, surname);
    const id = hat();

    const author = { name, surname, email, dob, avatar, id };

    authors.push(author);

    fs.writeFileSync(authorsPath, JSON.stringify(authors, null, 4), "utf-8");

    res.json({ message: "OK", author });
});

router.put("/:author_id", (req, res) => {
    const { author_id } = req.params;

    if (!author_id)
        return res
            .status(400)
            .json({ error: "Bad request, must include /authors/:author_id" });

    const authors = JSON.parse(fs.readFileSync(authorsPath, "utf-8"));
    const author = authors.find((a) => a.id === author_id);

    if (!author) return res.status(404).json({ error: "Author not found" });

    const { name, surname, email, dob } = req.body;

    if (name) {
        author.name = name;
    }
    if (surname) {
        author.surname = surname;
    }
    if (email) {
        author.email = email;
    }
    if (dob) {
        author.dob = dob;
    }

    fs.writeFileSync(authorsPath, JSON.stringify(authors, null, 4), "utf-8");

    res.json({ message: "OK", author });
});

router.delete("/:author_id", (req, res) => {
    const { author_id } = req.params;

    if (!author_id)
        return res
            .status(400)
            .json({ error: "Bad request, must include /authors/:author_id" });

    const authors = JSON.parse(fs.readFileSync(authorsPath, "utf-8"));
    const author = authors.find((a) => a.id === author_id);

    if (!author) return res.status(404).json({ error: "Author not found" });

    const authorsWithoutId = authors.filter((a) => a.id !== author_id);

    fs.writeFileSync(
        authorsPath,
        JSON.stringify(authorsWithoutId, null, 4),
        "utf-8"
    );

    res.json({ message: "OK" });
});

module.exports = router;
