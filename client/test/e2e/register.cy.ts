describe("register a new user", () => {
  beforeEach(() => {
    // cy.task("resetTestDb");
    cy.visit("/register");
  });

  it("successfully loads", () => {
    cy.contains("Register");
    cy.contains("Username");
    cy.contains("Password");
    cy.contains("Confirm Password");
    cy.contains("Citizen");
    cy.contains("Police");
    cy.contains("Fire");
    cy.contains("Administrator");
    cy.contains("Nurse");
    cy.contains("Dispatch");
    cy.contains("Register");
    cy.contains("Login");
  });

  it("should show validation errors for empty fields", () => {
    // Click register without filling any fields
    cy.get('button[type="submit"]').click();
    // Verify error messages
    cy.contains("Username can not be empty").should("be.visible");
    cy.contains("Password can not be empty").should("be.visible");
    cy.contains("Confirm password can not be empty").should("be.visible");
    cy.contains("Role can not be empty").should("be.visible");
  });

  it("should register a new user successfully", () => {
    cy.intercept("POST", "/api/users", (req) => {
      // Validate the request body
      expect(req.body).to.have.property("username", "testuser");
      expect(req.body).to.have.property("password", "password123");
      expect(req.body).to.have.property("role", "Police");
      // Mock the response
      req.reply({
        statusCode: 201,
        body: {
          _id: "mockId123",
          username: "testuser",
          role: "Police",
        },
      });
    }).as("registerApi");
    cy.contains("Username").parent().find("input").type("testuser");
    cy.contains("Password").parent().find("input").type("password123");
    cy.contains("Confirm Password").parent().find("input").type("password123");
    cy.contains("button", "Police").click();
    cy.contains("button", "Register").click();
    cy.contains("Confirm Registration");
    cy.contains("Are you sure you want to create a new Police account?");
    cy.contains("button", "Confirm").click();
    cy.wait("@registerApi").then((interception) => {
      expect(interception.response?.statusCode).to.equal(201);
      expect(interception.response?.body).to.have.property(
        "username",
        "testuser",
      );
    });
    cy.url().should("include", "/login");
  });
});
