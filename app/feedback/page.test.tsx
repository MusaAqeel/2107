import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import Feedback from "./page";
import React from "react";

let input: HTMLInputElement;
let button: HTMLElement;
let title: HTMLElement;

describe("Feedback", () => {
    let originalLocation: Location;

    beforeEach(() => {
        originalLocation = window.location;
        delete (window as any).location;
        window.location = { href: "" } as Location;
        render(<Feedback />);
        title = screen.getByText(/Feedback/i);
        input = screen.getByTestId("textInput");
        button = screen.getByTestId("submitButton");
    });

    it("renders title, input field, and submit button (TC-014)", () => {
        
        expect(title).toBeInTheDocument();
        expect(input).toBeInTheDocument();
        expect(button).toBeInTheDocument();
    });

    it("constructs the correct mailto link with user input (TC-015)", () => {
        const testFeedback = "This is test feedback";
        fireEvent.change(input, { target: { value: testFeedback } });
        fireEvent.click(button);

        const expectedMailtoLink = `mailto:your-email@example.com?subject=${encodeURIComponent(
            "Feedback Submission"
        )}&body=${encodeURIComponent(testFeedback)}`;

        expect(window.location.href).toBe(expectedMailtoLink);
    });
});