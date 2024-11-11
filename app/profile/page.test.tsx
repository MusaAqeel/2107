import { render, screen } from '@testing-library/react';
import { fireEvent } from '@testing-library/react';
import ConnectSpotify from "@/components/connect-spotify";
import DisconnectSpotify from "@/components/disconnect-spotify";
import Profile from './page';
import React from 'react';
import '@testing-library/jest-dom';

let email: HTMLInputElement;
let password: HTMLInputElement;
let button: HTMLElement;
let link: HTMLElement;

jest.mock("../../../components/connect-spotify"), () => ({
    ConnectSpotify: jest.fn(),
});

jest.mock("../../../components/disconnect-spotify"), () => ({
    DisconnectSpotify: jest.fn(),
});

describe('edit profile page', () => {
    beforeEach(() => {
        render(<Profile />);
        email = screen.getByTestId('emailInput');
        password = screen.getByTestId('passwordInput');
        button = screen.getByTestId('submit');
        link = screen.getByTestId('link');
    });

    it('renders title (TC-030)', () => {
        const title = screen.getByText(/Sign up/i);
        expect(title).toBeInTheDocument();
    });

    it('renders image (TC-031)', () => {
        const image = screen.getByAltText(/Spotify Profile/i);
        expect(image).toBeInTheDocument();
    });

    it('renders links (TC-032)', () => {
        const title = screen.getByText(/Sign up/i);
        expect(title).toBeInTheDocument();
    });

    it('Calls connect to Spotify correctly (TC-033)', () => {
        const button = screen.
    });

    it('Calls disconnect to Spotify correctly (TC-033)', () => {
        
    });
});