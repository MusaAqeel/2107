import { render, screen } from '@testing-library/react';
import { fireEvent } from '@testing-library/react';
import { headers } from 'next/headers';
import { createClient } from "@/utils/supabase/server";
import ConnectSpotify from "@/components/connect-spotify";
import DisconnectSpotify from "@/components/disconnect-spotify";
import Profile from './page';
import React from 'react';
import '@testing-library/jest-dom';
import { assert } from 'console';

// We mock supabase to allow these online checks to pass in an offline testing environment
jest.mock('../../utils/supabase/server.ts', () => {
    return {
        createClient: jest.fn().mockReturnValue({
            auth: {
                getUser: jest.fn().mockReturnValue({data: { user: { name: 'test'}}})
            }
        })
    };
});

// accesstoken can be changed to simulate a fail in error tests
let accesstoken = 'test' as any;
// Mock connectionStatus hook to simulate online pass
jest.mock('../hooks/connectionStatus', () => {
    return {
        SpotifyConnectionStatus: jest.fn().mockImplementation(() => ({
            spotifyConnection: {
                access_token: accesstoken,
                profile_data: {
                    display_name: 'Test Name',
                    images: ['testURL']
                }
            }
        }))
    };
});

// Mock headers hook to simulate online pass
jest.mock("next/headers", () => ({
    headers: jest.fn().mockReturnValue({
        get: jest.fn().mockReturnValue('TEST'),
    }),
}));

describe('profile page - user connected', () => {
    beforeEach( async () => {
        render( await Profile() );
    });

    it('renders profile image (TC-050)', () => {
        const image = screen.getByAltText(/Spotify Profile/i);
        expect(image).toBeTruthy();
    });

    it('renders navigation links on profile page (TC-051)', () => {
        const disconnect = screen.getByText('Disconnect Spotify');
        const logout = screen.getByText('Sign Out');
        expect(disconnect).toBeTruthy();
        expect(logout).toBeTruthy();
    });

    it('allows user to disconnect account when currently linked (TC-053)', () => {
        const disconnectButton = screen.getByText('Disconnect Spotify');
        expect(disconnectButton).toBeTruthy();
    });
});

// Errors tested seperatley to change mock environment
describe('profile page - user disconnected', () => {
    it('allows user to connect account when not currently linked (TC-052)', async () => {
        accesstoken = null;
        render( await Profile() );
        const connectButton = screen.getByText('Connect Spotify');
        expect(connectButton).toBeTruthy();
    });
});