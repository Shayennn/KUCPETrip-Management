var people = db.collection("people");
let user_data;

document.getElementById('logout_btn').addEventListener("click", () => {
    firebase.auth().signOut().then(function () {
        window.location = 'login.html';
    }).catch(function (error) {
        alert(error);
    });
})

document.getElementById('saveBtn').addEventListener("click", updateData)

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
}

async function showField() {
    document.getElementById('txtTelephone').value = user_data.Telephone
    document.getElementById('txtAllergy').value = user_data.Allergy
    document.getElementById('txtEmergencyContact').value = user_data.EmergencyContact
}

async function showPage() {
    document.getElementById('main_content').style.display = '';
    document.getElementById('loading').style.display = 'none';
}

async function loadingPage() {
    document.getElementById('main_content').style.display = 'none';
    document.getElementById('loading').style.display = '';
}

function updateData(e){
    loadingPage()
    people.doc(firebase.auth().currentUser.email).update({
        Telephone: document.getElementById('txtTelephone').value,
        Allergy: document.getElementById('txtAllergy').value,
        EmergencyContact: document.getElementById('txtEmergencyContact').value
    }).then(()=>{
        window.location='/'
    })
    .catch(function(error) {
        alert("DB Error: ", error);
        console.error("DB Error: ", error);
    });
    return false;
}
