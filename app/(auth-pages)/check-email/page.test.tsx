import { render, screen, act } from '@testing-library/react';
import { fireEvent } from '@testing-library/react';
import { forgotPasswordAction } from "@/app/actions";
import '@testing-library/jest-dom';
import React from 'react';
import { Information } from '@/components/ui/information';

let button: HTMLElement;
let link: HTMLElement;
let info: HTMLElement;

jest.mock("../../actions"), () => ({
    checkEmailAction: jest.fn(),
});

describe('email confirmation page', () => {

    beforeEach(() => {
        info = screen.getByTestId('info');
        button = screen.getByTestId('submit');
        link = screen.getByTestId('link');
    });

    it('renders information (TX-047)', () => {
        expect(info).toBeInTheDocument();
    });

    it('renders all links (TC-048)', () => {
        expect(link).toBeInTheDocument();
    });

    it('renders the submit button (TC-049)', () => {
        expect(button).toBeInTheDocument();
    });
});