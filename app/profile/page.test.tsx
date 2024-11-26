import { render, screen } from '@testing-library/react';
import { fireEvent } from '@testing-library/react';
import { headers } from 'next/headers';
import { createClient } from "@/utils/supabase/server";
import ConnectSpotify from "@/components/connect-spotify";
import DisconnectSpotify from "@/components/disconnect-spotify";
import Profile from './page';
import React from 'react';
import '@testing-library/jest-dom';

jest.mock('../../utils/supabase/server.ts', () => {
    return {
        createClient: jest.fn().mockReturnValue({
            auth: {
                getUser: jest.fn().mockReturnValue({data: { user: { name: 'test'}}})
            }
        })
    };
});

jest.mock('../hooks/connectionStatus', () => {
    return {
        SpotifyConnectionStatus: jest.fn().mockReturnValue({
            spotifyConnection: {
                access_token: 'test',
                profile_data: {
                    display_name: 'Test Name',
                    images: ['testURL']
                }
            }
        })
    };
});

jest.mock("next/headers", () => ({
    headers: jest.fn().mockReturnValue({
        get: jest.fn().mockReturnValue('TEST'),
    }),
}));

describe('edit profile page', () => {
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

    // it('calls connect to Spotify correctly (TC-052)', () => {
    //     expect(window.location.href).not.toBe('/api/spotify/auth');
    //     fireEvent.click(connect);
    //     expect(ConnectSpotify).toHaveBeenCalled;
    //     expect(window.location.href).toBe('/api/spotify/auth');
    // });

    // it('calls disconnect to Spotify correctly (TC-053)', () => {
    //     const disconnect = screen.getByText('Disconnect Spotify');
    //     expect(disconnect).toBeTruthy();
    //     fireEvent.click(disconnect);

    //     const disconnectCalled = screen.getByText('Disconnecting...');
    //     expect(disconnectCalled).toBeTruthy();
    // });
});