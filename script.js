let addBtn = document.querySelector(".add-btn");
let removeBtn = document.querySelector(".remove-btn");

let modalCont = document.querySelector(".modal-cont");
let mainCont = document.querySelector(".main-cont");
let textAreaCont = document.querySelector(".textarea-cont");
let toolBoxColors = document.querySelectorAll(".color");
let allPriorityColors = document.querySelectorAll(".priority-color");



let colors = ["lightpink", "lightblue", "lightgreen", "black"];
let modalPriorityColour = colors[colors.length - 1];

let addFlag = false;
let removeFlag = false; 


let lockClass = "fa-lock";
let unlockClass = "fa-lock-open";

let ticketsArr = [];

if(localStorage.getItem("jira_tickets")) {

//retrieve and display tickets

ticketsArr = JSON.parse(localStorage.getItem("jira_tickets"));
ticketsArr.forEach((ticketObj) => {
    createTicket(ticketObj.ticketColor, ticketObj.tickettask, ticketObj.ticketID)
});

}

//filtering
for (let i = 0; i < toolBoxColors.length; i++) {
    toolBoxColors[i].addEventListener("click",  (e)=>{
        let currentToolBoxColor = toolBoxColors[i].classList[0];

        let filteredTickets = ticketsArr.filter((ticketObj, idx) =>{
            return currentToolBoxColor === ticketObj.ticketColor;
        })

        //remove privious tickets
        let allTicketsCont = document.querySelectorAll(".ticket-cont");
        for (let i = 0; i < allTicketsCont.length; i++) {
            allTicketsCont[i].remove();    
        }

        //display filtered tickets
        filteredTickets.forEach((ticketObj, idx) => {
            createTicket(ticketObj.ticketColor, ticketObj.tickettask, ticketObj.ticketID)
        })
    })

    toolBoxColors[i].addEventListener("dblclick", (e) => {
        //remove privious tickets
          let allTicketsCont = document.querySelectorAll(".ticket-cont");
          for (let i = 0; i < allTicketsCont.length; i++) {
              allTicketsCont[i].remove();    
          }

         //display all tickets
          ticketsArr.forEach((ticketObj, idx) => {
            createTicket(ticketObj.ticketColor, ticketObj.tickettask, ticketObj.ticketID);
          })
    })
    
}



//listener for modal priority coloring
allPriorityColors.forEach((colorElem, idx) => {
          colorElem.addEventListener("click", (e) =>{
              allPriorityColors.forEach((priorityColorElem, idx)=>{
                  priorityColorElem.classList.remove("border");
              })
              colorElem.classList.add("border");
              modalPriorityColour = colorElem.classList[0];
          })
})

addBtn.addEventListener("click", (e) => {
      //display modal
      //generate ticket

      //addFlag = true--> modal display
      //addFlag = false --> modal none
      addFlag = !addFlag;
      if(addFlag){
          modalCont.style.display = "flex";
      }
      else{
          modalCont.style.display = "none";
      }
})
removeBtn.addEventListener("click", (e) =>{
    removeFlag = !removeFlag;

})


modalCont.addEventListener("keydown", (e) => {
    let key = e.key;
    if(key === "Shift"){
        createTicket(modalPriorityColour, textAreaCont.value);
        addFlag = false;
        setModalToDefault();
    }
})

function createTicket(ticketColor, tickettask, ticketID) {
    let id = ticketID || shortid();
    let ticketCont = document.createElement("div");
    ticketCont.setAttribute("class", "ticket-cont");
    ticketCont.innerHTML = `
    <div class="ticket-color ${ticketColor}"></div>
    <div class="ticket-id">#${id}</div>
    <div class="task-area">${tickettask} </div>
    <div class="ticket-lock">
          <i class="fa-solid fa-lock"></i>
    </div>
    `;
    mainCont.appendChild(ticketCont);

    //create object of ticket and add to array
    if (!ticketID) {
        ticketsArr.push({ ticketColor, tickettask, ticketID: id });
        localStorage.setItem("jira_ticket", JSON.stringify(ticketsArr));
    }


    handleRemoval(ticketCont, id);
    handleLock(ticketCont, id);
    handleColor(ticketCont, id);
}

function handleRemoval(ticket, id){
ticket.addEventListener("click", (e)=>{
        //removefalg = true --> remove
        if(!removeFlag) return;

        let idx = getTicketIdx(id);

        //db removal
        ticketsArr.splice(idx, 1);
        let strTicketArr = JSON.stringify(ticketsArr);
        localStorage.setItem("jira_tickets", strTicketArr);

            ticket.remove();  //ui removal
        
})
}
function handleLock(ticket, id) {
    let ticketLockElem = document.querySelector(".ticket-lock");
    let ticketLock = ticketLockElem.children[0];
    let ticketTaskArea = ticket.querySelector(".task-area");

    ticketLock.addEventListener("click", (e) => {
        let ticketIdx = getTicketIdx(id);
        if (ticketLock.classList.contains(lockClass)) {
            ticketLock.classList.remove(lockClass);
            ticketLock.classList.add(unlockClass);
            ticketTaskArea.setAttribute("contenteditable", "true");
        }
        else {
            ticketLock.classList.remove(unlockClass);
            ticketLock.classList.add(lockClass);
            ticketTaskArea.setAttribute("contenteditable", "false");

        }
        //modify data in localStorage (ticket task)
        ticketsArr[ticketIdx].tickettask = ticketTaskArea.innerText;
        localStorage.setItem("jira_tickets", JSON.stringify(ticketsArr));


    });


}

function handleColor(ticket, id) {
    let ticketColor = ticket.querySelector(".ticket-color");
    ticketColor.addEventListener("click", (e)=>{
        //get ticketIdx from the tickets array
        let ticketIdx = getTicketIdx(id);
        
        let currentTicketcolor = ticketColor.classList[1];
        //get ticketcoloridx
        let currentTicketColorIdx = colors.findIndex((color) => {
           return currentTicketcolor === color;
    
        })
        currentTicketColorIdx++;
        let newTicketColorIdx = currentTicketColorIdx%colors.length;
        let newTicketColor = colors[newTicketColorIdx];
        ticketColor.classList.remove(currentTicketcolor);
        ticketColor.classList.add(newTicketColor);

        //modify data in localStorage(priority color change)
        ticketsArr[ticketIdx].ticketColor = newTicketColor;
        localStorage.setItem("jira_tickets", JSON.stringify(ticketsArr));
    })
 
}
function getTicketIdx(id) {
    let ticketIdx = ticketsArr.findIndex((ticketObj) => {
        return ticketObj.ticketID === id;
    })
    return ticketIdx;
}

 function setModalToDefault() {
    modalCont.style.display = "none";
    textAreaCont.value = "";
    modalPriorityColour = colors[colors.length-1];
    allPriorityColors.forEach((priorityColorElem, idx)=>{
        priorityColorElem.classList.remove("border");
    })
    allPriorityColors[allPriorityColors.length - 1].classList.add("border");
 }