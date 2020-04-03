//budget Controll
var budgetController = (function() {
  var Expense = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };
  Expense.prototype.calcPer = function(totalIncome) {
    if (totalIncome > 0) {
      this.percentage = Math.round((this.value / totalIncome) * 100);
    } else {
      this.percentage = -1;
    }
  };
  Expense.prototype.getPercentage = function() {
    return this.percentage;
  };

  var Income = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  var calculateTotals = function(type) {
    var sum = 0;
    data.allitems[type].forEach(cur => {
      sum = sum + cur.value;
    });
    data.totals[type] = sum;
  };

  var data = {
    allitems: {
      exp: [],
      inc: []
    },
    totals: {
      exp: 0,
      inc: 0
    },
    budget: 0,
    percentage: -1
  };

  return {
    addItem: function(type, des, val) {
      var newItem, ID;

      //newitem = new Expense(ID, desc, val);

      //create new id
      if (data.allitems[type].length > 0) {
        ID = data.allitems[type][data.allitems[type].length - 1].id + 1;
      } else {
        ID = 0;
      }

      //create new item based on the type
      if (type === "exp") {
        newItem = new Expense(ID, des, val);
      } else if (type === "inc") {
        newItem = new Income(ID, des, val);
      }

      //push the data to the allitems data structre
      data.allitems[type].push(newItem);

      //finally return the new element
      return newItem;
    },
    deleteItem: function(type, id) {
      var index, ids;
      ids = data.allitems[type].map(function(current) {
        return current.id;
      });
      index = ids.indexOf(id);
      if (index !== -1) {
        data.allitems[type].splice(index, 1);
      }
    },
    testing: function() {
      console.log(data);
    },
    calculatebudget: function() {
      //calculate total income and expenses

      calculateTotals("exp");
      calculateTotals("inc");

      //calculate the budget: income-expenses
      data.budget = data.totals.inc - data.totals.exp;

      //calculate the percentage of the income that we spent
      if (data.totals.inc > 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.percentage = -1;
      }
    },
    calcPercentages: function() {
      data.allitems.exp.forEach(function(cur) {
        cur.calcPer(data.totals.inc);
      });
    },
    getPercentages: function() {
      var allperc = data.allitems.exp.map(function(cur) {
        return cur.getPercentage();
      });
      return allperc;
    },
    getbudget: function() {
      return {
        budget: data.budget,
        totalincome: data.totals.inc,
        totalexpenses: data.totals.exp,
        percentage: data.percentage
      };
    }
  };
})();

//ui controller
var UIControler = (function() {
  var DOMstrings = {
    input_type: ".add__type",
    input_description: ".add__description",
    input_values: ".add__value",
    input_addbtn: ".add__btn",
    incomeContainer: ".income__list",
    expenseContainer: ".expenses__list",
    budgetValue: ".budget__value",
    budgetIncomevalue: ".budget__income--value",
    budgetExpenseValue: ".budget__expenses--value",
    budgetexpPercentage: ".budget__expenses--percentage",
    container: ".container",
    expensesPercentagelabel: ".item__percentage",
    budgetTitle: ".budget__title--month"
  };
  var formatNo = function(num, type) {
    var numsplit, int, dec, sign;
    num = Math.abs(num);
    num = num.toFixed(2);

    numsplit = num.split(".");
    int = numsplit[0];

    if (int.length > 3) {
      int = int.substr(0, int.length - 3) + "," + int.substr(int.length - 3, 3);
    }
    dec = numsplit[1];

    return (type === "exp" ? "-" : "+") + " " + int + "." + dec;
  };
  var NodeListForeach = function(Nlist, callback) {
    for (var i = 0; i < Nlist.length; i++) {
      callback(Nlist[i], i);
    }
  };
  return {
    getinput: function() {
      return {
        type: document.querySelector(DOMstrings.input_type).value, //wil be either inc or exp
        description: document.querySelector(DOMstrings.input_description).value,
        value: parseFloat(document.querySelector(DOMstrings.input_values).value)
      };
    },
    addListItem: function(obj, type) {
      //create a string with placeholder Text

      var html, newhtml, element;
      if (type === "inc") {
        element = DOMstrings.incomeContainer;
        html =
          '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      } else if (type === "exp") {
        element = DOMstrings.expenseContainer;
        html =
          '<div class="item clearfix" id="exp-%id%"><div class="item__description" > %description%</div ><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div >';
      }

      //Replace the placeholder Text with actual data

      newhtml = html.replace("%id%", obj.id);
      newhtml = newhtml.replace("%description%", obj.description);
      newhtml = newhtml.replace("%value%", formatNo(obj.value, type));

      //Insert the HTML  into the DOM

      document.querySelector(element).insertAdjacentHTML("beforeend", newhtml);
    },
    deleteListItem: function(selectID) {
      var el = document.getElementById(selectID);
      el.parentNode.removeChild(el);
    },

    clearFields: function() {
      var fields, filedsArray;
      fields = document.querySelectorAll(
        DOMstrings.input_description + "," + DOMstrings.input_values
      );

      filedsArray = Array.prototype.slice.call(fields);
      filedsArray.forEach(function(current, index, array) {
        current.value = "";
      });
      filedsArray[0].focus();
    },
    displayBudget: function(obj) {
      document.querySelector(DOMstrings.budgetValue).textContent = obj.budget;

      if (obj.totalincome > 0) {
        document.querySelector(DOMstrings.budgetIncomevalue).textContent =
          "+" + obj.totalincome;
      } else {
        document.querySelector(DOMstrings.budgetIncomevalue).textContent =
          obj.totalincome;
      }
      if (obj.totalexpenses > 0) {
        document.querySelector(DOMstrings.budgetExpenseValue).textContent =
          "-" + obj.totalexpenses;
      } else {
        document.querySelector(DOMstrings.budgetExpenseValue).textContent =
          obj.totalexpenses;
      }

      if (obj.percentage > 0) {
        document.querySelector(DOMstrings.budgetexpPercentage).textContent =
          obj.percentage + "%";
      } else {
        document.querySelector(DOMstrings.budgetexpPercentage).textContent =
          "---";
      }
    },
    displayPercentages: function(percentage) {
      var fields = document.querySelectorAll(
        DOMstrings.expensesPercentagelabel
      );

      NodeListForeach(fields, function(current, index) {
        if (percentage[index] > 0) {
          current.textContent = percentage[index] + "%";
        } else {
          current.textContent = "--";
        }
      });
    },
    displayMonth: function() {
      var now, year, month, months;
      now = new Date();
      months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
      ];
      year = now.getFullYear();
      month = now.getMonth();
      document.querySelector(DOMstrings.budgetTitle).textContent =
        months[month] + " " + year;
    },
    changedType: function() {
      var fields = document.querySelectorAll(
        DOMstrings.input_type +
          "," +
          DOMstrings.input_description +
          "," +
          DOMstrings.input_values
      );
      NodeListForeach(fields, function(cur) {
        cur.classList.toggle("red-forcus");
      });
    },
    getDOMstrings: function() {
      return DOMstrings;
    }
  };
})();

//Global app controller
var controller = (function(budgetctr, UIctr) {
  var setEventListenner = function() {
    var DOM = UIctr.getDOMstrings();

    document
      .querySelector(DOM.input_addbtn)
      .addEventListener("click", ctrlAdditem);

    document.addEventListener("keypress", function(event) {
      if (event.keyCode === 13 || event.which === 13) {
        ctrlAdditem();
      }
    });

    document
      .querySelector(DOM.container)
      .addEventListener("click", ctrDeleteItem);

    document
      .querySelector(DOM.input_type)
      .addEventListener("change", UIctr.changedType);
  };

  var updateBadget = function() {
    // 1. Calculate the budget
    budgetController.calculatebudget();
    // 2.Add the budget on the UI
    var budget = budgetController.getbudget();

    //Display the budget
    UIctr.displayBudget(budget);
  };

  var updatePercentages = function() {
    //calculate the percentags
    budgetController.calcPercentages();
    //2. Reda the from the budget controller
    var percentages = budgetController.getPercentages();
    //3. UPdate the UI with the new percentages
    UIctr.displayPercentages(percentages);
  };

  var ctrlAdditem = function() {
    var input, newitem;
    // 1.Get the field input data
    input = UIctr.getinput();

    // 2.Add the item to the budget controller
    if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
      newitem = budgetController.addItem(
        input.type,
        input.description,
        input.value
      );

      // 3.Add item to the UI
      UIctr.addListItem(newitem, input.type);

      // 4. clear all the fields
      UIctr.clearFields();
      // 5. Calculate and uodate  the budget
      updateBadget();
      //6. calculate and update percentages
      updatePercentages();
    }
  };

  var ctrDeleteItem = function(event) {
    var itemID, splitID, type, ID;
    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
    if (itemID) {
      splitID = itemID.split("-");
      type = splitID[0];
      ID = parseInt(splitID[1]);
      //1. Delete the item from the data structure
      budgetController.deleteItem(type, ID);
      //2. Delete the item from the UI
      UIctr.deleteListItem(itemID);
      //3. UPdate and show the new totals of the budget
      updateBadget();
      //4. calculate and update percentages
      updatePercentages();
    }
  };

  return {
    init: function() {
      UIctr.displayMonth();
      UIctr.displayBudget({
        budget: 0,
        totalincome: 0,
        totalexpenses: 0,
        percentage: -1
      });
      setEventListenner();
    }
  };
})(budgetController, UIControler);
controller.init();
