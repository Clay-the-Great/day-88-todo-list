//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

mongoose.connect("mongodb+srv://Clay:880914zk@cluster0.3wezgla.mongodb.net/todolistDB", {
  useNewUrlParser: true
});

const itemsSchema = {
  name: String,
};

const Item = mongoose.model("Item", itemsSchema);

const listSchema = {
  name: String,
  theList: [itemsSchema],
};

const List = mongoose.model("List", listSchema);

const buy = new Item({
  name: "Buy food"
});

const cook = new Item({
  name: "Cook food",
});

const eat = new Item({
  name: "Eat food",
});


const defaultItems = [buy, cook, eat];

app.get("/", function(req, res) {
  //const day = date.getDate();
  const day = "Today";
  Item.find({}, function(err, foundItems) {
    if (err) {
      console.log(err);
    } else {
      if (foundItems.length === 0) {
        Item.insertMany(defaultItems, function(err) {
          if (err) {
            console.log(err);
          } else {
            console.log("Insertion done!");
          }
        });
      }
      res.render("list", {
        listTitle: day,
        newListItems: foundItems,
      });
    }
  });
});

app.post("/", function(req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const anItem = new Item({
    name: itemName,
  });

  if(listName === "Today"){
    anItem.save();
    res.redirect("/");
  }else{
    List.findOne({name: listName}, function(err, foundList){
      foundList.theList.push(anItem);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete", function(req, res) {
  const checkedItemId = req.body.checkbox;
  const checkedListName = req.body.listName;

  if(checkedListName === "Today"){
    Item.findByIdAndRemove(checkedItemId, function(err) {
      if (err) {
        console.log(err);
      } else {
        console.log("Deleted!");
      }
    });
    res.redirect("/");
  }else{
    List.findOneAndUpdate(
      {name: checkedListName},
      {$pull: {theList: {_id: checkedItemId}}},
      function(err, updatedList){
        if(!err){
          res.redirect("/" + checkedListName);
        }
      }
    );
  }


});

// app.get("/work", function(req, res) {
//   res.render("list", {
//     listTitle: "Work List",
//     newListItems: workItems
//   });
// });

app.get("/:customListName", function(req, res){
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({name: customListName}, function(err, foundList){
    if(foundList){
      //Show an existing list
      res.render("list", {
        listTitle: foundList.name,
        newListItems: foundList.theList,
      });
    }else{
      //Create a list
      const list = new List({
        name: customListName,
        theList: defaultItems,
      });
      list.save();
      res.redirect("/" + customListName);
    }
  });
});

app.get("/about", function(req, res) {
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server has started.");
});
