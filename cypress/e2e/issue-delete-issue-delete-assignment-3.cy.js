describe("Issue details editing", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.url()
      .should("eq", `${Cypress.env("baseUrl")}project`)
      .then((url) => {
        cy.visit(url + "/board");
        cy.contains("This is an issue of type: Task.")
          .should("be.visible")
          .click();
      });
  });

  const getIssueDetailsModal = () =>
    cy.get('[data-testid="modal:issue-details"]');

  it("Should delete an issue successfully", () => {
    getIssueDetailsModal().find('[data-testid="icon:trash"]').click();

    cy.get('[data-testid="modal:confirm"]')
      .should("be.visible")
      .within(() => {
        cy.contains("Are you sure you want to delete this issue?").should(
          "be.visible"
        );
        cy.contains("Once you delete, it's gone for good.").should(
          "be.visible"
        );
        cy.contains("button", "Delete issue").click();
      });

    cy.get('[data-testid="modal:confirm"]').should("not.exist");
    cy.reload();

    cy.get('[data-testid="list-issue"]')
      .find("p")
      .contains("This is an issue of type: Task.")
      .should("not.exist");
  });

  it("Should cancel an issue deletion successfully", () => {
    getIssueDetailsModal().find('[data-testid="icon:trash"]').click();

    cy.get('[data-testid="modal:confirm"]')
      .should("be.visible")
      .within(() => {
        cy.contains("Are you sure you want to delete this issue?").should(
          "be.visible"
        );
        cy.contains("Once you delete, it's gone for good.").should(
          "be.visible"
        );
        cy.contains("button", "Cancel").click();
      });

    cy.get('[data-testid="modal:confirm"]').should("not.exist");
    getIssueDetailsModal().find('[data-testid="icon:close"]').first().click();
    getIssueDetailsModal().should("not.exist");

    cy.get('[data-testid="list-issue"]')
      .find("p")
      .contains("This is an issue of type: Task.")
      .should("be.visible");
  });
});
