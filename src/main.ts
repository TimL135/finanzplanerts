import './style.css'

let btnEingabeEinnahme = document.getElementById("einnahmeBestätigung");//Button in einnahme modal to confirm
let btnEingabeAusgabe = document.getElementById("ausgabeBestätigung");//Button in ausgabe modal to confirm

let btnEingabePlan = document.getElementById("planBestätigung");//Button in Plan erstellen modal to confirm

let plänebearbeiten = document.getElementById("planEditBestätigung")//Button in Plan ändern modal to confirm

let planLöschenBestätigung = document.getElementById("planLöschenBestätigung")//Button in Plan löschen modal to confirm

let carouselAnzahl = 0;//Indicates how many divs are in the carousel

let objectPlan: ObjectPlan[] = []
interface ObjectPlan {
  planGrund: string,
  planMenge: number,
  planDauer: number,
  planNummer: number,
  planGelöscht: boolean
};
//is used to store income and expenses and to calculate the difference
let einnahmeArray: number[] = [];
let ausgabeArray: number[] = [];

let checkedCheckbox = -1;//to choose the plan to save for

//show the greeting
let begrußung = document.getElementById("begrußung");
let div = document.createElement("div");
let text = ` Guten Tag, User`;
div.appendChild(document.createTextNode(text));
begrußung!.appendChild(div);

btnEingabeEinnahme!.onclick = function (event: Event) {
  event.preventDefault();
  let einnahmeGrund = getInput("einnahmeGrund").value;
  let einnahmeMenge = getInput("einnahmeMenge").value;

  if (einnahmeMenge && einnahmeGrund != "") {//to prevent blank entries
    einnahmeArray.push(parseInt(einnahmeMenge));

    let einnahmeGrundListe = document.getElementById("einnahmeGrundListe");
    let einnahmeMengeListe = document.getElementById("einnahmeMengeListe");
    let einnahmeDatumListe = document.getElementById("einnahmeDatumListe");

    // to show the income in the table
    let li = document.createElement("li");
    li.appendChild(document.createTextNode(einnahmeGrund));
    einnahmeGrundListe!.appendChild(li);

    li = document.createElement("li");
    li.appendChild(document.createTextNode(`${einnahmeMenge}€`));
    einnahmeMengeListe!.appendChild(li);

    let heute = new Date().toLocaleDateString();
    li = document.createElement("li");
    li.appendChild(document.createTextNode(heute));
    einnahmeDatumListe!.appendChild(li);

    gesamtBerechnen();//to calculate the new total value after every new income

    getInput("einnahmeGrund").value = "";
    getInput("einnahmeMenge").value = "";
  }
}
btnEingabeAusgabe!.onclick = function (event: Event) {
  event.preventDefault();
  let ausgabeGrund = getInput("ausgabeGrund").value;
  let ausgabeMenge = parseInt(getInput("ausgabeMenge").value);
  let checkboxNumber = 0;//to reset the checkboxcounter

  if (getInput("ausgabeMenge").value != "") {
    //checked which checkbox is checked to know for which plan the user wants to save 
    for (let checkbox of document.querySelectorAll(".checkbox")) {
      if ((document.getElementById(`checkbox${checkboxNumber}`) as HTMLInputElement).checked == true) {
        checkedCheckbox = checkboxNumber;
      }
      checkboxNumber++;//count until a checkbox is checked
    }
  }
  if (checkedCheckbox > -1) {//checkCheckbox is -1 when no checkbox is checked and > -1 if one is checked
    (document.getElementById(`checkbox${checkedCheckbox}`) as HTMLInputElement).checked = false
    ausgabeFunction(`Plan${checkedCheckbox + 1}`, ausgabeMenge);
  } else {
    if (ausgabeMenge && ausgabeGrund != "") {
      ausgabeFunction(ausgabeGrund, ausgabeMenge);
    }
  }
}
function ausgabeFunction(ausgabeGrund: string, ausgabeMenge: number) {
  if (checkedCheckbox > -1) {
    //the user save for a plan so the planMenge must by change  
    let planElement = document.getElementById(`plan${checkedCheckbox}`)!
    let currentPlan = objectPlan[checkedCheckbox]
    planChange(currentPlan.planNummer,
      planElement,
      currentPlan.planGrund,
      currentPlan.planDauer,
      currentPlan.planMenge - ausgabeMenge);
    currentPlan.planMenge -= ausgabeMenge;
  }
  checkedCheckbox = -1//reset checkedCheckbox for the next use
  ausgabeArray.push(ausgabeMenge);//push the ausgabeMenge in the ausgabeArray to calculate the total

  let ausgabeGrundListe = document.getElementById("ausgabeGrundListe")!;
  let ausgabeMengeListe = document.getElementById("ausgabeMengeListe")!;
  let ausgabeDatumListe = document.getElementById("ausgabeDatumListe")!;
  // to show the spendings in the table
  let li = document.createElement("li");
  li.appendChild(document.createTextNode(ausgabeGrund));
  ausgabeGrundListe.appendChild(li);

  li = document.createElement("li");
  li.appendChild(document.createTextNode(`${ausgabeMenge}€`));
  ausgabeMengeListe.appendChild(li);

  let heute = new Date().toLocaleDateString();
  li = document.createElement("li");
  li.appendChild(document.createTextNode(heute));
  ausgabeDatumListe.appendChild(li);

  gesamtBerechnen();//to calculate the new total value after every new spending
  getInput("ausgabeGrund").value = "";
  getInput("ausgabeMenge").value = "";
}
btnEingabePlan!.onclick = function (event: Event) {
  event.preventDefault();
  let carouselItemFirst = document.getElementById("carouselItemFirst")!

  let planGrund = getInput("planGrund").value;
  let planMenge = getInput("planMenge").value;
  let planDauer = getInput("planDauer").value;
  if (planGrund && planMenge && planDauer != "") {
    if (carouselAnzahl == 0) {//carouselAnzahl is 0 when the user have no active plan
      //the buttons are only visible when they have a function
      document.getElementById("planBearbeitenKnopf")!.classList.remove("d-none")
      document.getElementById("planLöschenKnopf")!.classList.remove("d-none")
      //make a object of the plan to use the data of other functions
      objectPlan[carouselAnzahl] = {
        planGrund: planGrund,
        planMenge: parseInt(planMenge),
        planDauer: parseInt(planDauer),
        planNummer: carouselAnzahl,
        planGelöscht: false
      }
      planHistoryErstellen(carouselAnzahl)//put the plan in the History there are all plans and the history can not be deleted
      let plan = [planGrund, planMenge, planDauer];
      //delet the text "Du Hast noch keinen Plan Drücke den Knopf um einen zu erstellen"
      for (let i = 0; i < 3; i++) {
        carouselItemFirst.removeChild(carouselItemFirst.firstChild!);
      }
      //put the plan in the div 
      carouselItemFirst.appendChild(document.createTextNode(`Plan ${carouselAnzahl + 1}`));
      for (let i = 0; i < 3; i++) {
        let br = document.createElement("br");
        carouselItemFirst.appendChild(br)
        switch (i) {
          case 0: carouselItemFirst.appendChild(document.createTextNode(`Du sparst für: ${plan[i]}`)); break
          case 1: carouselItemFirst.appendChild(document.createTextNode(`Dir fehlen: ${plan[i]} €`)); break
          case 2: carouselItemFirst.appendChild(document.createTextNode(`Du sparst: ${plan[i]} Tage`)); break
        }
      }
      //remove the active from all carousel-items
      for (let carouselItem of document.querySelectorAll(".carousel-item")) {
        carouselItem.classList.remove("carousel-item", "active")
      }
      //make the new carousel-item active so only 1 carousel-item is active
      carouselItemFirst.classList.add("carousel-item", "active");
      let br = document.createElement("br");
      carouselItemFirst.appendChild(br)
      //calculate how much the user have to save per day to reach the goal
      carouselItemFirst.appendChild(document.createTextNode(`Empfehlung: ${Math.round((parseInt(plan[1]) / parseInt(plan[2])) * 100) / 100}€ pro Tag`));

      carouselItemFirst.id = `plan${carouselAnzahl}`;

      getInput("planGrund").value = "";
      getInput("planMenge").value = "";
      getInput("planDauer").value = "";

      //make selectOptions in the PlanLöschen and PlanBearbeiten modal
      selectOptionErstellen("inputGroupSelect01", `Plan ${carouselAnzahl + 1}`, `${carouselAnzahl + 1}`)
      selectOptionErstellen("inputGroupSelect02", `Plan ${carouselAnzahl + 1}`, `${carouselAnzahl + 1}`)

      checkboxErstellen(planGrund, carouselAnzahl);// make a checkbox in the ausgabemodal so an user can select a plan
      carouselAnzahl++;
    } else {//carouselAnzahl!=0
      //make a object of the plan to use the data of other functions
      objectPlan[carouselAnzahl] = {
        planGrund: planGrund,
        planMenge: parseInt(planMenge),
        planDauer: parseInt(planDauer),
        planNummer: carouselAnzahl,
        planGelöscht: false
      }
      planHistoryErstellen(carouselAnzahl)//put the plan in the History there are all plans and the history can not be deleted
      let plan = [planGrund, planMenge, planDauer];
      //create a new div as an active carousel-item
      let div = document.createElement("div");
      div.appendChild(document.createTextNode(`Plan ${carouselAnzahl + 1}`));
      //remove the active from all carousel-items
      for (let i = 0; i < 3; i++) {
        let br = document.createElement("br");
        div.appendChild(br)
        switch (i) {
          case 0: div.appendChild(document.createTextNode(`Du sparst für: ${plan[i]}`)); break
          case 1: div.appendChild(document.createTextNode(`Dir fehlen: ${plan[i]} €`)); break
          case 2: div.appendChild(document.createTextNode(`Du sparst: ${plan[i]} Tage`)); break
        }
      }
      for (let carouselItem of document.querySelectorAll(".carousel-item")) {
        carouselItem.classList.remove("active")
      }
      //make the new carousel-item active so only 1 carousel-item is active
      div.classList.add("carousel-item", "active");
      let br = document.createElement("br");
      div.appendChild(br)
      //calculate how much the user have to save per day to reach the goal
      div.appendChild(document.createTextNode(`Empfehlung: ${Math.round((parseInt(plan[1]) / parseInt(plan[2])) * 100) / 100}€ pro Tag`));
      div.id = `plan${carouselAnzahl}`;
      document.getElementById("carousel")!.appendChild(div);
      getInput("planGrund").value = "";
      getInput("planMenge").value = "";
      getInput("planDauer").value = "";
      //make selectOptions in the PlanLöschen and PlanBearbeiten modal
      selectOptionErstellen("inputGroupSelect01", `Plan ${carouselAnzahl + 1}`, `${carouselAnzahl + 1}`)
      selectOptionErstellen("inputGroupSelect02", `Plan ${carouselAnzahl + 1}`, `${carouselAnzahl + 1}`)
      checkboxErstellen(planGrund, carouselAnzahl);
      carouselAnzahl++;
      //löschmich is created when the user delet the only active plan and has the text "Du Hast noch keinen Plan Drücke den Knopf um einen zu erstellen"
      if (document.getElementById("löschmich")) {
        //when the user make a new plan the buttons must be visible and the text must be deleted
        document.getElementById("planBearbeitenKnopf")!.classList.remove("d-none")
        document.getElementById("planLöschenKnopf")!.classList.remove("d-none")
        document.getElementById("löschmich")!.remove()
      }
    }
  }
}
function planHistoryErstellen(i: number) {//make a overview of the plans 
  let ul = document.getElementById("PlanNameHistory")!;
  let li = document.createElement("li");
  li.appendChild(document.createTextNode(`Plan${objectPlan[i].planNummer + 1}`));
  ul.appendChild(li);

  ul = document.getElementById("SparGrundHistory")!;
  li = document.createElement("li");
  li.appendChild(document.createTextNode(`${objectPlan[i].planGrund}`));
  ul.appendChild(li);

  ul = document.getElementById("SparMengeHistory")!;
  li = document.createElement("li");
  li.appendChild(document.createTextNode(`${objectPlan[i].planMenge}€`));
  ul.appendChild(li);

  ul = document.getElementById("SparDauerHistory")!;
  li = document.createElement("li");
  li.appendChild(document.createTextNode(`${objectPlan[i].planDauer} Tage`));
  ul.appendChild(li);
}
//make a checkbox with a label that show the planGrund 
function checkboxErstellen(planGrund: string, planNummer: number) {
  let ul = document.getElementById("ausgabePlan")!;
  let li = document.createElement("li");
  let checkbox = document.createElement("INPUT");
  checkbox.setAttribute("type", "checkbox");
  checkbox.setAttribute("name", "check");
  checkbox.setAttribute("onclick", "onlyOne(this)");
  checkbox.classList.add("checkbox");
  checkbox.id = `checkbox${planNummer}`
  let label = document.createElement("Label");
  label.innerHTML = `Sparen für: ${planGrund}`
  label.setAttribute("for", `checkbox${planNummer}`);
  label.setAttribute("style", "margin-left:5px")
  label.id = `label${planNummer}`
  li.appendChild(checkbox);
  li.appendChild(label)
  ul.appendChild(li);
}
//adds up all income and subtracts all expenses
//return gesamt as a number
function gesamtBerechnen() {
  let gesamt = 0;
  for (let i = 0; i < einnahmeArray.length; i++) {
    gesamt += einnahmeArray[i];
  }
  for (let i = 0; i < ausgabeArray.length; i++) {
    gesamt -= ausgabeArray[i];
  }
  if (document.getElementById("gesamt") == null) throw new Error("1");
  let gesamtText = document.getElementById("gesamt")!;
  gesamtText.removeChild(gesamtText.firstChild!);
  let div = document.createElement("div");
  div.appendChild(document.createTextNode(`${gesamt}€`));
  if (gesamt > 0) {
    gesamtText.setAttribute("style", "color:green")
  }
  if (gesamt < 0) {
    gesamtText.setAttribute("style", "color:red")
  }
  if (gesamt == 0) {
    gesamtText.setAttribute("style", "color:#212529")
  }
  gesamtText.appendChild(div);
  return gesamt;
}
//allows the user to change the plans with completely new values
plänebearbeiten!.onclick = function (event: Event) {
  event.preventDefault
  let planGrund = getInput("planEditGrund").value
  let planDauer = parseInt(getInput("planEditDauer").value)
  let planMenge = parseInt(getInput("planEditMenge").value)
  let inputGroupSelectOne = document.getElementById("inputGroupSelect02") as HTMLSelectElement
  if (planGrund != "") {
    if (planDauer && getInput("planEditMenge").value != "") {
      let planid = getInput(`plan${parseInt(inputGroupSelectOne.value) - 1}`)//get the plan which the user selected -1 is because the first plan is at 1 and not at 0
      getInput("planEditGrund").value = ""
      getInput("planEditDauer").value = ""
      getInput("planEditMenge").value = ""
      planChange(inputGroupSelectOne.selectedIndex - 1, planid, planGrund, planDauer, planMenge)
    }
  }
}
function planChange(planNummer: number, planid: HTMLElement, planGrund: string, planDauer: number, planMenge: number) {
  let plan = [planGrund, planMenge, planDauer];
  //delet the old plan from the div
  for (let i = 0; i < 9; i++) {
    if (planid.firstChild != null) {
      planid.removeChild(planid.firstChild);
    }
  }
  //put the new values in the div 
  planid.appendChild(document.createTextNode(`Plan ${objectPlan[planNummer].planNummer + 1}`));
  for (let i = 0; i < 3; i++) {
    let br = document.createElement("br");
    planid.appendChild(br)
    switch (i) {
      case 0: planid.appendChild(document.createTextNode(`Du sparst für: ${plan[i]}`)); break
      case 1: planid.appendChild(document.createTextNode(`Dir fehlen: ${plan[i]} €`)); break
      case 2: planid.appendChild(document.createTextNode(`Du sparst: ${plan[i]} Tage`)); break
    }
  }
  let br = document.createElement("br");
  planid.appendChild(br)
  planid.appendChild(document.createTextNode(`Empfehlung: ${Math.round((parseInt(plan[1] + "") / parseInt(plan[2] + "")) * 100) / 100}€ pro Tag`));

}
//makes that only one checkbox can be selected
function onlyOne(checkbox: HTMLInputElement) {
  var checkboxes = document.getElementsByName('check') as NodeListOf<HTMLInputElement>
  checkboxes.forEach((item) => {
    if (item !== checkbox) item.checked = false
  })
}
// allows the user to delet plans
planLöschenBestätigung!.onclick = function (event) {
  event.preventDefault
  let value = parseInt(getInput("inputGroupSelect01").value)
  //remove all active from the carousel-items so it can not give 2 
  for (let carouselItem of document.querySelectorAll(".carousel-item")) {
    carouselItem.classList.remove("active")
  }
  planLöschen(value - 1)
}
function planLöschen(planNummer: number) {
  let planid = document.getElementById(`plan${planNummer}`)
  if (planid == null) throw new Error("404")

  if (document.querySelectorAll(".carousel-item").length > 1) {//if more than 1 plan is active it can be simple deleted
    planid.parentNode!.removeChild(planid);
    objectPlan[planNummer].planGelöscht = true;
    let i = 0;
    //select the first plan which is not deleted to set it active
    while (objectPlan[i].planGelöscht) {
      i++;
    }
    if (document.getElementById(`plan${i}`) == null) throw new Error("404")
    document.getElementById(`plan${i}`)!.classList.add("carousel-item", "active");

    if (document.getElementById(`checkbox${planNummer}`) == null) throw new Error("404")
    document.getElementById(`checkbox${planNummer}`)!.remove();

    if (document.getElementById(`label${planNummer}`) == null) throw new Error("404")
    document.getElementById(`label${planNummer}`)!.remove();
    selectOptionLöschen("inputGroupSelect01")
  } else {//if only 1 plan is active the 2 buttons must be invisible and the text "Du Hast noch keinen Plan Drücke den Knopf um einen zu erstellen" must be create
    document.getElementById("planBearbeitenKnopf")!.classList.add("d-none")
    document.getElementById("planLöschenKnopf")!.classList.add("d-none")
    div = document.createElement("div");
    let br = document.createElement("br")
    div.appendChild(document.createTextNode("Du Hast noch keinen Plan"));
    div.appendChild(br);
    div.appendChild(document.createTextNode("Drücke den Knopf um einen zu erstellen"));
    div.classList.add("active");
    div.id = "löschmich"
    document.getElementById("carousel")!.appendChild(div);
    planid.parentNode!.removeChild(planid);
    objectPlan[planNummer].planGelöscht = true;
    if (document.getElementById(`checkbox${planNummer}`) == null) throw new Error("404")
    document.getElementById(`checkbox${planNummer}`)!.remove();
    if (document.getElementById(`label${planNummer}`) == null) throw new Error("404")
    document.getElementById(`label${planNummer}`)!.remove();
    selectOptionLöschen("inputGroupSelect01")
  }
}
//you can give the function the id of a inputGroupSelect and a inputGroupSelectValue and the Text that the user can see
function selectOptionErstellen(inputGroupSelect: string, inputGroupSelectValue: string, inputGroupSelectnumber: string) {
  if (document.getElementById(inputGroupSelect) == null) throw new Error("404")
  document.getElementById(inputGroupSelect)!.appendChild(new Option(inputGroupSelectValue, inputGroupSelectnumber));
}
//all delete the index at inputGroupSelect01 and inputGroupSelect02
function selectOptionLöschen(inputGroupSelect: string) {
  let inputGroupSelectOne = document.getElementById(inputGroupSelect) as HTMLSelectElement;
  let inputGroupSelectTwo = document.getElementById("inputGroupSelect02") as HTMLSelectElement;
  if (inputGroupSelectOne == null) throw new Error("404")
  if (inputGroupSelectTwo == null) throw new Error("404")
  inputGroupSelectTwo.remove()
  inputGroupSelectOne.remove()
  inputGroupSelectOne.selectedIndex = 0;
  inputGroupSelectTwo.selectedIndex = 0;
}
//give an error if the Element is null
function getInput(id: string): HTMLInputElement {
  if (!document.getElementById(id)) throw new Error("element not found with id " + id)
  if (document.getElementById(id)?.tagName != "INPUT") throw new Error("getInput invoked on non Input element with id " + id)
  return document.getElementById(id) as HTMLInputElement;
}