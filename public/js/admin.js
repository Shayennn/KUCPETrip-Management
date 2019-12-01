var people = db.collection("people");
let user_data;

document.getElementById('logout_btn').addEventListener("click", () => {
    firebase.auth().signOut().then(function () {
        window.location = 'login.html';
    }).catch(function (error) {
        alert(error);
    });
})

firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        console.log(user);
        // User is signed in.
        document.getElementById('user_dn').innerHTML = user.displayName;
        document.getElementById('user_pic').src = user.photoURL + '=s40-c';
        loadDB().then(showPage)
    } else {
        window.location = 'login.html';
    }
});

async function loadDB() {
    await people.doc(firebase.auth().currentUser.email).get().then(res => {
        if (res.exists) {
            user_data = res.data();
            if (!user_data.IsAdmin)window.location = 'index.html';
        }
        else {
            firebase.auth().signOut().then(function () {
                window.location = 'login.html';
            }).catch(function (error) {
                alert(error);
            });
        }
    }).catch(function (error) {
        alert(error);
    });
    await people.where('IsPaid', "==", true).get().then(showPeople)
}

async function showPage() {
    document.getElementById('main_content').style.display = '';
    document.getElementById('loading').style.display = 'none';
}

async function loadingPage() {
    document.getElementById('main_content').style.display = 'none';
    document.getElementById('loading').style.display = '';
}

function compare( a, b ) {
    if ( a.data().StudentID < b.data().StudentID ){
      return -1;
    }
    if ( a.data().StudentID > b.data().StudentID ){
      return 1;
    }
    return 0;
}

async function showPeople(res) {
    if (res.docs.length != 0) {
        document.getElementById("noPeople").style.display = 'none';
        document.getElementById("peopleTable").style.display = '';
    }
    document.getElementById('db_ConfirmCount').innerText = res.docs.length+' คน'
    let table = document.getElementById('people_data');
    table.innerHTML=''
    res.docs.sort(compare).forEach(row => {
        let row_data = row.data()
        // console.log(row_data)
        let tr = document.createElement("tr")
        let studentid = document.createElement("td")
        studentid.scope = "row"
        studentid.innerText = row_data.StudentID
        let IsPaid = document.createElement("td")
        IsPaid.innerHTML = row_data.IsPaid ? '<span class="badge badge-success">ชำระแล้ว</span>' : '<span class="badge badge-danger">ยังไม่ชำระ/ยังไม่ครบ</span>'
        let name = document.createElement("td")
        name.innerText = 'Loading...'
        const Http = new XMLHttpRequest();
        const url='https://cpe.shayennn.com/nameresolve.php?id='+row_data.StudentID;
        Http.open("GET", url);
        Http.send();
        Http.onreadystatechange = (e) => {
            name.innerText = Http.responseText
        }
        let tel = document.createElement("td")
        tel.innerText = row_data.Telephone
        let email = document.createElement("td")
        email.innerText = row.id
        let allergy = document.createElement("td")
        allergy.innerText = row_data.Allergy
        //console.log(user_data.IsAdmin)
        tr.appendChild(studentid)
        tr.appendChild(name)
        tr.appendChild(email)
        tr.appendChild(tel)
        tr.appendChild(allergy)
        table.appendChild(tr)
    })
}
