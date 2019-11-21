var people = db.collection("people");
var payments = db.collection("payments");
let user_data;
const limited_date = new Date('2019-11-03 23:59:59+0700');

document.getElementById('logout_btn').addEventListener("click", () => {
    firebase.auth().signOut().then(function () {
        window.location = 'login.html';
    }).catch(function (error) {
        alert(error);
    });
})

document.getElementById('joinBtn').addEventListener("click", toggleJoin)
document.getElementById('cancelBtn').addEventListener("click", toggleJoin)

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
        if (res.exists) user_data = res.data();
        else {
            firebase.auth().signOut().then(function () {
                window.location = 'login.html';
            }).catch(function (error) {
                alert(error);
            });
        }
    }).then(showField).catch(function (error) {
        alert(error);
    });
    await payments.where('user', '==', db.doc('/people/' + firebase.auth().currentUser.email)).get().then(showPayments).catch(function (error) {
        alert(error);
    });
    await people.where('IsJoin', "==", true).get().then(res => {
        document.getElementById('db_Count').innerText = res.docs.length+' คน'
        showPeople(res)
    })
    await people.where('IsPaid', "==", true).get().then(res => {
        document.getElementById('db_ConfirmCount').innerText = res.docs.length+' คน'
    })
}

async function showField() {
    document.getElementById('db_StudentID').innerText = user_data.StudentID
    document.getElementById('db_IsJoin').innerHTML = user_data.IsJoin ? '<span class="badge badge-success">Ja!</span>' : '<span class="badge badge-danger">Nein</span>'
    document.getElementById('db_IsPaid').innerHTML = user_data.IsPaid ? '<span class="badge badge-success">Yes</span>' : '<span class="badge badge-danger">No</span>'
    document.getElementById('db_Telephone').innerText = user_data.Telephone
    document.getElementById('db_Allergy').innerText = user_data.Allergy
    if((!user_data.IsPaid) && limited_date > new Date()){
        if(user_data.IsJoin){
            document.getElementById('joinBtn').style.display='none';
            document.getElementById('cancelBtn').style.display='';
        }else{
            document.getElementById('joinBtn').style.display='';
            document.getElementById('cancelBtn').style.display='none';
        }
    } else {
        document.getElementById('joinBtn').style.display='none';
        document.getElementById('cancelBtn').style.display='none';
    }
}

async function showPage() {
    document.getElementById('main_content').style.display = '';
    document.getElementById('loading').style.display = 'none';
}

async function loadingPage() {
    document.getElementById('main_content').style.display = 'none';
    document.getElementById('loading').style.display = '';
}

async function showPayments(res) {
    if (res.docs.length != 0) {
        document.getElementById("noPayment").style.display = 'none';
        document.getElementById("paymentTable").style.display = '';
        document.getElementById('cancelBtn').style.display='none';
        document.getElementById('joinBtn').style.display='none';
    }
    let table = document.getElementById('table_data');
    table.innerHTML=''
    res.docs.forEach(row => {
        let row_data = row.data()
        console.log(row_data)
        let tr = document.createElement("tr")
        let txid = document.createElement("td")
        txid.scope = "row"
        txid.innerText = row.id
        let time = document.createElement("td")
        time.innerText = new Date(row_data.time.toMillis()).toLocaleString('th-TH', {
            timeZone: "Asia/Bangkok"
        })
        let amount = document.createElement("td")
        amount.innerText = Number(row_data.amount).toLocaleString()+' บาท'
        tr.appendChild(txid)
        tr.appendChild(amount)
        tr.appendChild(time)
        table.appendChild(tr)
    })
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
    if (user_data.IsAdmin) {
        let morehead = document.createElement("th")
        morehead.innerText = 'Action'
        document.getElementById('people_head').append(morehead)
    }
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
        //console.log(user_data.IsAdmin)
        tr.appendChild(studentid)
        tr.appendChild(name)
        tr.appendChild(IsPaid)
        if (user_data.IsAdmin && !row_data.IsPaid) {
            //console.log('enable pay btn')
            let action = document.createElement("td")
            let btnPaid = document.createElement("button")
            btnPaid.classList = 'btn btn-primary'
            btnPaid.onclick = togglePaid
            btnPaid.innerText = 'ชำระเงิน'
            btnPaid.setAttribute('email', row.id)
            action.append(btnPaid)
            tr.append(action)
        }
        table.appendChild(tr)
    })
}

function toggleJoin(){
    loadingPage()
    people.doc(firebase.auth().currentUser.email).update({
        IsJoin: !user_data.IsJoin
    }).then(loadDB).then(showPage)
    .catch(function(error) {
        alert("DB Error: ", error);
        console.error("DB Error: ", error);
    });
}

function togglePaid(e){
    loadingPage()
    const t = new Date();
    console.log(e)
    payments.doc('CASH@'+t.toLocaleString('th-TH', {
        timeZone: "Asia/Bangkok"
    }).replace(/\/|:/g,'-').replace(/\s/,'_')).set({
        amount: parseFloat(600),
        time: firebase.firestore.Timestamp.fromMillis(t.getTime()),
        user: db.collection('people').doc(e.target.getAttribute('email')),
        admin: people.doc(firebase.auth().currentUser.email)
    }).then(loadDB).then(showPage)
    .catch(function(error) {
        alert("DB Error: ", error);
        console.error("DB Error: ", error);
    });
}
