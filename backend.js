'use strict';

// Initializes Glean.
function Glean() {
  this.checkSetup();
  this.initFirebase();
}

// Sets up shortcuts to Firebase features and initiate firebase auth.
Glean.prototype.initFirebase = function () {
  // Shortcuts to Firebase SDK features.
  this.auth = firebase.auth();
  this.database = firebase.database();
  this.storage = firebase.storage();
  this.locationsRef = this.database.ref('locations');
  this.usersRef = this.database.ref('users');
  this.offersRef = this.database.ref('offers');
  this.deliveriesRef = this.database.ref('deliveries');
  // Initiates Firebase auth and listen to auth state changes.
  this.auth.onAuthStateChanged(this.onAuthStateChanged.bind(this));
};

// Signs-in a Glean user.
Glean.prototype.signIn = function () {
  // Sign in Firebase using popup auth and Google as the identity provider.
  var provider = new firebase.auth.GoogleAuthProvider();
  this.auth.signInWithPopup(provider);
};

// Signs-out a Glean user.
Glean.prototype.signOut = function () {
  // Sign out of Firebase.
  this.auth.signOut();
};

// Triggers when the auth state change for instance when the user signs-in or signs-out.
Glean.prototype.onAuthStateChanged = function (user) {
  if (user) {
    var profilePicUrl = user.photoURL;
    var userName = user.displayName;
    // load homepage
    this.saveDeviceToken();
  } else {
    // load signin
  }
};

// Returns true if user is signed-in. Otherwise false and displays a message.
Glean.prototype.checkSignedInWithMessage = function () {
  // Return true if the user is signed in Firebase
  //TODO: dliangsta Fix when login is setup
  if (this.auth.currentUser || true) {
    return true;
  }

  // Display a message to the user using a Toast.
  var data = {
    message: 'Please sign-in!',
    timeout: 2000
  };
  this.signInSnackbar.MaterialSnackbar.showSnackbar(data);
  return false;
};

// Saves the messaging device token to the datastore.
Glean.prototype.saveDeviceToken = function () {
  firebase.messaging().getToken().then(function (currentToken) {
    if (currentToken) {
      console.log('Got FCM device token:', currentToken);
      // Saving the Device Token to the datastore.
      firebase.database().ref('/fcmTokens').child(currentToken)
        .set(firebase.auth().currentUser.uid);
    } else {
      // Need to request permissions to show notifications.
      this.requestNotificationsPermissions();
    }
  }.bind(this)).catch(function (error) {
    console.error('Unable to get messaging token.', error);
  });
};

// Requests permissions to show notifications.
Glean.prototype.requestNotificationsPermissions = function () {
  console.log('Requesting notifications permission...');
  firebase.messaging().requestPermission().then(function () {
    // Notification permission granted.
    this.saveDeviceToken();
  }.bind(this)).catch(function (error) {
    console.error('Unable to get permission to notify.', error);
  });
};

//TODO: evanfredhernandez
// Glean.MESSAGE_TEMPLATE =
//    '<div class="message-container">' +
//    '<div class="spacing"><div class="pic"></div></div>' +
//    '<div class="message"></div>' +
//    '<div class="name"></div>' +
//    '</div>';

Glean.USER_TEMPLATE = '';

Glean.LOCATION_TEMPLATE = '';

Glean.OFFER_TEMPLATE = '';

Glean.DELIVERY_TEMPLATE = '';
// A loading image URL.
Glean.LOADING_IMAGE_URL = 'https://www.google.com/images/spin-32.gif';

Glean.prototype.registerUser = function (username, firstName, lastName, role, email, phone, driversLicense, carLicense) {
  if (this.checkSignedInWithMessage()) {
    var currentUser = this.auth.currentUser;
    this.usersRef.push({
      username: username,
      firstName: firstName,
      lastName: lastName,
      role: role,
      email: email,
      phone: phone,
      shelters: {},
      restaurants: {},
      driversLicense: driversLicense,
      carLicense: carLicense
    }).then(function () {
      // redirect to home?
    }.bind(this)).catch(function (error) {
      console.error('Error writing new user to Firebase Database', error);
    });
  }
};

Glean.prototype.registerLocation = function (name, chain, contact, address, phone, notes) {
  if (this.checkSignedInWithMessage()) {
    var currentUser = this.auth.currentUser;
    this.locationsRef.push({
      name: name,
      chain: chain,
      conact: contact,
      address: address,
      phone: phone,
      notes: notes,
      date: Date.now()
    }).then(function () {
      // redirect to home?
    }.bind(this)).catch(function (error) {
      console.error('Error writing new location to Firebase Database', error);
    });
  }
};

Glean.prototype.saveOffer = function (restaurantID, description, quantity, notes) {
  if (this.checkSignedInWithMessage()) {
    var currentUser = this.auth.currentUser;
    this.offersRef.push({
      restaurantID: restaurantID,
      description: description,
      quantity: quantity,
      notes: notes,
      date: Date.now()
    }).then(function () {
      // redirect to home?
    }.bind(this)).catch(function (error) {
      console.error('Error writing new offer to Firebase Database', error);
    });
  }
};

Glean.prototype.saveDelivery = function (offer, driver) {
  if (this.checkSignedInWithMessage()) {
    var currentUser = this.auth.currentUser;
    this.deliveriesRef.push({
      offerID: offer,
      driverID: driver
    }).then(function () {
      //TODO: redirect to home?
    }.bind(this)).catch(function (error) {
      console.error('Error writing new delivery to Firebase Database', error);
    });
  }
};

/**
 * ex: glean.get('users','-Kdogqq1xfB1W2DNmX_s',console.log)
 * {
 *   email: "davidliangx27@gmail.com",
 *   firstName: "David",
 *   lastName: "Liang",
 *   phone: "2626139652",
 *   role: "Restaurant",
 *   username: "dliangsta"
 * }
 */
Glean.prototype.get = function (database, key, callback) {
  this.usersRef.off();
  firebase.database().ref(database).once('value').then(function (snapshot) {
    if (snapshot.val().hasOwnProperty(key)) {
      callback(snapshot.val()[key]);
    } else {
      callback(null);
    }
  });
};

/** 
 * ex: glean.getAll('users',console.log) can print
 * [
 *   0: {
 *     key: "-Kdogqq1xfB1W2DNmX_s"
 *     user: {
 *       email: "davidliangx27@gmail.com",
 *       firstName: "David",
 *       lastName: "Liang",
 *       phone: "2626139652",
 *       role: "Restaurant",
 *       username: "dliangsta"
 *     }
 *   }
 * ]  
 */
Glean.prototype.getAll = function (database, callback) {
  this.usersRef.off();
  this.allUsers = [];
  firebase.database().ref(database).once('value').then(function (snapshot) {
    var snap = snapshot.val();
    for (var user in snap) {
      this.allUsers.push({ key: user, user: snap[user] });
    }
    callback(this.allUsers);
  }.bind(this));
};

// could also just have a general Glean.prototype.display = function(key)
Glean.prototype.display = function (key) {
  //TODO: evanfredhernandez
}

Glean.prototype.displayUser = function (key, first, last, email, phone, shelters, restaurants, driversLicense, carLicense) {
  //TODO: evanfredhernandez
};

Glean.prototype.displayLocation = function (key, name, chain, manager, address, phone, serving, notes) {
  //TODO: evanfredhernandez
};

Glean.prototype.displayOffer = function (key, restaurantID, quantity, description, notes) {
  //TODO: evanfredhernandez
};

Glean.prototype.displayDelivery = function (key, offerID, driverID) {
  //TODO: evanfredhernandez
};

Glean.prototype.checkSetup = function () {
  if (!window.firebase || !(firebase.app instanceof Function) || !window.config) {
    window.alert('You have not configured and imported the Firebase SDK. ' +
      'Make sure you go through the codelab setup instructions.');
  } else if (config.storageBucket === '') {
    window.alert('Your Firebase Storage bucket has not been enabled. Sorry about that. This is ' +
      'actually a Firebase bug that occurs rarely. ' +
      'Please go and re-generate the Firebase initialisation snippet (step 4 of the codelab) ' +
      'and make sure the storageBucket attribute is not empty. ' +
      'You may also need to visit the Storage tab and paste the name of your bucket which is ' +
      'displayed there.');
  }
};