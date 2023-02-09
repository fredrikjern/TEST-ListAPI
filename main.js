const API_BASE = "https://nackademin-item-tracker.herokuapp.com/"; //Den delen av API:urlen som är samma för alla anrop

const listSearchForm = document.querySelector("#list-search");
const listNameField = document.querySelector("#list-name");

const listsHolder = document.querySelector("#lists");
const listnameOutput = document.querySelector("#listname");
const listItemHolder = document.querySelector("#item-list");

const addItemForm = document.querySelector("#add-item"); 
const itemTitleField = document.querySelector("#item-title"); 
const itemDescField = document.querySelector("#item-desc");


let currentList = "";
/*
Tar emot ett objekt (ett item)
*/
function createItem(item) {
  const liElem = document.createElement("li"); 
  liElem.innerHTML = `<h4>${item.title}</h4><p>${item.description}${
    item.checked ? "checked" : ""
  }</p>`; // Om item.checked === true lägg till texten checked, annars en tom string

  const deleteItemBtn = document.createElement("button");
  deleteItemBtn.innerText = "Del";
  liElem.appendChild(deleteItemBtn); // Skapar en delete-knapp och appendar den som ett child till liElem. 

  const setAsCheckedBtn = document.createElement("button");
  setAsCheckedBtn.innerText = "Check";
  liElem.appendChild(setAsCheckedBtn); // Skapar en knapp med texten Check och lägger till som child till liElem

  listItemHolder.appendChild(liElem); // Lägger till listelementet(<li>) som skapats som child till listItemHolder(<ul>)

  deleteItemBtn.addEventListener("click", async function () {
    const res = await fetch(
      `${API_BASE}lists/${currentList}/items/${item._id}`,
      {
        method: "DELETE",
      }
    ); // deletar objekt med _id.
    const { list } = await res.json(); // Hämtar den nya listan som där objektet är borttaget.
    console.log("klick delete button, eventlistener  ");
    console.log(list);

    drawItems(list.itemList); //Ritar utan den nya listan som saknar det deletade objektet.
  });

    // PUT är en ändring, denna eventlistener skickar en förändring till APIet på objektet med _id där propertyn "checked" får värdet true.(Går ej att avbocka, det går dock att lägga till)
  setAsCheckedBtn.addEventListener("click", async function () {
    const res = await fetch(
      `${API_BASE}lists/${currentList}/items/${item._id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          checked: true,
        //   list: false,
        //   name: "ICA",
        }),
      }
    );
    const { list } = await res.json(); // Hämtar nya listan (Varje förändring i en lista kräver att man laddar om den på nytt)
    console.log("klick på Checked button, skickar PUT request    nya arrayen:");
    console.log(list);
    drawItems(list.itemList); //Tar bort gamla listan och ritar ut nya i DOM:en.
  });
}
/* 
    drawItems tar in en Array med objekt (itemS), rensar/tömmer containern och loopar sedan över alla objekt i arrayen.
    I loopen skickas det aktuella objektet(item) in i createItem(item).
*/
function drawItems(items) {
  listItemHolder.innerHTML = "";

  items.forEach((item) => {
    createItem(item);
  });
}
// Tror inte vi behöver denna om vi inte ska bygga funktionalitet för att byta user.
function drawLists(lists) {
  listsHolder.innerHTML = "";
  lists.forEach((list) => {
    const liElem = document.createElement("li");
    liElem.innerText = list.listname;
    const chooseListBtn = document.createElement("button");
    chooseListBtn.innerText = "Choose";
    liElem.appendChild(chooseListBtn);
    listsHolder.appendChild(liElem);

    chooseListBtn.addEventListener("click", function () {
      console.log("klick Choose list  sätter currentList till ._id på den lista du valt. Skippa denna då det bara behövs om vi ska kunna ha flera användare");
      console.log(list);
      currentList = list._id;
      //listnameOutput.value = list.listname;
      drawItems(list.itemList);
      listsHolder.innerHTML = "";
    });
  });
}
// Behövs ej för det vi ska göra
listSearchForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  const query = listNameField.value;
  const res = await fetch(`${API_BASE}listsearch?listname=${query}`);
  const data = await res.json();
  console.log("klick på Sök, hämtar och presenterar lista med listor");
  console.log(data);
  drawLists(data);
});
// Eventlistener på LÄGG TILL-knapp. Skickar en POST request till API:et med det nya objektet vi vill lägga till
// Kollar om textfälten är ifyllda, annars alert.
addItemForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  if (!currentList) { // OM (omvänd)currentList === true --> skicka en alert.  
    return alert("Choose a list");
  }

  const title = itemTitleField.value;
  const desc = itemDescField.value;

  if (!title || !desc) {  // OM !title === true ELLER !desc === true --> alerts. Är inputfältet tomt så är title = false , då är !title === true. Är ett snyggt sätt att skriva if-satser, lätt att läsa och lite kod
    return alert("Fill text boxes");
  }

  const res = await fetch(`${API_BASE}lists/${currentList}/items`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: title,
      description: desc,
    }),
  });
  const { list } = await res.json();
  console.log("klick på lägg till knapp. addItemform eventlistener, gör en POST med nya objektet till den valda listan. Får hela den nya listan, tömmer ul-container och generar den nya listan med");
  console.log(list);

  drawItems(list.itemList);
});
