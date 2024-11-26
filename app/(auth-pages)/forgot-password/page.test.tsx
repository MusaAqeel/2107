import { render, screen, act } from '@testing-library/react';
import { fireEvent } from '@testing-library/react';
import { forgotPasswordAction } from "@/app/actions";
import '@testing-library/jest-dom';
import ForgotPassword from './page';
import React from 'react';

let email: HTMLInputElement;
let button: HTMLElement;
let link: HTMLElement;


jest.mock("../../actions", () => ({
    forgotPasswordAction: jest.fn(),
}));

jest.mock("react-dom", () => ({
    ...jest.requireActual("react-dom"),
    useFormStatus: jest.fn().mockReturnValue({ pending: true }),
}));

jest.mock("../../../components/submit-button", () => ({
    SubmitButton: ({ formAction, ...props}: {formAction: any}) => (
        <button {...props} onClick={formAction}></button>
    )
}));

describe('forgot password flow', () => {
    beforeEach( async () => {
        render( await ForgotPassword({ searchParams: Promise.resolve({ success: "Test success" }) }));
        email = screen.getByTestId('emailInput');
        button = screen.getByTestId('submit');
        link = screen.getByTestId('link');
    });

    it('renders title (TC-037)', () => {
        const title = screen.getByTestId('title');
        expect(title).toBeTruthy();
    });

    it('renders email input (TC-038)', () => {
        expect(email).toBeTruthy();
    });

    it('renders submit button (TC-039)', () => {
        expect(button).toBeTruthy();
    });

    it('renders all links (TC-040)', () => {
        expect(link).toBeTruthy();
    });

    it('submits request to change password (TC-041)', () => {
        fireEvent.change(email, { target: {value: 'testSuccess@test.com'}});
        fireEvent.click(button);
        expect(forgotPasswordAction).toBeCalled();
    });

    it('does not submit request to change password if not user email(TC-042)', () => {
        fireEvent.change(email, 'test@test.com');
        fireEvent.click(button);
        expect(forgotPasswordAction).not.toHaveBeenCalledWith(email);
    });
});


