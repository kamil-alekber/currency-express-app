import express from "express";
import path from "path";
import routes from "./routes";

const app = express();
// from api calls like fetch('/api/', {id: '123'})
// app.use(express.json());
app.set("views", path.resolve(__dirname, "views"));
app.set("view engine", "ejs");
// when send from browser
app.use(express.urlencoded({ extended: false }));
app.use("/public", express.static(__dirname + "/public"));
app.use(routes);
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.warn(
    `listening on port ${PORT}, client OS ${
      process.platform
    }, cwd: ${process.cwd()}`
  );
});
