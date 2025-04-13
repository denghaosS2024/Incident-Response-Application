import "../../../cypress/support/commands";
import SystemGroupConfigs from "../../../server/src/utils/SystemDefinedGroups";

describe("User Registration API", () => {
  before(() => {
    const username = "test01";
    const password = "test01";
    const role = "Citizen";
    cy.registerUser(username, password, role).then((response) => {
      return cy.login(username, password).then((response) => {
        expect(response.status).to.equal(200);

        // Set the token in local storage
        const token = response.body.token;
        expect(token).to.exist;
        localStorage.setItem("token", token);
        localStorage.setItem("username", username);
        cy.visit("/groups/new");
      });
    });
  });

  it("successfully loads", () => {
    cy.contains("New Group");
    cy.contains("Group Name");
    cy.contains("Owner: test01");
  });
});
