// UPDATE SAVE TASKS();

var jQueryTasks = {}; // USED FOR LOCAL STORAGE BELOW

var auditTask = function(taskEl){
  // to ensure element is getting to the function
  console.log(taskEl);
    //get date from task element
  var date = $(taskEl)
    .find("span")
    .text()
    .trim();

  // ensure it worked
  console.log(date);

  //convert to moment object at 5:00pm
  var time = moment(date, "L").set("hour", 17);
    // this should print out an object for the value of the date variable, but at 5pm of that date
  console.log(time)

  // remove any old classes from element, IN CASE THE ELEMENT IS EDIT TO A DIFFERENT DAY THAT IS NOT OVERDUE
  $(taskEl).removeClass("list-group-item-warning list-group-item-danger");

  //apply new class if task is near/over due date
  if (moment().isAfter(time)){
    // adding bootstrap class for elements past the due date at 5PM
    $(taskEl).addClass("list-group-item-danger");

  }
  else if(Math.abs(moment().diff(time, "days")) <= 2 )
    // adding bootstrap class for elements 2 days will be due
    $(taskEl).addClass("list-group-item-warning");
}

var createTask = function(taskText, taskDate, taskList) {

  // create elements that make up a task item under TO DO
  var taskLi = $("<li>")
    .addClass("list-group-item");
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(taskDate);
  var taskP = $("<p>")
    .addClass("m-1")
    .text(taskText);

  // append span and p element to the new parent LI
  taskLi.append(taskSpan, taskP);

  //check due date
  auditTask(taskLi);


  // append to ul list on the page
  $("#list-" + taskList).append(taskLi);
};

var loadTasks = function() {
  jQueryTasks = JSON.parse(localStorage.getItem("jQueryTasks"));

  console.log("loadTasks is working")

  // if nothing in localStorage, create a new object to track all task status arrays
  if (!jQueryTasks) {
    console.log("there are no tasks")
    jQueryTasks = {
      toDo: [],
      inProgress: [],
      inReview: [],
      done: []
    };
    return;
  }

  console.log("past the if statement")

  // loop over object properties
  $.each(jQueryTasks, function(list, arr) {
    console.log(list, arr);
    // then loop over sub-array
    arr.forEach(function(task) {
      createTask(task.text, task.date, list);
    });
  });
};

var saveTasks = function() {
  localStorage.setItem("jQueryTasks", JSON.stringify(jQueryTasks));
};




// modal was triggered
$("#task-form-modal").on("show.bs.modal", function() {
  // clear values
  $("#modalTaskDescription, #modalDueDate").val("");
});

// modal is fully visible
$("#task-form-modal").on("shown.bs.modal", function() {
  // highlight textarea
  $("#modalTaskDescription").trigger("focus");
});

// save button in modal was clicked
$("#task-form-modal .btn-primary").click(function() {
  // get form values
  var taskText = $("#modalTaskDescription").val();
  var taskDate = $("#modalDueDate").val();

  if (taskText && taskDate) {
    createTask(taskText, taskDate, "toDo");

    // close modal
    $("#task-form-modal").modal("hide");

    // save in tasks array
    jQueryTasks.toDo.push({
      text: taskText,
      date: taskDate
    });

    saveTasks();
  }
});


//EDITING CREATED TASK IN "p" BY CREATING NEW LINE TO REPLACE OLD ONE, BY CLICKING ON IT AND TYPING SOMETHING NEW
$(".list-group").on("click","p",function(){
  // text is now a variable that capture text from 'this', which is the 'p' in the ul list
  var text = $(this)
    .text()
    // trim is a task used to cut spaces before or after the text '  hello '
    .trim();
  console.log(text);

  // we are creating a new <textarea> element, we are adding the TEXT variable to it as a val.
  var textInput = $("<textarea>")
    .addClass("form-control")
    .val(text);
  //as the above is taking place, the new element text area is replacing the P, which is (this)
    $(this).replaceWith(textInput)

    textInput.trigger("focus");
  
})

//NOW WE NEED TO SAVE OUR NEW EDIT, blur means we are not touching the area anymore, SO IT WILL SAVE BY DEFAULT
$(".list-group").on("blur","textarea", function(){
  // get the textarea's current value/text
  var text = $(this)
    .val() // using val because (this) is now the text area, not the 'p'
    .trim();

    // WE ARE DOING THIS BECAUSE WE ARE GOING TO HAVE MULTIPLE SECTIONS WITH "LIST-.....", SO WE NEED THE P TO BE SAVED INTO THE RIGHT TASKS LIST, WHICH IN THIS CASE IS THE 'TO DO' LIST, WE ARE SIMPLY GETTING THE NAME OF THE ARRAY IT IS GOING TO BE SAVED IN, WHICH IS ALSO THE LIST NAME
  // get the parent ul's id attribute
  var status = $(this)
  // going up the parent tree until we arrive at the element with the attached class
    .closest(".list-group")
    //get value of the attribute we are getting
    .attr("id")
    // the result of replace will be 'toDo', which is the name of 'tasks.toDo'
    .replace("list-","");
  console.log(status);
  
  // get the task's position in the list of other li elements
  var index = $(this)
    .closest(".list-group-item") //the class refering to the li elements
    .index(); //refering to the number in order of our list

  console.log(status);
  console.log(index);
  console.log(text);
  console.log(jQueryTasks);

  console.log(jQueryTasks[status][index])
  jQueryTasks[status][index].text = text;
  saveTasks();
   //FIRST TEXT IS THE TEXT WERE ARE LOCATING FROM THE ARRAY (IT IS A PROPERTY), THE SECOND IS THE TEXT WE CREATED AS A VARIABLE AT THE TOP OF THIS FUNCTION, WE ARE EQUALING THE FIRST PART TO THE SECOND


  //recreate p element
  var taskP = $("<p>")
  .addClass("m-1")
  .text(text)

  $(this).replaceWith(taskP);
});

$(".list-group").on("click","span",function(){
  // get current text from datee
  var date = $(this)
    .text()
    .trim()

  // create new input element
  var dateInput = $("<input>")
    .addClass("form-control")
    .attr("type","text")
    .val(date)

  
  //swap out elements
  $(this).replaceWith(dateInput);

  //enable jquery ui datepicker
  dateInput.datepicker({
    minDate: 1,
    onClose: function(){
      /// when calendar is closed, force a "change" event on the 'dateInput'
      $(this).trigger("change");
    }
  })

  
  //automatically focus on new element
  dateInput.trigger("focus");


})

$(".list-group").on("change", "input[type='text']", function() {
  // get current text
  var date = $(this)
    .val()
    .trim()

  //get parent ul's id attribute
  var status = $(this)
  // going up the parent tree until we arrive at the element with the attached class
  .closest(".list-group")
  //get value of the attribute we are getting
  .attr("id")
  // the result of replace will be 'toDo', which is the name of 'tasks.toDo'
  .replace("list-","");

  var index = $(this)
    .closest(".list-group-item")
    .index();

  //update tast in array and re-save to local storage
  jQueryTasks[status][index].date=date;
  saveTasks();

  //recreate spam element with Bootstrap classes

  var taskSpan =$("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(date)

  $(this).replaceWith(taskSpan);

  //pass task's <li> element into auditTask() to check the new due date
  auditTask($(taskSpan).closest(".list-group-item"));
});



// remove all tasks
$("#remove-tasks").on("click", function() {
  for (var key in jQueryTasks) {
    jQueryTasks[key].length = 0;
    $("#list-" + key).empty();
  }
  saveTasks();
});

// load tasks for the first time
loadTasks();

//sorting items in list in any order with sortable, with connectWith, I can move it to other list groups
$(".card .list-group").sortable({
  connectWith: $(".card .list-group"),

  scroll: false,
  tolerance: "pointer",
  helper: "clone",
  activate: function(event){
    console.log("activate",this);
  },
  deactivate: function(event){
    console.log("deactivate",this);
  },
  over: function(event){
    console.log("over",event.target);
  },
  out: function(event){
    console.log("out", event.target);
  },

  // previous returned the full list with elements of the groups affected
  // update: function(event){
  //   console.log("update",this);
  // }

  // this now has THIS as a jquery item, so now we see all the properties as well as the index of item in list with CHILDREN
  // update: function(event){
  //   console.log("update",$(this).children());
  // },

  // HOW TO SAVE IT IN LOCAL STORAGE

  update: function(event){
      // temporary array created to push item data thats being moved, into the new list in local storage
     var tempArr = [];

      console.log("update",this);


    // loop oveer current set of children in sortable list, the seecond THIS is now the item in the list, not the list
    $(this).children().each(function(){
      console.log(this);
      console.log($(this)); //to use jquery methods

      var text = $(this)
        .find("p")
        .text()
        .trim();
      
      var date = $(this)
        .find("span")
        .text()
        .trim();

      console.log(text, date);

      // add task date to the temp array as an object
      tempArr.push({
        text: text,
        date: date,
      });
    });

    console.log (tempArr);

    //THIS is back to the ul list, not the li, retiving the correct array to which items are being moved to
    var arrName = $(this)
      .attr("id")
      .replace("list-","");

    //update array on tasks object and save
    jQueryTasks[arrName] = tempArr;
    saveTasks();
    
  }

});

$("#trash").droppable({
  accept: ".card .list-group-item",
  tolerance: "touch",
  // for js to grab the list item, UI is added to parameter,  using this or event.target would select the trash
  drop: function(event, ui){
    console.log("drop");
    ui.draggable.remove();
  },
  over: function(event, ui){
    console.log("over");
  },
  out: function(event, ui){
    console.log("out");
  }
});

// adding calendar to date picker input

$("#modalDueDate").datepicker({
  minDate: 1 // this prevents the user from selecting dates that were yesterday
});

