'use strict';

/**
 * Constructor.
 */
function Glean() {
  var config = {
    apiKey: "AIzaSyBZ7AwQ5AaLNB3uEowG7zg4q74wTdT-KGk",
    authDomain: "glean-263a4.firebaseapp.com",
    databaseURL: "https://glean-263a4.firebaseio.com",
    storageBucket: "glean-263a4.appspot.com",
    messagingSenderId: "986275776213"
  };
  firebase.initializeApp(config);
  this.initFirebase();
}

/**
 * Initializes Firebase and sets up shortcuts.
 */
Glean.prototype.initFirebase = function () {
  this.auth = firebase.auth();
  this.database = firebase.database();
  this.storage = firebase.storage();
  this.locationsRef = this.database.ref('locations');
  this.usersRef = this.database.ref('users');
  this.offersRef = this.database.ref('offers');
  this.requestsRef = this.database.ref('requests');
  this.deliveriesRef = this.database.ref('deliveries');
  this.deliveryLogRef = this.database.ref('deliveryLog');
  this.auth.onAuthStateChanged(this.onAuthStateChanged.bind(this));
};

/**
 * Signs a user into Glean using using Google Identity Provider or a provided email and password
 */
Glean.prototype.signIn = function (email, password) {
  if (!email && !password) {
    this.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
  } else {
    firebase.auth().createUserWithEmailAndPassword(email, password);
  }
};

/**
 * Signs a user out of Glean.
 */
Glean.prototype.signOut = function () {
  this.auth.signOut();
};

/**
 * When the authentication state is changed...
 */
Glean.prototype.onAuthStateChanged = function (user) {
  if (user) {
    this.setCurrentUserID(user.email);
    //TODO: evanfredhernandez load homepage
    this.saveDeviceToken();
  } else {
    //TODO: evanfredhernandez load signin
  }
};

/**
 * Checks to see if a user is currently signed in to Glean.
 */
Glean.prototype.signedIn = function () {
  //TODO: dliangsta Fix when login is setup
  if (this.auth.currentUser) {
    return true;
  } else {
    console.log('Please sign in first!');
    alert('Please sign in first!');
    return false;
  }
};

Glean.prototype.setCurrentUserID = function (email) {
  this.getAll('users', function (users) {
    for (var key in users) {
      if (users.hasOwnProperty(key)) {
        if (users[key].obj.email === email) {
          this.auth.currentUser.ID = users[key].obj.ID;
        }
      }
    }
  }.bind(this));
};

/**
 * Saves a device's token for notification purposes.
 */
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

/**
 * Requests permission to push notifications.
 */
Glean.prototype.requestNotificationsPermissions = function () {
  console.log('Requesting notifications permission...');
  firebase.messaging().requestPermission().then(function () {
    this.saveDeviceToken();
  }.bind(this)).catch(function (error) {
    console.error('Unable to get permission to notify.', error);
  });
};

/**
 * Registers a user.
 */
Glean.prototype.registerUser = function (userID, firstName, lastName, role, email, phone, driversLicense, carLicense) {
  if (this.signedIn()) {
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

/**
 * Registers al ocation as a shelter or restaurant.
 */
Glean.prototype.registerLocation = function (locationName, type, chain, contact, street, street2, city, state, phone, notes) {
  if (this.signedIn()) {
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

/**
 * Create an offer by a restaurant.
 */
Glean.prototype.createOffer = function (restaurantID, description, quantity, notes) {
  if (this.signedIn()) {
    this.verifyLocationPermission(this.auth.currentUser.ID, restaurantID, true, function (verified) {
      if (!verified) {
        console.log('User does not have access to this location!');
        return;
      }
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
    }.bind(this));
  }
};

/**
 * Create a request by a shelter.
 */
Glean.prototype.createRequest = function (shelterID, description, quantity, notes) {
  if (this.signedIn()) {
    this.verifyLocationPermission(this.auth.currentUser.ID, shelterID, false, function (verified) {
      if (!verified) {
        console.log('User does not have access to this location!');
        return;
      }
      var now = Date.now();
      var newID = shelterID + '-' + now;
      this.IDExists(newID, function (exists) {
        if (exists) {
          console.log("request id already exists!");
          return;
        }
        this.requestsRef.push({
          ID: newID,
          creation: now,
          updated: now,
          shelterID: shelterID,
          description: description,
          quantity: quantity,
          notes: notes
        }).then(function () {
          // redirect to home?
        }.bind(this)).catch(function (error) {
          console.error('Error writing new request to Firebase Database', error);
        });
      }.bind(this));
    }.bind(this));
  }
};

/**
 * Creates a delivery by matching a driver to an offer.
 */
Glean.prototype.createDelivery = function (offerID, driverID) {
  if (this.signedIn()) {
    var newID = offerID + '-' + driverID;
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
  }
};

/**
 * Adds a location to a given user.
 */
Glean.prototype.addLocationToUser = function (userKey, locationKey) {
  if (this.signedIn()) {
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
        if (location.type === 'restaurant') {
          console.log(user);
          if (user.restaurants.includes(locationKey)) {
            console.log('Restaurants already includes that location!');
            return;
          }
          user.restaurants.push(locationKey);
          updates['/users/' + userKey + '/restaurants'] = user.restaurants;
        } else {
          if (user.shelters.includes(locationKey)) {
            console.log('Shelters already includes that location!');
            return;
          }
          user.shelters.push(locationKey);
          updates['/users/' + userKey + '/shelters'] = user.shelters;
        }
        firebase.database().ref().update(updates);
      });
    }.bind(this));
  }
};

/**
 * Updates a user's info.
 */
Glean.prototype.updateUser = function (userKey, firstName, lastName, role, email, phone, driversLicense, carLicense) {
  if (this.signedIn()) {
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
}

/**
 * Updates a location's info.
 */
Glean.prototype.updateLocation = function (locationKey, locationName, type, chain, contact, street, street2, city, state, phone, notes) {
  if (this.signedIn()) {
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

/**
 * Updates an offer's info.
 */
Glean.prototype.updateOffer = function (offerKey, description, quantity, notes) {
  if (this.signedIn()) {
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
}

/**
 * Updates an request's info.
 */
Glean.prototype.updateRequest = function (requestKey, description, quantity, notes) {
  if (this.signedIn()) {
    this.getByKey(requestKey, function (request) {
      if (request === null) {
        console.log("Request could not be found!");
        return;
      }
      var updates = {};
      updates['/requests/' + requestKey + '/'] = {
        ID: request.ID,
        creation: request.creation,
        updated: Date.now(),
        restaurantID: request.shelterID,
        description: description || request.description || "",
        quantity: quantity || request.quantity,
        notes: notes || request.notes || ""
      };
      firebase.database().ref().update(updates);
    }.bind(this));
  }
}

/**
 * Updates a delivery.
 */
Glean.prototype.updateDelivery = function (deliveryKey, offerID, driverID) {
  if (this.signedIn()) {
    this.getByKey(deliveryKey, function (delivery) {
      if (delivery === null) {
        console.log("Delivery does not exist!");
        return;
      }
      var updates = {};
      updates['/deliveries/' + deliveryKey + '/'] = {
        ID: delivery.ID,
        creation: delivery.creation,
        updated: Date.now(),
        offerID: offerID || delivery.offerID,
        driverID: driverID || delivery.driverID
      }
      firebase.database().ref().update(updates);
    }.bind(this));
  }
}

/**
 * Marks a delivery as delivered and puts it in the delivery log.
 */
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

/**
 * Deletes an item from Firebase by its key.
 */
Glean.prototype.deleteByKey = function (key) {
  if (this.signedIn()) {
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
}

/**
 * Deletes an item from Firebase by its ID.
 */
Glean.prototype.deleteByID = function (ID) {
  if (this.signedIn()) {
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
}

/**
 * Deletes a location from a user's list of locations.
 */
Glean.prototype.deleteLocationFromUser = function (userKey, locationKey) {
  if (this.signedIn()) {
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
        if (location.type === 'restaurant') {
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
  }
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
  if (this.signedIn()) {
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
  }
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
  if (this.signedIn()) {
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
  }
};

Glean.prototype.getKeyFromID = function (ID, callback) {
  if (this.signedIn()) {
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
  if (this.signedIn()) {
    database = database || '/';
    this.all = [];
    firebase.database().ref(database).once('value').then(function (snapshot) {
      var snap = snapshot.val();
      if (database !== '/') {
        for (var key in snap) {
          if (snap.hasOwnProperty(key)) {
            this.all.push({ key: key, obj: snap[key] });
          }
        }
      } else {
        for (var db in snap) {
          if (snap.hasOwnProperty(db)) {
            if (this.temp) {
              if (db.substring(0, 4) !== 'TEMP') {
                continue;
              }
            }
            for (var key in snap[db]) {
              if (snap[db].hasOwnProperty(key)) {
                this.all.push({ key: key, obj: snap[db][key] });
              }
            }
          }
        }
      }
      callback(this.all);
    }.bind(this));
  }
};

/**
 * Gets either the restaurants, shelters, or both for a user.
 */
Glean.prototype.getLocationsOfUser = function (userID, wantRestaurants, callback) {
  if (this.signedIn()) {
    this.getByID(userID, function (user) {
      if (user === null) {
        console.log("User doesn't exist!");
      }
      var locations = [];
      if (wantRestaurants === true) {
        for (var key in user.restaurants) {
          if (key !== 0) {
            locations.push(user.restaurants[key]);
          }
        }
      } else if (wantRestaurants === false) {
        for (var key in user.shelters) {
          if (key !== 0) {
            locations.push(user.shelters[key]);
          }
        }
      } else {
        for (var key in user.restaurants) {
          if (key !== 0) {
            locations.push(user.restaurants[key]);
          }
        }
        for (var key in user.shelters) {
          if (key !== 0) {
            locations.push(user.shelters[key]);
          }
        }
      }
      callback(locations);
    }.bind(this));
  }
};

/**
 * Get all the locations with the given stateID (2 letter abbreviation).
 */
Glean.prototype.getLocationsInState = function (stateID, wantRestaurants, callback) {
  if (this.signedIn()) {
    var all = [];
    this.locationsRef.once('value').then(function (snapshot) {
      var snap = snapshot.val();
      for (var key in snap) {
        if (snap.hasOwnProperty(key)) {
          if (snap[key].state === stateID) {
            if ((wantRestaurants && snap[key].type === 'restaurant') || (!wantRestaurants && snap[key].type === 'shelter')) {
              all.push({ key: key, obj: snap[key] });
            }
          }
        }
      }
      callback(all);
    }.bind(this));
  }
}

/**
 * Verifies that a user has permission to perform actions with this location.
 */
Glean.prototype.verifyLocationPermission = function (userID, locationID, targetLocationIsRestaurant, callback) {
  if (this.signedIn()) {
    this.getLocationsOfUser(userID, targetLocationIsRestaurant, function (locations) {
      for (var key in locations) {
        if (locations[key].ID === locationID) {
          callback(true);
        }
      }
      callback(false);
    }.bind(this));
  }
}

/**
 * Generates an ID, incrementing the number at the end until the ID is unique.
 */
Glean.prototype.generateID = function (ID, callback) {
  if (this.signedIn()) {
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
  }
};

/**
 * Passes true to the callback if the given ID exists, passes false elsewise.
 */
Glean.prototype.IDExists = function (ID, callback) {
  if (this.signedIn()) {
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
}

Glean.prototype.populateData = function() {
  this.registerUser('a b','a','b','restaurant')
}