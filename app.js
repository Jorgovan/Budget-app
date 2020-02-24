(function () {var budgetController = (function () {
    
    var Expense = function(id, description, value) {
        this.id=id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    }
    
    // dodajemo metodu u prototip koja 
    Expense.prototype.calcPercentage = function(totalIncome) {
        if (totalIncome>0) {
            this.percentage = Math.round(this.value*100/totalIncome);
        } else {this.percentage= -1}
    }
    
    Expense.prototype.getPercentage = function () {
        return this.percentage;
    }
    
    
    var Income = function(id, description, value) {
        this.id=id;
        this.description = description;
        this.value = value;
    }
    
    
    var data = {
        allItems: {
            exp: [],
            inc:[]
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        // -1 je konvencija za nepostojeći broj
        percentage: -1,
    }
    
    var calculateTotal = function(type){
        var sum=0;
        data.allItems[type].forEach(function (item){
            sum+= item.value;
        });
        data.totals[type]=sum;
    }
    
    return {
        
        addItem: function(type, des, val) {
            var newItem, ID;
            ID=0;
            //********TO-DO***
            // ako postoji array, uzimamo Id veći od zadnjeg u arrayu (neučinkovito)
            if (data.allItems[type].length > 0 ) {
                
                ID = data.allItems[type][data.allItems[type].length-1].id + 1;
            }
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type ==='inc') {
                newItem = new Income(ID, des, val)
            }
            
            data.allItems[type].push(newItem);
            data.totals[type]++;
            
            return newItem;
        },
        
        calculateBudget: function() {
            //ukupan income i troškovi
            calculateTotal('exp');
            calculateTotal('inc');
            //budget
            data.budget=data.totals.inc-data.totals.exp;
            // calc percentage
            if (data.totals.inc>0){
                data.percentage=Math.round((data.totals.exp/data.totals.inc)*100);
            } else {data.percentage= -1}
        },
        
        removeItem: function(typeDel, idDel) {
            data.allItems[typeDel].forEach(function(current, index, array){
                if (current.id == idDel) { array.splice(index, 1)}
            });
            
        },
        
        calculatePercentages: function () {
          data.allItems.exp.forEach(function (cur)
          {
            cur.calcPercentage(data.totals.inc);    
            console.log(cur.percentage);
            });
        },
        
        getPercentages: function(){
            var allPerc= data.allItems.exp.map(function(cur) {
                return cur.getPercentage();
            });
            return allPerc;
        },
        //radi kasnije fleksibilnosti calc i get razbijeni u 2 funkcije
        getBudget: function(){
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage,
            }
        },
        
        testing: function() {
            console.log(data);
        },
        
    }
    
    
})();

var UIController = (function (){
    
    // fleksibilnost na promjene u HTML-u
    var DOMstrings = {
        //objects
        inputType: ".add__type",
        inputDescription: ".add__description",
        inputValue: ".add__value",
        inputButton: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        expensesPercentage: '.item__percentage',
        
        // total budget
        budgetTotal: ".budget__value",
        budgetInc: ".budget__income--value",
        budgetExp: ".budget__expenses--value",
        budgetPerc: ".budget__expenses--percentage",
        
        //parent of objects
        container: ".container",
        
        date: ".budget__title--date",
    }
    var nodeListForEach = function (list, callback) {
                for (var i = 0; i<list.length; i++) {
                    callback(list[i], i);
                }
            };
    
    return {
        getinput: function(){
        return {
            type: document.querySelector(DOMstrings.inputType).value,
            description: document.querySelector(DOMstrings.inputDescription).value,
            value: parseFloat(document.querySelector(DOMstrings.inputValue).value),
        }
        }, 
        
        addListItem: function(obj, type){
            
            var html, newHtml;
            
            if (type=='inc'){
            
                element = DOMstrings.incomeContainer;
            
            html='<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            else if (type=='exp') {
                
                element = DOMstrings.expensesContainer;

                html ='<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage"></div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            
                        
            //replace text with data
            
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', obj.value);
        
            //insert htlm into Dom
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },
        
        removeListItem: function(typeID) {
            
            var elem = document.getElementById(typeID);
            elem.parentNode.removeChild(elem);
            
        },
        // nakon unosa želimo isprazniti polja
        clearFields: function() {
            var fields;
            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
            //konverzija liste u array
            var fieldsArr = Array.prototype.slice.call(fields);
            
            fieldsArr.forEach(function (current, index, array){
                current.value = "";
                
            });
            fieldsArr[0].focus(); 
            
        },
        
        displayBudget: function(obj) {
            document.querySelector(DOMstrings.budgetTotal).textContent = obj.budget;
            document.querySelector(DOMstrings.budgetInc).textContent = obj.totalInc;
            document.querySelector(DOMstrings.budgetExp).textContent = obj.totalExp;
            
            if(obj.percentage > 0){
                document.querySelector(DOMstrings.budgetPerc).textContent = obj.percentage + "%";
            } else {
              document.querySelector(DOMstrings.budgetPerc).textContent = "---";
            }
        },
        
        displayPercentages: function(percentages) {
            
            var fields = document.querySelectorAll(DOMstrings.expensesPercentage);
            
            
            nodeListForEach(fields, function(current, index){
               
                if(percentages[index] > 0) {
                    current.textContent = percentages[index];
                } else { current.textContent= "___"}
            });
            
        },
        
        displayTime: function() {
            var time, year, month;    
            
            time = new Date();
            month = time.getMonth();
            year = time.getFullYear();
            document.querySelector(DOMstrings.date).textContent = month + "/" +year;
            
            
        },
        
        changedType: function() {
            var fields = document.querySelectorAll(DOMstrings.inputType + ","+ DOMstrings.inputDescription + "," + DOMstrings.inputValue);
            
            nodeListForEach(fields, function(cur){
                
                cur.classList.toggle("red-focus");
                
            });
            
            document.querySelector(DOMstrings.inputButton).classList.toggle("red");
        },
        
        getDOMstrings: function() { //možemo pozivati DOM strings izvana
            return DOMstrings;
    }
    }
    
})();


//koristimo različito ime funkcija da izbjegnemo greške
var controller = (function(budgetCtrl, UICtrl){
        
    
    // stavljanje svih event listenera u jednu funkciju radi preglednosti
    var setupEventListeners = function () {
        
        var DOM = UICtrl.getDOMstrings();

        document.querySelector(DOM.inputButton).addEventListener('click', ctrAddItem);
    
        document.addEventListener('keypress', function(event){
        
            if (event.keyCode === 13 || event.which === 13) { // .which je za starije browsere
                ctrAddItem();
                }
            //problem*** tipka aktivira kod i kod pisanja vrijednosti, provjeriti može li ovisiti o fokusu
            if (event.code === "NumpadSubtract" || event.which === 65) { 
                if(document.activeElement != document.querySelector(DOM.inputDescription))
                {
                    document.querySelector(DOM.inputType).value = "exp";
                }
            }
            if (event.code === "NumpadAdd" || event.which === 187) { 
                if(document.activeElement != document.querySelector(DOM.inputDescription))
                {
                    document.querySelector(".add__type").value = "inc";
                }
            }
                 
        });
        
        document.querySelector(DOM.inputType).addEventListener("change", UICtrl.changedType);
        
        document.querySelector(DOM.container).addEventListener("click", ctrDelItem);
        
       
        
    }
        
    var updateBudget = function(){
        //calculate budget
        budgetCtrl.calculateBudget();
        //return budget
        var budget = budgetCtrl.getBudget();
        //display budget 
        UICtrl.displayBudget(budget);
        
        console.log(budgetCtrl.testing());
        
        
    };
    
    var updatePercentages = function() {
        
        //calc
        budgetCtrl.calculatePercentages();
        //get data
        var perc= budgetCtrl.getPercentages();
        //update UI
        UICtrl.displayPercentages(perc);
    };
                                  
    
    var ctrAddItem = function () {
        // get input data
    
        //predajemo objekt getinput iz UI kontrolera
        var input = UICtrl.getinput();
        console.log(input);
        //ne želimo prazne podatke
        if(input.description !== "" && !isNaN(input.value)) {
        
        //add item to budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);
        //add item to UI
            UICtrl.addListItem(newItem, input.type);
        // clear fields
            UICtrl.clearFields(); 
            
            updateBudget();
                    updatePercentages();

        }
    }
    
    
    var ctrDelItem = function (event) {
        var itemID, type, ID, splitID;
        
        itemID =event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        if(itemID){
            
            splitID = itemID.split('-');
            type=splitID[0];
            ID=splitID[1];
            
            console.log("poslani " + type + ID);
            
            budgetCtrl.removeItem(type, ID);
            UICtrl.removeListItem(itemID);
            //delete from data
            
            //delete from UI
            
            //update
            updateBudget();
                    updatePercentages();
            

        }
    }
    
    return {
        init: function() {
            setupEventListeners();
            UICtrl.displayTime();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1,                    
            });

            
        }
    }
    
})(budgetController, UIController);

controller.init();

             })();