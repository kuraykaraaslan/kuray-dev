import { NextRequest as OriginalNextRequest } from 'next/server'
import SafeUser from './types/SafeUser'

declare global {
    const THREE: typeof import('three');
    declare interface NextRequest extends OriginalNextRequest {
        // Optional + nullable: the auth middleware attaches a SafeUser on
        // authenticated requests and sets null for guests, while public routes
        // never receive one. Keeping it required broke Next 16's generated route
        // validators (a plain NextRequest is not assignable to one requiring `user`).
        user?: SafeUser | null
    }

    interface Window {
        maplibregl?: any
        THREE?: any
        OrbitControls?: any
    }
} 