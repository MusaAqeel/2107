import { render, screen, act } from '@testing-library/react';
import { fireEvent } from '@testing-library/react';
import { signInAction } from '@/app/actions'; 
import '@testing-library/jest-dom';

let email: HTMLInputElement;
let password: HTMLInputElement;
let button: HTMLElement;
let link: HTMLElement;

jest.mock("../../actions"), () => ({
    signInAction: jest.fn(),
});

describe('login', () => {
    beforeEach(() => {
        email = screen.getByTestId('emailInput');
        password = screen.getByTestId('passwordInput');
        button = screen.getByTestId('submit');
        link = screen.getByTestId('link');
    });

    it('renders title (TC-023)', () => {
        const title = screen.getByText(/Sign in/i);
        expect(title).toBeInTheDocument();
    });

    it('renders email input (TC-024)', () => {
        expect(email).toBeInTheDocument();
    });

    it('renders password input (TC-025)', () => {
        expect(password).toBeInTheDocument();
    });
    
    it('renders sign in button (TC-026)', () => {
        expect(button).toBeInTheDocument();
    });

    it('renders all links (TC-027)', () => {
        expect(link).toBeInTheDocument();
        expect(link).toHaveReturnedTimes(2);

    });

    it('does not submit if incorrect login (TC-028)', () => {
        fireEvent.change(email, 'testFail@test.com');
        fireEvent.change(password, 'test');
        fireEvent.click(button);
        expect(signInAction).not.toHaveBeenCalledWith(email);
    });

    it('signs in successfully (TC-029)', () => {
        fireEvent.change(email, 'testSuccess@test.com');
        fireEvent.change(password, 'test');
        fireEvent.click(button);
        expect(signInAction).toHaveBeenCalledWith(email);
    });
});


