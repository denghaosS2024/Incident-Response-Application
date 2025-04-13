/// <reference types="cypress" />

Cypress.Commands.add("registerUser", (username, password, role) => {
  cy.request({
    method: "POST",
    url: "http://127.0.0.1:3001/api/users",
    body: {
      username: username,
      password: password,
      role: role,
    },
  }).as("registerUser");
});

Cypress.Commands.add("login", (username, password) => {
  cy.request({
    method: "POST",
    url: "http://127.0.0.1:3001/api/login",
    body: {
      username: username,
      password: password,
    },
  }).as("login");
});
