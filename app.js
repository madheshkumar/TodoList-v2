//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

var listitems = [];

mongoose
  .connect("mongodb://127.0.0.1:27017/todolistDB")
  .then(() => console.log("Connected to mongoDB"))
  .catch((err) => console.log("mongo error", err));

async function run() {
  try {
    const itemSchema = new mongoose.Schema({
      name: {
        type: String,
        required: true,
      },
    });

    var Item = mongoose.model("item", itemSchema);

    var item1 = new Item({
      name: "Welcome to your todo list",
    });
    var item2 = new Item({
      name: "Hit + to add to list",
    });
    var item3 = new Item({
      name: "<-- Hit this to delete a item",
    });

    var defaultItems = [item1, item2, item3];
    const listSchema = new mongoose.Schema({
      name: String,
      items: [itemSchema],
    });

    var List = mongoose.model("list", listSchema);
  } catch (err) {
    console.log(err);
  }

  app.get("/", async function (req, res) {
    listitems = await Item.find({});
    if (listitems.length === 0) {
      await Item.insertMany(defaultItems);
      res.redirect("/");
    } else {
      res.render("list", { listTitle: "Today", newListItems: listitems });
    }
  });

  app.get("/:customListName", async function (req, res) {
    const customListName = req.params.customListName;
    const foundList = await List.findOne({ name: customListName });
    if (foundList == null) {
      const list = new List({
        name: customListName,
        items: defaultItems,
      });
      list.save();
      res.redirect("/"+customListName);
    } else {
      res.render("list", {
        listTitle: customListName,
        newListItems: foundList.items,
      });

    }
  });

  app.post("/", function (req, res) {
    const itemName = req.body.newItem;
    const item = new Item({
      name: itemName,
    });
    item.save();
    listitems.push(item);
    res.redirect("/");
  });

  app.post("/delete", async function (req, res) {
    var checkedid = req.body.checkbox;
    await Item.findByIdAndRemove(checkedid);
    res.redirect("/");
  });
}
run().catch(console.dir);

app.get("/work", function (req, res) {
  res.render("list", { listTitle: "Work List", newListItems: workItems });
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});