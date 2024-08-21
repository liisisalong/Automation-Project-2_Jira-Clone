//Constants
import { faker } from "@faker-js/faker";
const randomTitle = faker.word.adjective();
const randomDescription = faker.word.words({ count: { min: 5, max: 10 } });
const defaultTimeEstimate = 10;
const updatedTimeEstimate = 20;
const defaultTimeSpent = 2;
const defaultTimeRemaining = 5;

//Selectors
const timeEstimateInput = () => cy.get('input[placeholder="Number"]');
const timeTrackerInput = () =>
  cy.get('[data-testid="icon:stopwatch"]').parent();
const timeTrackerInputModal = () => cy.get('[data-testid="modal:tracking"]');

//Functions for Time Tracking
function addTimeSpent(number) {
  timeTrackerInputModal().within(() => {
    cy.get('[placeholder="Number"]').first().type(number);
  });
}
function addTimeRemaining(number) {
  timeTrackerInputModal().within(() => {
    cy.get('[placeholder="Number"]').last().type(number);
  });
}
function saveTimeTracking() {
  cy.get('[data-testid="modal:tracking"]').contains("button", "Done").click();
  timeTrackerInputModal().should("not.exist");
}

//Functions (others)
function closeIssueDetailsModal() {
  cy.get('[data-testid="modal:issue-details"]').within(() => {
    cy.get('[data-testid="icon:close"]').click();
  });
  cy.get('[data-testid="modal:issue-details"]').should("not.exist");
}
function createTestIssue() {
  cy.get('[data-testid="modal:issue-create"]').within(() => {
    cy.get(".ql-editor").type(randomDescription);
    cy.get('input[name="title"]').type(randomTitle);
    cy.get('button[type="submit"]').click();
  });
  cy.get('[data-testid="modal:issue-create"]').should("not.exist");
  cy.reload();
}
function selectTestIssue() {
  cy.get('[data-testid="board-list:backlog"]')
    .should("be.visible")
    .and("have.length", "1")
    .within(() => {
      cy.get('[data-testid="list-issue"]')
        .find("p")
        .contains(randomTitle)
        .click();
    });
}

// TEST CASES

describe("Issue create", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.url()
      .should("eq", `${Cypress.env("baseUrl")}project/board`)
      .then((url) => {
        cy.visit(url + "/board?modal-issue-create=true");
      });
    createTestIssue();
    selectTestIssue();
  });

  it("Should add, update and remove estimation successfully", () => {
    timeTrackerInput().should("contain", "No time logged");
    // Add a default time estimate, then verify and update it
    timeEstimateInput().should("be.empty").click().type(defaultTimeEstimate);
    cy.wait(1000);
    closeIssueDetailsModal();
    selectTestIssue();
    timeEstimateInput()
      .should("have.value", defaultTimeEstimate)
      .clear()
      .type(updatedTimeEstimate);
    cy.wait(1000);
    closeIssueDetailsModal();
    selectTestIssue();
    timeEstimateInput().should("have.value", updatedTimeEstimate).clear();
    cy.wait(1000);
    closeIssueDetailsModal();
    selectTestIssue();
    // Verify that the time estimate input is empty with the placeholder text
    timeEstimateInput()
      .should("have.attr", "placeholder", "Number")
      .and("be.empty");
  });

  it("Should log and remove logged time successfully", () => {
    // Log time and verify the values are correctly displayed
    timeTrackerInput().click();
    timeTrackerInputModal().should("be.visible");
    addTimeSpent(defaultTimeSpent);
    addTimeRemaining(defaultTimeRemaining);
    saveTimeTracking();
    timeTrackerInput()
      .should("contain", defaultTimeSpent)
      .and("contain", defaultTimeRemaining);
    // Remove logged time and verify that the time logged displays "No time logged"
    timeTrackerInput().click();
    timeTrackerInputModal().should("be.visible");
    timeTrackerInputModal().within(() => {
      cy.get('[placeholder="Number"]').first().clear();
      cy.get('[placeholder="Number"]').last().clear();
    });
    saveTimeTracking();
    timeTrackerInput().should("contain", "No time logged");
  });
});
