import { render, screen } from '@testing-library/react';
import { fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Feedback from './page';
import React from 'react';

let input: HTMLInputElement;
let button: HTMLElement;


describe('feedback', () => {
    beforeEach(() => {
        render(<Feedback />);
        input = screen.getByTestId("textInput");
        button = screen.getByTestId("submitButton");
    });


    it('renders title and submit button (TC-014)', () => {
        const title = screen.getByText(/Feedback/i);
        expect(title).toBeInTheDocument();
        expect(input).toBeInTheDocument();
        expect(button).toBeInTheDocument();
    });

    it('submits the feedback(TC-015)', () => {
        fireEvent.change(input, {target: {value: "test"}});
        fireEvent.click(button);

        expect(button.textContent).toBe("Submitted");
    });
});