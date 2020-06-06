import { database } from '../firebase'

export var setHostDb = (roomCode, uid) => {
  console.log(roomCode+" "+uid)
  database.ref(roomCode)
    .child('host')
    .set(uid);
}
