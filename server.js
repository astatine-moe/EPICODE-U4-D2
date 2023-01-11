const express = require("express"),
    fs = require("fs"),
    bodyParser = require("body-parser"),
    path = require("path"),
    cors = require("cors"),
    http = require("http");
const expressListRoutes = require("express-list-routes");

const app = express();
const server = http.createServer(app);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

server.listen(1000);

async function* walk(dir) {
    //walk a directory to get all child folders
    for await (const d of await fs.promises.opendir(dir)) {
        const entry = path.join(dir, d.name);
        if (d.isDirectory()) yield* walk(entry);
        else if (d.isFile()) yield entry;
    }
}

(async () => {
    //run async function when server.js is run

    for await (const p of walk("./routes/")) {
        const route = require(path.resolve(__dirname, p));
        const dirs = p.split("\\");
        dirs.shift(); //remove base dir
        const fileName = dirs.pop(); //get filename;
        let routeName;
        if (fileName === "index.js") {
            routeName = `/${dirs.join("/")}`;
        } else {
            routeName = `/${dirs.join("/")}/${fileName.replace(".js", "")}`;
        }

        app.use(routeName, route);

        console.log(`Loaded route ${routeName}`);
    }

    console.log("Ready @ http://127.0.0.1:1000/authors");
    console.table(expressListRoutes(app));
})();
