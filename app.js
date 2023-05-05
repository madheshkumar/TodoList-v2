//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

var listitems = [];

mongoose
  .connect("mongodb+srv://madhesh:madhesh@cluster0.joxa27o.mongodb.net/todolistDB")
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
    const customListName = _.capitalize(req.params.customListName);
    const foundList = await List.findOne({ name: customListName });
    if (foundList == null && foundList !== "favicon.ico") {
      const list = new List({
        name: customListName,
        items: defaultItems,
      });
      list.save();
      res.redirect("/" + customListName);
    } else if( foundList !== "favicon.ico") {
      res.render("list", {
        listTitle: customListName,
        newListItems: foundList.items,
      });
    }
  });

  app.post("/", async function (req, res) {
    const itemName = req.body.newItem;
    const listName = req.body.list;
    const item = new Item({
      name: itemName,
    });

    if (listName === "Today") {
      item.save();
      listitems.push(item);
      res.redirect("/");
    } else {
      const found_List = await List.findOne({ name: listName });
      found_List.items.push(item);
      found_List.save();
      res.redirect("/" + listName);
    }
  });

  app.post("/delete", async function (req, res) {
    var checkedid = req.body.checkbox;
    var listName = req.body.listName;

    if (listName === "Today") {
      await Item.findByIdAndRemove(checkedid);
      res.redirect("/");
    }else{
      await List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedid}}});
      res.redirect("/" + listName);
    }
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
