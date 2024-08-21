const issueComment = '[data-testid="issue-comment"]';
const editableCommentbox = 'textarea[placeholder="Add a comment..."]';

const comment = "TEST_COMMENT";
const newComment = "NEW COMMENT";

const getIssueDetailsModal = () =>
  cy.get('[data-testid="modal:issue-details"]');
const saveComment = () =>
  cy.contains("button", "Save").click().should("not.exist");

const openCommentBox = () => cy.contains("Add a comment...").click();
const typeComment = (text) => cy.get(editableCommentbox).type(text);
const assertCommentExists = (text) =>
  cy.get(issueComment).should("contain", text);

const closeModal = () => {
  cy.get('[data-testid="icon:close"]').first().click();
  cy.get('[data-testid="modal:issue-details"]').should("not.exist");
};

const reopenModal = () => {
  cy.contains("This is an issue of type: Task.").click();
  cy.get('[data-testid="modal:issue-details"]').should("be.visible");
};

function addComment(comment) {
  getIssueDetailsModal().within(() => {
    openCommentBox();
    typeComment(comment);
    saveComment();
  });
}

function editComment(newComment) {
  getIssueDetailsModal().within(() => {
    cy.get(issueComment).first().contains("Edit").click().should("not.exist");
    cy.get(editableCommentbox).clear().type(newComment);
    saveComment();
  });
}

function assertCommentPersistence(comment) {
  closeModal();
  reopenModal();
  getIssueDetailsModal().within(() => assertCommentExists(comment));
}

function deleteComment(comment) {
  getIssueDetailsModal()
    .find(issueComment)
    .contains(comment)
    .parent()
    .contains("Delete")
    .click();

  cy.get('[data-testid="modal:confirm"]')
    .contains("button", "Delete comment")
    .click()
    .should("not.exist");

  getIssueDetailsModal()
    .find(issueComment)
    .contains(comment)
    .should("not.exist");
}

// Test Case
describe("Issue comments creating, editing and deleting", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.url()
      .should("eq", `${Cypress.env("baseUrl")}project/board`)
      .then((url) => {
        cy.visit(url + "/board");
        cy.contains("This is an issue of type: Task.").click();
      });
  });

  it("Should add, edit, verify persistence, and delete comment successfully", () => {
    const comment = "TEST_COMMENT";
    const newComment = "NEW COMMENT";

    addComment(comment);
    assertCommentPersistence(comment);

    editComment(newComment);
    assertCommentPersistence(newComment);

    deleteComment(newComment);
  });
});
