'use strict';

// Initializes Glean.
function Glean() {
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
  this.deliveryLogRef = this.database.ref('deliveryLog');
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
    //TODO: evanfredhernandez load homepage
    this.saveDeviceToken();
  } else {
    //TODO: evanfredhernandez load signin
  }
};

Glean.prototype.checkSignedInWithMessage = function () {
  //TODO: dliangsta Fix when login is setup
  if (this.auth.currentUser || true) {
    return true;
  }

  var data = {
    message: 'Please sign-in!',
    timeout: 2000
  };
  this.signInSnackbar.MaterialSnackbar.showSnackbar(data);
  return false;
};

Glean.prototype.saveDeviceToken = function () {
  firebase.messaging().getToken().then(function (currentToken) {
    if (currentToken) {
      firebase.database().ref('/fcmTokens').child(currentToken)
        .set(firebase.auth().currentUser.uid);
    } else {
      this.requestNotificationsPermissions();
    }
  }.bind(this)).catch(function (error) {
    console.error('Unable to get messaging token.', error);
  });
};

Glean.prototype.requestNotificationsPermissions = function () {
  console.log('Requesting notifications permission...');
  firebase.messaging().requestPermission().then(function () {
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

Glean.prototype.registerUser = function (userID, firstName, lastName, role, email, phone, driversLicense, carLicense) {
  if (this.checkSignedInWithMessage()) {
    this.IDExists(userID, function (exists) {
      if (exists) {
        console.log('UserID already exists!');
        return;
      } else {
        this.usersRef.push({
          ID: userID,
          creation: Date.now(),
          updated: Date.now(),
          firstName: firstName,
          lastName: lastName,
          role: role,
          email: email,
          phone: phone,
          restaurants: [0],
          shelters: [0],
          driversLicense: driversLicense,
          carLicense: carLicense
        }).then(function () {
          // redirect to home?
        }.bind(this)).catch(function (error) {
          console.error('Error writing new user to Firebase Database', error);
        });
      }
    }.bind(this))
  }
};

Glean.prototype.registerLocation = function (locationName, type, chain, contact, street, street2, city, state, phone, notes) {
  if (this.checkSignedInWithMessage()) {
    var newID = (locationName + "-" + state + "-" + city + "-" + street.split()[0]).replace(/ /g, '');
    this.IDExists(newID, function (exists) {
      if (exists) {
        console.log('Location already exists!');
        return;
      }
      this.locationsRef.push({
        ID: newID,
        creation: Date.now(),
        updated: Date.now(),
        type: type,
        name: locationName,
        chain: chain,
        contact: contact,
        street: street,
        street2: street2,
        city: city,
        state: state,
        phone: phone,
        notes: notes
      }).then(function () {
        // redirect to home?
      }.bind(this)).catch(function (error) {
        console.error('Error writing new location to Firebase Database', error);
      });
    }.bind(this));
  }
};

Glean.prototype.saveOffer = function (restaurantID, description, quantity, notes) {
  if (this.checkSignedInWithMessage()) {
    var now = Date.now();
    var newID = restaurantID + '-' + now;
    this.IDExists(newID, function (exists) {
      if (exists) {
        console.log("Offer id already exists!");
        return;
      }
      this.offersRef.push({
        ID: newID,
        creation: now,
        updated: now,
        restaurantID: restaurantID,
        description: description,
        quantity: quantity,
        notes: notes
      }).then(function () {
        // redirect to home?
      }.bind(this)).catch(function (error) {
        console.error('Error writing new offer to Firebase Database', error);
      });
    }.bind(this));
  }
};

Glean.prototype.saveDelivery = function (offerID, driverID) {
  if (this.checkSignedInWithMessage()) {
    // check if offer exists
    this.IDExists(offerID, function (exists) {
      if (exists) {
        // check if driver exists
        this.IDExists(driverID, function (exists) {
          if (exists) {
            // check if delivery exists
            var newID = offerID + '-' + driverID;
            this.IDExists(newID, function (exists) {
              if (exists) {
                console.log("Delivery already exiests!");
                return;
              }
              this.getByID(driverID, function (driver) {
                if (!driver) {
                  console.log("Error: driver could not be found!");
                  return;
                }
                // check if driver is actually a driver
                if (driver.role !== 'Driver') {
                  console.log("User is not a driver! User is a " + driver.role);
                  return;
                }
                this.deliveriesRef.push({
                  ID: newID,
                  creation: Date.now(),
                  updated: Date.now(),
                  offerID: offerID,
                  driverID: driverID
                }).then(function () {
                  //TODO: redirect to home?
                }.bind(this)).catch(function (error) {
                  console.error('Error writing new delivery to Firebase Database', error);
                });
              }.bind(this));
            }.bind(this));
          } else {
            console.log("Driver does not exist!");
            return;
          }
        }.bind(this));
      } else {
        console.log("Offer does not exist!");
        return;
      }
    }.bind(this));
  }
};

Glean.prototype.addLocationToUser = function (userKey, locationKey) {
  this.getByKey(userKey, function (user) {
    if (user === null) {
      console.log("Unable to find user!");
      return;
    }
    this.getByKey(locationKey, function (location) {
      if (location === null) {
        console.log("Location does not exist!");
        return;
      }
      var updates = {};
      if (location.type === 'Restaurant') {
        console.log(user);
        if (user.restaurants.includes(locationKey)) {
          console.log('Restaurants already includes that location!');
          return;
        }
        user.restaurants.push(locationKey);
        updates['/users/' + userKey + '/restaurants'] = user.restaurants;
      } else {
        if (user.shelters.includes(loationKey)) {
          console.log('Shelters already includes that location!');
          return;
        }
        user.shelters.push(locationKey);
        updates['/users/' + userKey + '/shelters'] = user.shelters;
      }
      firebase.database().ref().update(updates);
    });
  }.bind(this));
};

Glean.prototype.updateUser = function (userKey, firstName, lastName, role, email, phone, driversLicense, carLicense) {
  this.getByKey(userKey, function (user) {
    if (user === null) {
      console.log("User could not be found!");
      return;
    }
    var updates = {};
    updates['/users/' + userKey + '/'] = {
      ID: user.ID,
      creation: user.creation,
      updated: Date.now(),
      firstName: firstName || user.firstName,
      lastName: lastName || user.lastName,
      role: role || user.role,
      email: email || user.email,
      phone: phone || user.phone,
      restaurants: user.restaurants,
      shelters: user.shelters,
      driversLicense: driversLicense || user.driversLicense || "",
      carLicense: carLicense || user.carLicense || ""
    };
    firebase.database().ref().update(updates);
  }.bind(this));
}

Glean.prototype.updateLocation = function (locationKey, locationName, type, chain, contact, street, street2, city, state, phone, notes) {
  if (this.checkSignedInWithMessage()) {
    this.getByKey(locationKey, function (location) {
      if (location === null) {
        console.log("Location doesn't exist!");
        return;
      }
      this.locationsRef.push({
        ID: location.ID,
        creation: location.creation,
        updated: Date.now(),
        type: type || location.type,
        name: locationName || location.name,
        chain: chain || location.chain,
        contact: contact || location.contact,
        street: street || location.street,
        street2: street2 || location.street2 || "",
        city: city || location.city,
        state: state || location.state,
        phone: phone || location.phone,
        notes: notes || location.notes || notes
      }).then(function () {
        // redirect to home?
      }.bind(this)).catch(function (error) {
        console.error('Error writing new location to Firebase Database', error);
      });
    }.bind(this));
  }
}

Glean.prototype.updateOffer = function (offerKey, description, quantity, notes) {
  this.getByKey(offerKey, function (offer) {
    if (offer === null) {
      console.log("Offer could not be found!");
      return;
    }
    var updates = {};
    updates['/offers/' + offerKey + '/'] = {
      ID: offer.ID,
      creation: offer.creation,
      updated: Date.now(),
      restaurantID: restaurantID,
      description: description || offer.description || "",
      quantity: quantity || offer.quantity,
      notes: notes || offer.notes || ""
    };
    firebase.database().ref().update(updates);
  }.bind(this));
}

Glean.prototype.markAsDelivered = function (deliveryID) {
  this.getByID(deliveryID, function (delivery) {
    if (delivery === null) {
      console.log("Delivery could not be found!");
      return;
    }
    this.deliveryLogRef.push(delivery);
    this.getKeyFromID(deliveryID, function (key) {
      this.deleteByKey(key);
      this.deleteByID(delivery.offerID);
    }.bind(this));
  }.bind(this));
}

Glean.prototype.deleteByKey = function (key) {
  var database = '/';
  firebase.database().ref(database).once('value').then(function (snapshot) {
    var snap = snapshot.val();
    for (var db in snap) {
      if (snap.hasOwnProperty(db)) {
        if (snap[db].hasOwnProperty(key)) {
          var updates = {};
          updates[db + '/' + key + '/'] = null;
          firebase.database().ref().update(updates);
          return;
        }
      }
    }
  });
}

Glean.prototype.deleteByID = function (ID) {
  var database = '/';
  firebase.database().ref(database).once('value').then(function (snapshot) {
    var snap = snapshot.val();
    for (var db in snap) {
      if (snap.hasOwnProperty(db)) {
        for (var key in snap[db]) {
          if (snap[db].hasOwnProperty(key)) {
            if (snap[db][key].ID === ID) {
              var updates = {};
              updates[db + '/' + key + '/'] = null;
              firebase.database().ref().update(updates);
              return;
            }
          }
        }
      }
    }
  });
}

Glean.prototype.deleteLocationFromUser = function (userKey, locationKey) {
  this.getByKey(userKey, function (user) {
    if (user === null) {
      console.log("Unable to find user!");
      return;
    }
    this.getByKey(locationKey, function (location) {
      if (location === null) {
        console.log("Location does not exist!");
        return;
      }
      var updates = {};
      if (location.type === 'Restaurant') {
        var index = user.restaurants.indexOf(locationKey);
        if (index >= 0) {
          user.restaurants.splice(index, 1);
        } else {
          console.log('User does not have that restaurant listed!');
          return;
        }
        updates['/users/' + userKey + '/restaurants'] = user.restaurants;
      } else {
        var index = user.shelters.indexOf(locationKey);
        if (index >= 0) {
          user.shelters.splice(index, 1);
        } else {
          console.log('User does not have that shelter listed!');
          return;
        }
        updates['/users/' + userKey + '/shelters'] = user.shelters;
      }
      firebase.database().ref().update(updates);
    });
  }.bind(this));
};

/**
 * Asynchronous function, hence callback
 * ex: glean.getByID('dliangsta',console.log)
 * {
 *   email: "davidliangx27@gmail.com",
 *   firstName: "David",
 *   lastName: "Liang",
 *   phone: "2626139652",
 *   role: "Restaurant",
 *   username: "dliangsta"
 * }
 */
Glean.prototype.getByID = function (ID, callback) {
  var database = '/';
  firebase.database().ref(database).once('value').then(function (snapshot) {
    var snap = snapshot.val();
    for (var db in snap) {
      if (snap.hasOwnProperty(db)) {
        for (var key in snap[db]) {
          if (snap[db].hasOwnProperty(key)) {
            if (snap[db][key].ID === ID) {
              callback(snap[db][key]);
              return;
            }
          }
        }
      }
    }
    callback(null);
  });
};

/**
 * Asynchronous function, hence callback
 * ex: glean.getByKey('-Kdogqq1xfB1W2DNmX_s',console.log)
 * {
 *   email: "davidliangx27@gmail.com",
 *   firstName: "David",
 *   lastName: "Liang",
 *   phone: "2626139652",
 *   role: "Restaurant",
 *   username: "dliangsta"
 * }
 */
Glean.prototype.getByKey = function (key, callback) {
  var database = '/';
  firebase.database().ref(database).once('value').then(function (snapshot) {
    var snap = snapshot.val();
    for (var db in snap) {
      if (snap.hasOwnProperty(db)) {
        if (snap[db].hasOwnProperty(key)) {
          callback(snap[db][key]);
          return;
        }
      }
    }
    callback(null);
  });
};

Glean.prototype.getKeyFromID = function (ID, callback) {
  var database = '/';
  firebase.database().ref(database).once('value').then(function (snapshot) {
    var snap = snapshot.val();
    for (var db in snap) {
      if (snap.hasOwnProperty(db)) {
        for (var key in snap[db]) {
          if (snap[db].hasOwnProperty(key)) {
            if (snap[db][key].ID === ID) {
              callback(key);
              return;
            }
          }
        }
      }
    }
    callback(null);
  });
}

/** 
 * Asynchronous function, hence callback
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
  database = database || '/';
  this.all = [];
  firebase.database().ref(database).once('value').then(function (snapshot) {
    var snap = snapshot.val();
    for (var db in snap) {
      if (snap.hasOwnProperty(db)) {
        for (var key in snap[db]) {
          this.all.push({ key: key, obj: snap[db][key] });
        }
      }
    }
    callback(this.all);
  }.bind(this));
};

Glean.prototype.generateID = function (ID, callback) {
  this.getAll(null, function (all) {
    var count = 1;
    ID += '' + count;
    for (var key in all) {
      if (all.hasOwnProperty(key)) {
        if (all[key].obj.ID === ID) {
          ID = ID.slice(0, ID.length - 1) + '' + (++count);
        } else {
          callback(ID);
          return;
        }
      }
    }
  });
};

Glean.prototype.IDExists = function (ID, callback) {
  this.getAll(null, function (all) {
    for (var key in all) {
      if (all.hasOwnProperty(key)) {
        if (all[key].obj.ID === ID) {
          callback(true);
          return;
        }
      }
    }
    callback(false);
  });
}

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