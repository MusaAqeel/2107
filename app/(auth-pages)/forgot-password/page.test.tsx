import { render, screen, act } from '@testing-library/react';
import { fireEvent } from '@testing-library/react';
import { forgotPasswordAction } from "@/app/actions";
import '@testing-library/jest-dom';
import ForgotPassword from './page';
import React from 'react';

let email: HTMLInputElement;
let button: HTMLElement;
let link: HTMLElement;


jest.mock("../../actions"), () => ({
    forgotPasswordAction: jest.fn(),
});

describe('forgot password flow', () => {
    beforeEach(() => {
        email = screen.getByTestId('emailInput');
        button = screen.getByTestId('submit');
        link = screen.getByTestId('link');
    });

    it('renders title (TC-037)', () => {
        const title = screen.getByText(/Reset Password/i);
        expect(title).toBeInTheDocument();
    });

    it('renders email input (TC-038)', () => {
        expect(email).toBeInTheDocument();
    });

    it('renders sign in button (TC-039)', () => {
        expect(button).toBeInTheDocument();
    });

    it('renders all links (TC-040)', () => {
        expect(link).toBeInTheDocument();
        expect(link).toHaveReturnedTimes(1);

    });

    it('submits request to change password (TC-041)', () => {
        fireEvent.change(email, 'test@test.com');
        fireEvent.click(button);
        expect(forgotPasswordAction).toHaveBeenCalledWith(email);
    });

    it('does not submit request to change password if not user email(TC-042)', () => {
        fireEvent.change(email, 'test@test.com');
        fireEvent.click(button);
        expect(forgotPasswordAction).not.toHaveBeenCalledWith(email);
    });

});


