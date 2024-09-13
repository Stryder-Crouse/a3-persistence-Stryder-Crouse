// FRONT-END (CLIENT) JAVASCRIPT HERE

const submitPlayer = async function( ev ) {
  // stop form submission from trying to load
  // a new .html page for displaying results...
  // this was the original browser behavior and still
  // remains to this day
  ev.preventDefault()

  // make new record and populate with data from form
  let newRecord = {}
  newRecord['rDyn'] = parseInt(document.getElementById("rDyn").value)
  newRecord['rPPR'] = parseInt(document.getElementById("rPPR").value)
  newRecord['name'] = document.getElementById("name").value
  newRecord['team'] = document.getElementById("team").value
  newRecord['pos'] = document.getElementById("pos").value
  newRecord['byeWeek'] = parseInt(document.getElementById("byeWeek").value)
  newRecord['age'] = parseInt(document.getElementById("age").value)

  //send new data
  let message = JSON.stringify( newRecord )

  const response = await fetch( '/submit', {
    method:'POST',
    headers:{'Content-Type': 'application/json'},
    body: message
  })

  const text = await response.text()

  if(response.ok) {
    await loadTable()
  }

  console.log( 'text:', text )
}

async function handleDelete(event) {
  let deleteButton = event.target
  //send id to delete
  let dbIdToDelte = deleteButton.dbId
  let message = JSON.stringify({dbId: dbIdToDelte})

  const response = await fetch('/delete', {
    method: 'POST',
    headers:{'Content-Type': 'application/json'},
    body: message
  })

  const text = await response.text()

  if (response.ok) {
    await loadTable()
  }

  console.log('text:', text)
}
async function loadTable() {

  let FFtableBody = document.getElementById("FFtable")
  //delete any only entries
  while (FFtableBody.children.length >0){
    FFtableBody.removeChild(FFtableBody.lastChild)
  }

  // fetch table data from backend
  const response = await fetch('/FFtable', {
    method: 'GET'
  })
  let FFdata = JSON.parse(await response.text())
  // create new rows in table based on data
  for (let i =0; i<FFdata.length;i++) {
    let newTableRow = document.createElement("tr")
    createCell(newTableRow,FFdata[i]["rDyn"])
    createCell(newTableRow,FFdata[i]["rPPR"])
    createCell(newTableRow,FFdata[i]["rDelta"])
    createCell(newTableRow,FFdata[i]["name"])
    createCell(newTableRow,FFdata[i]["team"])
    createCell(newTableRow,FFdata[i]["pos"])
    createCell(newTableRow,FFdata[i]["byeWeek"])
    createCell(newTableRow,FFdata[i]["age"])
    //create edit cell
    let editCell = document.createElement("td")
    editCell.textContent = "Edit"
    editCell.className="editCell"
    editCell.addEventListener("click",handleEdit)
    editCell.dbId = FFdata[i]["_id"]
    newTableRow.append(editCell)
    //create delete cell
    let deleteCell = document.createElement("td")
    deleteCell.textContent = "Delete"
    deleteCell.className="editCell"
    deleteCell.addEventListener("click",handleDelete)
    deleteCell.dbId = FFdata[i]["_id"]
    newTableRow.append(deleteCell)
    FFtableBody.append(newTableRow)
  }
}

function createCell(row,content){
  let cell = document.createElement("td")
  cell.textContent = content
  row.append(cell)
}

async function handleEdit(event){
  let editButton = event.target
  editButton.textContent="Save"
  editButton.removeEventListener("click",handleEdit)
  let currentRow = editButton.parentElement
  //skip last element as thats the save button
  for(let i =1; i<currentRow.children.length-1;i++){
    let cell = currentRow.children[i]
    let input = document.createElement("input")
    input.setAttribute("value",cell.textContent)
    input.setAttribute("type","text")
    input.className = "editInput"
    cell.textContent = ""
    cell.appendChild(input)
  }
  editButton.addEventListener("click",handleSave)
}

async function handleSave(event) {
  let editButton = event.target
  let dbId = editButton.dbId

  let dbIdToGet = {dbId: dbId}
  let message = JSON.stringify(dbIdToGet)

  const response = await fetch('/record', {
    method: 'POST',
    headers:{'Content-Type': 'application/json'},
    body:message
  })

  if(!response.ok){
    console.error("record id for edit not found")
    return
  }

  let editedRecord = JSON.parse(await response.text())
  console.log(editedRecord)

  let currentRow = editButton.parentElement
  let recordFields = ["rDyn","rPPR","rDelta","name","team","pos","byeWeek","age"]

  let test = currentRow.children[1]
  let inputTest = test.firstElementChild
  let valueTest = inputTest.value

  //skip last two element as thats the edit and delete button
  for(let i =1; i<currentRow.children.length-1;i++){
    let cell = currentRow.children[i]
    let input = cell.firstElementChild
    let value = input.value

    editedRecord[recordFields[i-1]]=value
    cell.removeChild(input)
    cell.textContent=value
  }


  let editMessage = {dbId: dbId, editedRecord: editedRecord}
  const responseEdit = await fetch('/edit', {
    method: 'POST',
    headers:{'Content-Type': 'application/json'},
    body: JSON.stringify(editMessage)
  })

  if(responseEdit.ok){
    editButton.removeEventListener("click",handleSave)
    await loadTable()
  }
  else{
    console.error("edit failed")
  }

}

async function logout(){
  const response = await fetch('/logout', {
    method: 'POST'
  })
  window.location.href="/login"
}

window.onload = function() {
  const button = document.getElementById("EntrySubmit");
  button.onclick = submitPlayer;
  loadTable().then(r => {})
}