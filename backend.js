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
    this.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider()).then(function (user) {
      this.setCurrentUserID(user.email)
    }.bind(this));
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
    this.saveDeviceToken();
  }
};

/**
 * Checks to see if a user is currently signed in to Glean.
 */
Glean.prototype.signedIn = function () {
  return (this.auth.currentUser && this.ID) || this.superUser;
};

Glean.prototype.setCurrentUserID = function (email) {
  if (this.ID) {
    return;
  }
  this.getAll('users', function (users) {
    for (var key in users) {
      if (users.hasOwnProperty(key)) {
        if (users[key].obj.email === email) {
          console.log("Found an ID match! Welcome " + users[key].obj.ID);
          this.ID = users[key].obj.ID;
          return;
        }
      }
    }
    console.log("Couldn't set current user id!");
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
      }
      if (driversLicense !== null) {
        driversLicense = driversLicense.toLowerCase();
      }
      if (carLicense !== null) {
        carLicense = carLicense.toLowerCase();
      }
      this.usersRef.push({
        ID: userID.toLowerCase(),
        creation: Date.now(),
        updated: Date.now(),
        firstName: firstName.toLowerCase(),
        lastName: lastName.toLowerCase(),
        role: role.toLowerCase(),
        email: email.toLowerCase(),
        phone: phone.toLowerCase(),
        restaurants: [0],
        shelters: [0],
        driversLicense: driversLicense,
        carLicense: carLicense
      }).then(function () {
        // redirect to home?
      }.bind(this)).catch(function (error) {
        var missing = "";
        if (userID === null) {
          missing += '& username';
        }
        if (firstName === null) {
          missing += '& firstName ';
        }
        if (lastName === null) {
          missing += '& lastName ';
        }
        if (role === null) {
          missing += '& role ';
        }
        if (email === null) {
          missing += '& email ';
        }
        if (phone === null) {
          missing += '& phone ';
        }
        if (role === 'driver') {
          if (driversLicense === null) {
            missing += '& driversLicense ';
          }
          if (carLicense === null) {
            missing += '& carLicense ';
          }
        }
        missing = missing.substring(2);
        console.error('Missing: ' + missing, error);
      });
    }.bind(this))
  }
};

/**
 * Registers al ocation as a shelter or restaurant.
 */
Glean.prototype.registerLocation = function (locationName, type, street, street2, city, state, phone, notes) {
  if (this.signedIn()) {
    var newID = (locationName + "-" + state + "-" + city + "-" + street.split()[0]).replace(/ /g, '').toLowerCase();
    this.IDExists(newID, function (exists) {
      if (exists) {
        console.log('Location already exists!');
        return;
      }
      if (street2) {
        street2 = street2.toLowerCase();
      }
      if (notes) {
        notes = notes.toLowerCase();
      }
      this.locationsRef.push({
        ID: newID,
        creation: Date.now(),
        updated: Date.now(),
        type: type.toLowerCase(),
        name: locationName.toLowerCase(),
        contact: this.ID.toLowerCase(),
        street: street.toLowerCase(),
        street2: street2,
        city: city.toLowerCase(),
        state: state.toLowerCase(),
        phone: phone,
        notes: notes
      }).catch(function (error) {
        var missing = "";
        if (locationName === null) {
          missing += '& location name ';
        }
        if (type === null) {
          missing += '& type ';
        }
        if (street === null) {
          missing += '& street ';
        }
        if (city === null) {
          missing += '& city ';
        }
        if (state === null) {
          missing += '& state ';
        }
        if (phone === null) {
          missing += '& phone ';
        }
        missing = missing.substring(2);
        console.error('Missing: ' + missing, error);
      });
    }.bind(this));
  }
};

/**
 * Create an offer by a restaurant.
 */
Glean.prototype.createOffer = function (restaurantID, city, description, quantity, notes) {
  if (this.signedIn()) {
    this.verifyLocationPermission(this.ID, restaurantID, true, function (verified) {
      if (!verified && !this.superUser) {
        console.log('User does not have access to this location!');
        return;
      }
      var newID = (restaurantID + '-offer').toLowerCase();
      this.IDExists(newID, function (exists) {
        if (exists) {
          console.log("Offer id already exists!");
          return;
        }
        if (notes) {
          notes = notes.toLowerCase();
        }
        this.offersRef.push({
          ID: newID,
          creation: Date.now(),
          updated: Date.now(),
          restaurantID: restaurantID.toLowerCase(),
          city: city.toLowerCase(),
          description: description.toLowerCase(),
          quantity: quantity,
          notes: notes
        }).then(function () {
          // redirect to home?
        }.bind(this)).catch(function (error) {
          var missing = "";
          if (restaurantID === null) {
            missing += '& restaurantID ';
          }
          if (description === null) {
            missing += '& description ';
          }
          if (quantity === null) {
            missing += '& quantity ';
          }
          missing = missing.substring(2);
          console.error('Missing: ' + missing, error);
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
    this.verifyLocationPermission(this.ID, shelterID, false, function (verified) {
      if (!verified && !this.superUser) {
        console.log('User does not have access to this location!');
        return;
      }
      var newID = (shelterID + '-request').toLowerCase();
      this.IDExists(newID, function (exists) {
        if (exists) {
          console.log("Request id already exists!");
          return;
        }
        if (notes) {
          notes = notes.toLowerCase();
        }
        this.requestsRef.push({
          ID: newID,
          creation: Date.now(),
          updated: Date.now(),
          shelterID: shelterID.toLowerCase(),
          description: description.toLowerCase(),
          quantity: quantity,
          notes: notes
        }).then(function () {
          // redirect to home?
        }.bind(this)).catch(function (error) {
          var missing = "";
          if (shelterID === null) {
            missing += '& description ';
          }
          if (description === null) {
            missing += '& description ';
          }
          if (quantity === null) {
            missing += '& quantity ';
          }
          missing = missing.substring(2);
          console.error('Missing: ' + missing, error);
        });
      }.bind(this));
    }.bind(this));
  }
};

/**
 * Creates a delivery by matching a driver to an offer.
 */
Glean.prototype.createDelivery = function (offerID, driverID, shelterID) {
  if (this.signedIn()) {
    var newID = (offerID + '-' + driverID).toLowerCase();
    this.IDExists(newID, function (exists) {
      if (exists) {
        console.log("Delivery exists already!");
        return;
      }
      this.deliveriesRef.push({
        ID: newID,
        creation: Date.now(),
        updated: Date.now(),
        offerID: offerID.toLowerCase(),
        driverID: driverID.toLowerCase(),
        shelterID: shelterID.toLowerCase()
      }).catch(function (error) {
        var missing = "";
        if (offerID === null) {
          missing += '& offerID ';
        }
        if (driverID === null) {
          missing += '& driverID ';
        }
        if (shelterID === null) {
          missing += '& shelterID ';
        }
        missing = missing.substring(2);
        console.error('Missing: ' + missing, error);
      });
    }.bind(this));
  }
};

/**
 * Adds a location to a given user.
 */
Glean.prototype.addLocationToUser = function (locationKey) {
  if (this.signedIn()) {
    this.getKeyFromID(this.ID, function (userKey) {
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
        driversLicense: driversLicense || user.driversLicense,
        carLicense: carLicense || user.carLicense
      };
      firebase.database().ref().update(updates);
    }.bind(this));
  }
}

/**
 * Updates a location's info.
 */
Glean.prototype.updateLocation = function (locationKey, locationName, type, contact, street, street2, city, state, phone, notes) {
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
        type: type.toLowerCase() || location.type,
        name: locationName.toLowerCase() || location.name,
        contact: contact.toLowerCase() || location.contact,
        street: street.toLowerCase() || location.street,
        street2: street2 || location.street2,
        city: city.toLowerCase() || location.city,
        state: state.toLowerCase() || location.state,
        phone: phone.toLowerCase() || location.phone,
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
        restaurantID: offer.restaurantID,
        city: offer.city,
        description: description || offer.description,
        quantity: quantity || offer.quantity,
        notes: notes || offer.notes
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
        description: description || request.description,
        quantity: quantity || request.quantity,
        notes: notes || request.notes
      };
      firebase.database().ref().update(updates);
    }.bind(this));
  }
}

/**
 * Updates a delivery.
 */
Glean.prototype.updateDelivery = function (deliveryKey, offerID, driverID, shelterID) {
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
        offerID: offerID.toLowerCase() || delivery.offerID,
        driverID: driverID.toLowerCase() || delivery.driverID,
        shelterID: shelterID.toLowerCase() || delivery.shelterID
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
};

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
  var all = [];
  firebase.database().ref(database).once('value').then(function (snapshot) {
    var snap = snapshot.val();
    if (database !== '/') {
      for (var key in snap) {
        if (snap.hasOwnProperty(key)) {
          all.push({ key: key, obj: snap[key] });
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
              all.push({ key: key, obj: snap[db][key] });
            }
          }
        }
      }
    }
    callback(all);
  }.bind(this));
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
          if (key !== '0') {
            locations.push(user.restaurants[key]);
          }
        }
      } else if (wantRestaurants === false) {
        for (var key in user.shelters) {
          if (key !== '0') {
            locations.push(user.shelters[key]);
          }
        }
      } else {
        for (var key in user.restaurants) {
          if (key !== '0') {
            locations.push(user.restaurants[key]);
          }
        }
        for (var key in user.shelters) {
          if (key !== '0') {
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
};

Glean.prototype.getLocationsInCity = function (city, wantRestaurants, callback) {
  if (this.signedIn()) {
    var all = [];
    this.locationsRef.once('value').then(function (snapshot) {
      var snap = snapshot.val();
      for (var key in snap) {
        if (snap.hasOwnProperty(key)) {
          if (snap[key].city === city) {
            all.push({ key: key, obj: snap[key] });
          }
        }
      }
      callback(all);
    }.bind(this));
  }
};

/**
 * Gets deliveries going to a shelter.
 */
Glean.prototype.getDeliveriesForShelter = function (shelterID, callback) {
  var deliveries = [];
  this.getAll('deliveries', function (all) {
    for (var key in all) {
      if (all.hasOwnProperty(key)) {
        if (all[key].obj.shelterID === shelterID) {
          deliveries.push(all[key]);
        }
      }
    }
    callback(deliveries);
  }.bind(this))
};

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
      callback(false || this.superUser);
    }.bind(this));
  }
};

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
};

/**
 * Adds fake data.
 */
Glean.prototype.populateData = function () {
  this.superUser = true;
  this.registerUser('dliangsta', 'david', 'liang', 'restaurant', 'davidliangx27@gmail.com', '000-000-0000', null, null);
  this.registerUser('sahibgoa', 'sahib', 'singh', 'shelter', 'sahibgoa.17@gmail.com', '111-111-1111', null, null);
  this.registerUser('evanfredhernandez', 'evan', 'hernandez', 'driver', 'evanfredhernandez@gmail.com', '222-222-2222', null, null);
  if (!this.auth.currentUser || !this.ID) {
    this.signIn();
    console.log('You must sign in first!');
    return;
  }
  // restaurant contacts
  this.registerUser('aaronbennington', 'aaron', 'bennington', 'restaurant', 'aaronbennington@gmail.com', '000-000-0000', null, null);
  this.registerUser('charliedickinson', 'charlie', 'dickinson', 'restaurant', 'charliedickinson@gmail.com', '000-000-0001', null, null);
  this.registerUser('edwardfrederickson', 'edward', 'frederickson', 'restaurant', 'edwardfrederickson@gmail.com', '000-000-0002', null, null);
  this.registerUser('georgehenry', 'george', 'henry', 'restaurant', 'georgehenry@gmail.com', '000-000-0003', null, null);
  this.registerUser('isaacjohnson', 'isaac', 'johnson', 'restaurant', 'isaacjohnson@gmail.com', '000-000-0004', null, null);
  // shelter contacts
  this.registerUser('kylelang', 'kyle', 'lang', 'shelter', 'kylelang@gmail.com', '100-000-0000', null, null);
  this.registerUser('michaelnichols', 'michael', 'nichols', 'shelter', 'michaelnichols@gmail.com', '100-000-0001', null, null);
  this.registerUser('ostritchparty', 'ostritch', 'party', 'shelter', 'ostritchparty@gmail.com', '100-000-0002', null, null);
  this.registerUser('qtpie', 'qt', 'pie', 'shelter', 'qtpie@gmail.com', '100-000-0003', null, null);
  this.registerUser('ricksantorum', 'rick', 'santorum', 'shelter', 'ricksantorum@gmail.com', '100-000-0004', null, null);
  // drivers
  this.registerUser('tommyunrein', 'tommy', 'unrein', 'driver', 'tommyunrein@gmail.com', '200-000-0000', null, null);
  this.registerUser('vicwashing', 'vic', 'washington', 'driver', 'vicwashington@gmail.com', '200-000-0001', null, null);
  this.registerUser('westxylophone', 'west', 'xylophone', 'driver', 'westxylophone@gmail.om', '200-000-0002', null, null);
  this.registerUser('yacoubzebra', 'yacoub', 'zebra', 'driver', 'yacoubzebra@gmail.com', '200-000-0003', null, null);

  // restaurants
  this.registerLocation('asian kitchen', 'restaurant', '100 main st', null, 'madison', 'wi', '999-999-9999', 'asian food');
  this.registerLocation('burger king', 'recstaurant', '200 main st', null, 'madison', 'wi', '999-999-9998', 'burgers');
  this.registerLocation('chicken queen', 'restaurant', '300 main st', null, 'chicago', 'il', '999-999-9997', 'chicken sandwiches');
  this.registerLocation('dennys', 'restaurant', '400 main st', null, 'chicago', 'il', '999-999-9996', 'home food?');
  this.registerLocation('einsteins', 'restaurant', '500 main st', null, 'milwaukee', 'wi', '999-999-9995', 'bagel bros');
  // shelters
  this.registerLocation('saint francis', 'shelter', '100 secondary st', null, 'chicago', 'il', '888-888-8888', 'serving 100');
  this.registerLocation('saint godfrey', 'shelter', '200 secondary st', null, 'chicago', 'il', '888-888-8887', 'serving 20');
  this.registerLocation('saint hornifer', 'shelter', '300 secondary st', null, 'chicago', 'il', '888-888-8886', 'low funding');
  this.registerLocation('saint ike', 'shelter', '400 secondary st', null, 'madison', 'wi', '888-888-8885', 'thanks');
  this.registerLocation('saint james', 'shelter', '500 secondary st', null, 'milwaukee', 'wi', '888-888-8884', 'you guys rock');

  // offers
  this.createOffer('asiankitchen-wi-madison-100mainst', 'madison', 'chow mein', 10, 'pick up front');
  this.createOffer('burgerking-wi-madison-200mainst', 'madison', 'burgers', 100, 'pick up at back');
  this.createOffer('chickenqueen-il-chicago-300mainst', 'chicago', 'chicken sandwich', 2, 'only a few');
  this.createOffer('dennys-il-chicago-400mainst', 'chicago', 'pancakes', 30, 'syrup provided too');
  this.createOffer('einsteins-wi-milwaukee-500mainst', 'chicago', 'bagels', 500, 'lots');

  // requests
  this.createRequest('saintike-wi-madison-400secondaryst', 'please', 20, null);

  //deliveries
  this.createDelivery('yacoubzebra', 'asiankitchen-wi-madison-100mainst-1488065987913', 'saintike-wi-madison-400secondaryst');
  this.createDelivery('yacoubzebra', 'burgerking-wi-madison-200mainst-1488065987913', 'saintjames-wi-milwaukee-500secondaryst');
  this.createDelivery('westxylophone', 'chickenqueen-il-chicago-300mainst-1488065987913', 'saintfrancis-il-chicago-100secondaryst');
  // this.superUser = false;
};
Glean.prototype.arrangeDeliveries = function () {
  this.getAll('offers', function (all) {
    for (var i = 0; i < all.length; i++) {
      var city = all[i].obj.city;
      console.log(city); 
      var locations = [all.shift()];
      for (var j = 0; j < all.length; j++) {
        if (all[j].obj.city === city) {
          locations.push(all.splice(j--, 1)[0]);
        }
      }
      console.log(locations);
    }
  }.bind(this));
};

var glean;
setTimeout(function () {
  document.glean.then(function (g) {
    glean = g;
  });
}, 1000);