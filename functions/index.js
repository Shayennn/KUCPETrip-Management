// var request = require('request');

const functions = require('firebase-functions');

const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

function updateIsPaid(snap, context) {
  db.collection('configs').doc('/payment').get().then(configLoader=>{
    paymentConfig = configLoader.data()
    const newValue = snap.data();
    console.log(newValue.user.path);
    db.collection('payments').where("user", "==", db.doc(newValue.user.path)).get().then(res => {
      let total = 0;
      res.docs.forEach(i => {
        total += i.data().amount
      })
      if (total >= paymentConfig.minpay) {
        db.doc(newValue.user.path).update({
          IsPaid: true,
          IsJoin: true
        })
      } else {
        db.doc(newValue.user.path).update({
          IsPaid: false
        })
      }
    })
  })
  return 'Processed '+newValue.user.path;
}

exports.paymentMonCreate = functions.firestore
  .document('payments/{wildcard}')
  .onCreate(updateIsPaid)
;

exports.paymentMonDelete = functions.firestore
  .document('payments/{wildcard}')
  .onDelete(updateIsPaid)
;

exports.PaymentAPI = functions.https.onRequest((req, res) => {
    db.collection('configs').doc('/payment').get().then(configLoader=>{
      paymentConfig = configLoader.data()
      if (req.body.secret == paymentConfig.secret){
        db.collection('payments').doc(req.body.TXID).set({
          amount: parseFloat(req.body.Amount),
          time: admin.firestore.Timestamp.fromMillis(req.body.Time*1000),
          user: db.collection('people').doc(req.body.Email)
        }).then(()=>{
          res.send({
            success: true
          })
        }).catch(reason=>{
          res.send({
            msg: 'DB Error ' + reason,
            error: true
          })
        })
      }else{
        res.send({
          msg: 'Invalid secret',
          error: true
        })
      }
    }).catch(error=>{
      res.send({
        msg: error.toString(),
        error: true
      })
    })
})


// exports.importdata = functions.https.onRequest((req, res) => {
//     const data = req.rawBody.toString()
//     console.log(data)
//     data.split("\n").forEach(line=>{
//         const field = line.split(',')
//         db.collection('people').doc(field[0].trim()).set({
//             Allergy: field[4].trim() ,//data.Allergy,
//             EmergencyContact: "",
//             StudentID: parseInt(field[1].trim()) ,//data.StudentID,
//             Telephone: field[3].trim() ,//data.Telephone,
//             IsJoin: field[2].trim() == "1" ,//data.IsJoin,
//             IsPaid: false,
//             IsAdmin: false
//         }).catch(function(error) {
//             console.error(field[0].trim()+" Error adding document: "+ error);
//         });
//     })
//     res.send(true)
// });