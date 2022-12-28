from datetime import datetime
from flask import Flask, render_template, redirect, url_for, flash, request, abort
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import relationship

app = Flask(__name__)
app.config['SECRET_KEY'] = '8BYkEfBA6O6donzWlSihBXox7C0sKR6b'

# Connect to Database
app.app_context().push()
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///list1.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)


@app.context_processor
def inject_now():
    return {'now': datetime.utcnow()}

class List(db.Model):
    __tablename__ = "list"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(250), unique=False, nullable=False)
    items = relationship("Item", back_populates="list")

class Item(db.Model):
    __tablename__ = "list_items"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(250), unique=False, nullable=False)
    list_id = db.Column(db.Integer, db.ForeignKey('list.id'))
    list = relationship("List", back_populates="items")


# db.create_all()

@app.route("/", methods=["POST",  "GET"])
def get_all_lists():
    lists = List.query.all()
    if request.method == "POST":
        new_list = List(name=request.form["newList"])
        db.session.add(new_list)
        db.session.commit()
        return redirect(url_for("get_all_lists"))
    return render_template("index.html", lists=lists)

@app.route("/delete-list", methods=["POST"])
def delete_list():
    list_id = request.form.get("deleteList")
    print(list_id)
    list_to_delete = List.query.get(list_id)
    db.session.delete(list_to_delete)
    db.session.commit()
    return redirect(url_for("get_all_lists"))

@app.route("/<int:list_id>", methods=["POST",  "GET"])
def get_all_items(list_id):
    requested_list = List.query.get(list_id)
    if request.method == "POST":
        new_item = Item(name=request.form["newItem"], list=requested_list)
        db.session.add(new_item)
        db.session.commit()
        return redirect(url_for("get_all_items", list_id=requested_list.id))

    items = requested_list.items
    return render_template("list.html", items=items, list=requested_list)

@app.route("/delete-item", methods=["POST"])
def delete_item():
    item_id = request.form.get("checkbox")
    item_to_delete = Item.query.get(item_id)
    db.session.delete(item_to_delete)
    db.session.commit()
    return redirect(url_for("get_all_items", list_id=item_to_delete.list_id))










if __name__ == "__main__":
    app.run(debug=True)