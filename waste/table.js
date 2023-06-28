
var myData = [
    {name:"Michealbbbbbbbbbbbbbbbbbbbbbbbbbb", age:20, hometown:"New York", example: "extra"},
    {name:"Santino", age:25, hometown:"Los Angeles", example: "extra"},
    {name:"Fredo",   age:29, hometown:"California", example: "extra"},
    {name:"Hagen",   age:28, hometown:"Long Beach", example: "extra"},
]

//get references to the table and the head and body:
const myTable = document.getElementById('myTable');
const myTable_header = myTable.querySelector('thead')
const myTable_body = myTable.querySelector('tbody')

//Insert data function
function Insert_Data() {
  //Help...... :
  myTable_header.innerHTML = '';
  var tr = document.createElement('tr');
  const headers_data = Object.keys(myData[0]);
  headers_data.forEach((key) => {
    var th = document.createElement('th')
    th.innerHTML = key
    tr.appendChild(th);
  })
  myTable_header.appendChild(tr);
  myTable_body.innerHTML = '';
  for (let i = 0; i < myData.length; i++){
    var tr = document.createElement('tr');
    headers_data.forEach((key) => {
      var td = document.createElement('td');
      td.innerHTML = myData[i][key]
      tr.appendChild(td);
    });
    myTable_body.appendChild(tr);
  }
}
