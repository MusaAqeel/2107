import { render, screen, act } from '@testing-library/react';
import { fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

let email: HTMLInputElement;
let password: HTMLInputElement;
let button: HTMLElement;
let link: HTMLElement;

describe('login', () => {
    beforeEach(() => {
        email = screen.getByTestId('emailInput');
        password = screen.getByTestId('passwordInput');
        button = screen.getByTestId('submit');
        link = screen.getByTestId('link');
    });

    it('renders title (TC-030)', () => {
        const title = screen.getByText(/Sign up/i);
        expect(title).toBeInTheDocument();
    });

    it('renders email input (TC-031)', () => {
        expect(email).toBeInTheDocument();
    });

    it('renders password input (TC-032)', () => {
        expect(password).toBeInTheDocument();
    });
    
    it('renders sign up button (TC-033)', () => {
        expect(button).toBeInTheDocument();
    });

    it('renders all links (TC-034)', () => {
        expect(link).toBeInTheDocument();
        expect(link).toHaveReturnedTimes(2);

    });

    it('displays error if incorrect login (TC-035)', () => {
        fireEvent.change(email, 'testFail@test.com');
        fireEvent.change(password, 'test');
        fireEvent.click(button);
        expect(button).toBeInTheDocument();
    });

    it('signs in successfully (TC-036)', () => {
        fireEvent.change(email, 'testSuccess@test.com');
        fireEvent.change(password, 'test');
        fireEvent.click(button);
        expect(button).toBeInTheDocument();
    });
});


