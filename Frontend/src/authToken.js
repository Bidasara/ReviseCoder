import api from "./api";

let logoutCallback = null;
let accessToken = null;

export function getAccessToken() {
  return accessToken;
}

export function setAccessToken(token) {
  accessToken = token;
} 

export function removeAccessToken() {
  accessToken = null;
}

export function setLogoutCallback(callback) {
  logoutCallback = callback;
  if (typeof logoutCallback !== 'function') {
    console.error("Logout callback must be a function");
    logoutCallback = null;
  }
}

export function triggerLogout() {
  if(logoutCallback) {
    console.log("Triggering logout callback...");
    logoutCallback();
  } else {
    console.warn("No logout callback set. Please set a logout callback using setLogoutCallback.");
    removeAccessToken();
  }
}