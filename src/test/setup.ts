import "@testing-library/jest-dom/vitest";

// jsdom has no <dialog> modal API.
HTMLDialogElement.prototype.showModal = function showModal() {
  this.setAttribute("open", "");
};
HTMLDialogElement.prototype.close = function close() {
  if (!this.open) return;
  this.removeAttribute("open");
  this.dispatchEvent(new Event("close"));
};
